import { act, render } from '@testing-library/react';

const mockIsGoogleTranslationActive = jest.fn().mockReturnValue(false);

jest.mock('@/lib/utils/googleTranslate', () => ({
  isGoogleTranslationActive: mockIsGoogleTranslationActive,
}));

jest.mock('@/lib/utils/logger', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock('@/components/ui/CustomButton', () => ({
  __esModule: true,
  default: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
}));

import logger from '@/lib/utils/logger';

import ErrorBoundary from '../ErrorBoundary';

const mockLogger = logger as jest.MockedObject<typeof logger>;

const CHUNK_RELOAD_KEY = 'chunk_reload_ts';

const SteadyChild = () => <div>steady state content</div>;

const ChunkNameError = () => {
  const error = new Error('Loading chunk 9408 failed.');
  error.name = 'ChunkLoadError';
  throw error;
};

const ChunkMessageError = () => {
  throw new Error('Loading chunk 7891 failed.\n(timeout)');
};

const CssChunkMessageError = () => {
  throw new Error('Loading CSS chunk 1052 failed.');
};

const GenericError = () => {
  throw new Error('regular application failure');
};

const GoogleTranslateDomError = () => {
  throw new Error(
    "Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
  );
};

/**
 * Mounts the boundary with a healthy child, then swaps in the crashing child —
 * mirroring how a lazy chunk fails at runtime.
 */
const renderThenCrash = (crasher: React.ReactNode) => {
  const utils = render(
    <ErrorBoundary>
      <SteadyChild />
    </ErrorBoundary>,
  );
  act(() => {
    utils.rerender(<ErrorBoundary>{crasher}</ErrorBoundary>);
  });
  return utils;
};

describe('ErrorBoundary', () => {
  let reloadMock: jest.Mock;
  let originalLocation: Location;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();

    reloadMock = jest.fn();
    originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      value: { href: 'https://example.com/home', reload: reloadMock },
      writable: true,
      configurable: true,
    });

    sessionStorage.clear();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.useRealTimers();
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
    consoleErrorSpy.mockRestore();
    jest.clearAllMocks();
  });

  const firePendingReload = () => {
    act(() => {
      jest.advanceTimersByTime(1);
    });
  };

  it('renders children normally when no error occurs', () => {
    const { container } = render(
      <ErrorBoundary>
        <SteadyChild />
      </ErrorBoundary>,
    );

    expect(container.textContent).toContain('steady state content');
    expect(reloadMock).not.toHaveBeenCalled();
    expect(mockLogger.error).not.toHaveBeenCalled();
  });

  describe('ChunkLoadError mitigation', () => {
    it('triggers exactly one silent reload for a ChunkLoadError by name and skips logger.error', () => {
      const { container } = renderThenCrash(<ChunkNameError />);

      // Blank UI while the silent reload is scheduled but has not fired yet
      expect(container.textContent).toBe('');

      firePendingReload();

      expect(reloadMock).toHaveBeenCalledTimes(1);
      expect(mockLogger.error).not.toHaveBeenCalled();
      // No error UI while the silent reload is pending — blank page only
      expect(container.textContent).toBe('');
      expect(sessionStorage.getItem(CHUNK_RELOAD_KEY)).not.toBeNull();
    });

    it('detects chunk errors by message pattern ("Loading chunk N failed")', () => {
      renderThenCrash(<ChunkMessageError />);

      firePendingReload();

      expect(reloadMock).toHaveBeenCalledTimes(1);
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('detects CSS chunk errors by message pattern', () => {
      renderThenCrash(<CssChunkMessageError />);

      firePendingReload();

      expect(reloadMock).toHaveBeenCalledTimes(1);
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('does not reload again for a second ChunkLoadError within the TTL window and never logs to Slack', () => {
      // First crash: silent reload is scheduled
      const first = renderThenCrash(<ChunkNameError />);
      firePendingReload();
      expect(reloadMock).toHaveBeenCalledTimes(1);
      expect(first.container.textContent).toBe('');

      // Reload "fails" to navigate; a new page view crashes again 2s later —
      // still inside the 10s TTL window, past the 1s UI settle window
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      const second = render(
        <ErrorBoundary>
          <ChunkNameError />
        </ErrorBoundary>,
      );

      expect(reloadMock).toHaveBeenCalledTimes(1);
      expect(mockLogger.error).not.toHaveBeenCalled();
      // Reload budget exhausted: normal error UI is shown so the user can recover
      expect(second.container.textContent).toContain(
        'Oops! Something went wrong',
      );
      expect(mockLogger.debug).toHaveBeenCalled();
    });

    it('shows the error UI (never a blank page) when a crash lands past the settle window with no reload in flight', () => {
      // First crash schedules the single allowed reload; it fires but the
      // navigation is blocked, leaving the user on the same page.
      renderThenCrash(<ChunkNameError />);
      firePendingReload();
      expect(reloadMock).toHaveBeenCalledTimes(1);

      // 800ms later: inside the 10s reload TTL (budget spent, no new reload
      // allowed) and inside the old 1s settle window. The boundary must fall
      // through to the standard error UI instead of rendering null.
      act(() => {
        jest.advanceTimersByTime(800);
      });

      const second = render(
        <ErrorBoundary>
          <ChunkNameError />
        </ErrorBoundary>,
      );

      expect(reloadMock).toHaveBeenCalledTimes(1);
      expect(second.container.textContent).toContain(
        'Oops! Something went wrong',
      );
      expect(mockLogger.error).not.toHaveBeenCalled();
      expect(mockLogger.debug).toHaveBeenCalled();
    });
  });

  describe('non-ChunkLoadError behavior (unchanged)', () => {
    it('shows the error UI and logs via logger.error without reloading', () => {
      const { container } = renderThenCrash(<GenericError />);

      firePendingReload();

      expect(reloadMock).not.toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalledTimes(1);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'React Error Boundary caught an error',
        expect.any(Error),
        expect.objectContaining({
          errorDetails: expect.objectContaining({ name: 'Error' }),
        }),
      );
      expect(container.textContent).toContain('Oops! Something went wrong');
    });
  });

  describe('Google Translate silent reload (existing behavior)', () => {
    it('still silently reloads for Google Translate DOM errors', () => {
      mockIsGoogleTranslationActive.mockReturnValue(true);

      renderThenCrash(<GoogleTranslateDomError />);

      firePendingReload();

      expect(reloadMock).toHaveBeenCalledTimes(1);
      expect(sessionStorage.getItem('gt_reload_ts')).not.toBeNull();
    });
  });
});
