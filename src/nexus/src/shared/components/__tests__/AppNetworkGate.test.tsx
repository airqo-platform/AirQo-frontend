import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { SWRConfig, type State } from 'swr';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  probeBackend,
  recordBackendUnreachable,
  resetBackendStatus,
} from '@/shared/lib/backendStatus';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const routerRefresh = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: routerRefresh,
    prefetch: jest.fn(),
  }),
}));

// Partially mock backendStatus: probeBackend is controlled by tests, the
// pub/sub tracker (subscribeBackendStatus / getBackendStatus) stays real.
jest.mock('@/shared/lib/backendStatus', () => {
  const actual = jest.requireActual('@/shared/lib/backendStatus');
  return {
    ...actual,
    probeBackend: jest.fn(),
  };
});

const mockProbeBackend = probeBackend as jest.Mock;

// AppNetworkGate imports @/shared/components/ui, which transitively loads
// flowbite-react (ESM) that Jest cannot parse under the repo's
// transformIgnorePatterns. Stub the two UI primitives the gate uses so the
// component tree can be exercised without that dependency chain.
jest.mock('@/shared/components/ui', () => ({
  WarningBanner: (props: {
    title?: string;
    message?: string;
    actions?: React.ReactNode;
  }) => (
    <div data-testid="warning-banner">
      <span data-testid="banner-title">{props.title}</span>
      <span data-testid="banner-message">{props.message}</span>
      {props.actions}
    </div>
  ),
  Button: (props: {
    children?: React.ReactNode;
    onClick?: () => void;
    size?: string;
    variant?: string;
  }) => (
    <button data-testid="banner-button" onClick={props.onClick}>
      {props.children}
    </button>
  ),
}));

// eslint-disable-next-line import/first
import AppNetworkGate from '../AppNetworkGate';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const setOnline = (online: boolean) => {
  Object.defineProperty(navigator, 'onLine', {
    configurable: true,
    get: () => online,
  });
};

const setVisibility = (visible: boolean) => {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => (visible ? 'visible' : 'hidden'),
  });
};

const goOffline = () => {
  act(() => {
    setOnline(false);
    window.dispatchEvent(new Event('offline'));
  });
};

const goOnline = () => {
  act(() => {
    setOnline(true);
    window.dispatchEvent(new Event('online'));
  });
};

const dispatchVisibilityChange = (visible: boolean) => {
  act(() => {
    setVisibility(visible);
    document.dispatchEvent(new Event('visibilitychange'));
  });
};

// Advance fake timers while flushing microtasks so the async recovery loop
// (setTimeout backoff + awaited probes) makes progress.
const advanceTimers = async (totalMs: number, stepMs = 1000) => {
  let advanced = 0;
  while (advanced < totalMs) {
    const step = Math.min(stepMs, totalMs - advanced);
    jest.advanceTimersByTime(step);
    advanced += step;
    for (let i = 0; i < 10; i++) {
      await Promise.resolve();
    }
  }
};

// ---------------------------------------------------------------------------
// Test harness
// ---------------------------------------------------------------------------

let cacheMap: Map<string, State<unknown, unknown>>;

const renderGate = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <SWRConfig value={{ provider: () => cacheMap, dedupingInterval: 0 }}>
        <AppNetworkGate>
          <div>child</div>
        </AppNetworkGate>
      </SWRConfig>
    </QueryClientProvider>
  );
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AppNetworkGate (issue #4023)', () => {
  beforeEach(() => {
    cacheMap = new Map();
    setOnline(true);
    setVisibility(true);
    mockProbeBackend.mockReset();
    routerRefresh.mockClear();
    resetBackendStatus();
  });

  it('seeded cache entry with data survives a recovery refresh (no cache wipe)', async () => {
    setOnline(true);
    mockProbeBackend.mockResolvedValue(true);
    renderGate();

    const key = 'test-key';
    cacheMap.set(key, {
      data: ['hello'],
      error: undefined,
      isLoading: false,
      isValidating: false,
    });

    // Trigger the offline -> online reconnect path.
    goOffline();
    goOnline();

    // Recovery must actually run (probe happens) ...
    await waitFor(() => {
      expect(mockProbeBackend).toHaveBeenCalled();
    });
    // ... and the seeded data must survive (regression: the old
    // `mutate(() => true, undefined, { revalidate: true })` form wiped every
    // matched key to `data: undefined`).
    expect(cacheMap.get(key)?.data).toEqual(['hello']);
  });

  it('recovery runs on visibilitychange when a cached key is in an error state', async () => {
    setOnline(true);
    setVisibility(true);
    mockProbeBackend.mockResolvedValue(true);
    renderGate();

    cacheMap.set('error-key', {
      error: new Error('boom'),
      data: undefined,
      isLoading: false,
      isValidating: false,
    });

    dispatchVisibilityChange(true);

    await waitFor(() => {
      expect(mockProbeBackend).toHaveBeenCalled();
    });
    // Recovery reached refreshCachedData (probe succeeded).
    await waitFor(() => {
      expect(routerRefresh).toHaveBeenCalled();
    });
  });

  it('no refresh happens when the probe fails and retries are exhausted', async () => {
    setOnline(true);
    setVisibility(true);
    mockProbeBackend.mockResolvedValue(false);
    renderGate();

    jest.useFakeTimers();
    try {
      goOffline();
      goOnline();
      // PROBE_BACKOFF_MS = [0, 5000, 15000, 30000, 60000] -> exhaust all 5.
      await advanceTimers(111_000);
    } finally {
      jest.useRealTimers();
    }

    expect(mockProbeBackend).toHaveBeenCalledTimes(5);
    expect(routerRefresh).not.toHaveBeenCalled();
  });

  it('recovery does not run while the document is hidden', async () => {
    setOnline(true);
    setVisibility(false);
    mockProbeBackend.mockResolvedValue(true);
    renderGate();

    goOffline();
    goOnline();

    // Allow microtasks to flush — runRecovery returns early while hidden.
    for (let i = 0; i < 10; i++) {
      await Promise.resolve();
    }

    expect(mockProbeBackend).not.toHaveBeenCalled();
    expect(routerRefresh).not.toHaveBeenCalled();
  });

  it('manual outage retry refreshes cached data after successful probe', async () => {
    setOnline(true);
    setVisibility(true);
    mockProbeBackend.mockResolvedValue(true);
    renderGate();

    // Drive backendStatus to 'outage' (OUTAGE_FAILURE_THRESHOLD = 2).
    recordBackendUnreachable('test1');
    recordBackendUnreachable('test2');

    // Wait for the overlay to appear (OUTAGE_APPEAR_DELAY_MS = 1000ms).
    await waitFor(
      () => {
        expect(screen.getByText('Retry now')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Clear calls made by the auto-probe so we can assert on the manual retry.
    mockProbeBackend.mockClear();
    routerRefresh.mockClear();

    // Click "Retry now" — handleRetry probes, then refreshes on success.
    await act(async () => {
      screen.getByText('Retry now').click();
    });

    // Probe was called and refresh ran.
    await waitFor(() => {
      expect(mockProbeBackend).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(routerRefresh).toHaveBeenCalled();
    });
  });
});
