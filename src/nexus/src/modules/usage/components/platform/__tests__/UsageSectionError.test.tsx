import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UsageSectionError from '../UsageSectionError';

// ---------------------------------------------------------------------------
// Mock @airqo/icons-react to plain <span> stubs so tests don't depend on
// SVG rendering in jsdom. Mirrors UsageRetentionSection.test.tsx.
// ---------------------------------------------------------------------------
jest.mock('@airqo/icons-react', () => {
  const stub = (name: string) => {
    const C = ({ className }: Record<string, unknown>) => (
      <span data-testid={`icon-${name}`} className={className as string} />
    );
    C.displayName = name;
    return C;
  };
  return {
    AqLoading02: stub('loading'),
    AqSearchRefraction: stub('search'),
    AqXClose: stub('close'),
    AqMessageCheckCircle: stub('check-circle'),
    AqMessageXCircle: stub('x-circle'),
    AqAlertTriangle: stub('alert-triangle'),
    AqAnnotationInfo: stub('info'),
  };
});

// ---------------------------------------------------------------------------
// Mock the dialog module — the shared ui barrel re-exports it and dialog.tsx
// pulls in flowbite-react, whose ESM deps Jest can't transform. Mirrors
// UsageRetentionSection.test.tsx.
// ---------------------------------------------------------------------------
jest.mock('@/shared/components/ui/dialog', () => ({
  __esModule: true,
  default: () => null,
}));

// ---------------------------------------------------------------------------
// Mock next/navigation + react-responsive — the shared Button calls
// useRouter() and useMediaQuery(). Mirrors UsageRetentionSection.test.tsx.
// ---------------------------------------------------------------------------
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('react-responsive', () => ({
  useMediaQuery: () => false,
}));

describe('UsageSectionError', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the section-specific title/message and retries via the Retry button', async () => {
    const user = userEvent.setup();
    const onRetry = jest.fn();

    render(
      <UsageSectionError
        title="Failed to load retention"
        message="boom"
        onRetry={onRetry}
      />
    );

    expect(screen.getByText('Failed to load retention')).toBeInTheDocument();
    expect(screen.getByText('boom')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('supports an action label override (stale banner uses "Refresh")', async () => {
    const user = userEvent.setup();
    const onRetry = jest.fn();

    render(
      <UsageSectionError
        title="Showing stale usage overview"
        message="stale"
        onRetry={onRetry}
        actionLabel="Refresh"
      />
    );

    await user.click(screen.getByRole('button', { name: 'Refresh' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole('button', { name: 'Retry' })
    ).not.toBeInTheDocument();
  });

  it('stacked layout renders the banner and a sibling retry button (page-level error)', async () => {
    const user = userEvent.setup();
    const onRetry = jest.fn();

    const { container } = render(
      <UsageSectionError
        stacked
        title="Failed to load Usage dashboard"
        message="network down"
        onRetry={onRetry}
      />
    );

    const banner = screen.getByRole('alert');
    const retryButton = screen.getByRole('button', { name: 'Retry' });

    // Sibling layout: the button lives outside the banner (space-y-4 column),
    // unlike the default inline actions row.
    expect(banner.contains(retryButton)).toBe(false);
    expect(container.firstChild).toBeInstanceOf(HTMLElement);

    await user.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
