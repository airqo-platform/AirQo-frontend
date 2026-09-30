import { render, screen } from '@testing-library/react';
import UsageRetentionSection, {
  type UsageRetentionSectionProps,
} from '../UsageRetentionSection';
import type { UsageCohort, UsageRetentionResponse } from '@/shared/types/usage';

// ---------------------------------------------------------------------------
// Mock @airqo/icons-react to plain <span> stubs so tests don't depend on
// SVG rendering in jsdom. Mirrors DataExportPreview.test.tsx (banner /
// EmptyState icons are pulled in via the shared ui barrel).
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
// DataExportPreview.test.tsx / DashboardCharts.test.tsx.
// ---------------------------------------------------------------------------
jest.mock('@/shared/components/ui/dialog', () => ({
  __esModule: true,
  default: () => null,
}));

// ---------------------------------------------------------------------------
// Mock next/navigation + react-responsive — the shared Button (error-retry
// path, EmptyState action) calls useRouter() and useMediaQuery().
// Mirrors DataExportPreview.test.tsx.
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

// ---------------------------------------------------------------------------
// Mock the redux selector hook the shared Card uses (state.theme) so the
// section can render without a react-redux Provider.
// ---------------------------------------------------------------------------
jest.mock('@/shared/hooks/redux', () => ({
  useAppSelector: (
    selector: (state: { theme: { interfaceStyle: string } }) => unknown
  ) => selector({ theme: { interfaceStyle: 'plain' } }),
  useAppDispatch: () => jest.fn(),
}));

// ---------------------------------------------------------------------------
// Minimal props / data factories
// ---------------------------------------------------------------------------
const makeCohort = (overrides: Partial<UsageCohort> = {}): UsageCohort => ({
  cohort: '2025-07',
  size: 1200,
  retention: [
    { offset: 0, month: '2025-07', active: 1200, rate_pct: 100 },
    { offset: 1, month: '2025-08', active: 510, rate_pct: 42.5 },
    { offset: 2, month: '2025-09', active: 0, rate_pct: null },
  ],
  ...overrides,
});

const makeData = (
  overrides: Partial<UsageRetentionResponse> = {}
): UsageRetentionResponse => ({
  scope: 'platform',
  cohort_basis: 'active users',
  months: 3,
  cohorts: [makeCohort()],
  ...overrides,
});

const makeProps = (
  overrides: Partial<UsageRetentionSectionProps> = {}
): UsageRetentionSectionProps => ({
  data: makeData(),
  isLoading: false,
  error: null,
  onRetry: jest.fn(),
  ...overrides,
});

describe('UsageRetentionSection — M+0 baseline', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('exposes an accessible cohort-size label at offset 0 and never renders 100.0%', () => {
    render(<UsageRetentionSection {...makeProps()} />);

    // The M+0 cell carries a screen-reader label naming the baseline size…
    expect(
      screen.getByRole('img', {
        name: /baseline cohort size: 1,200 users/i,
      })
    ).toBeInTheDocument();

    // …and the visible text is the size, not a tautological 100% retention.
    expect(screen.getByText('1,200')).toBeInTheDocument();
    expect(screen.queryByText('100.0%')).not.toBeInTheDocument();
  });

  it('renders a later-month rate as a percentage', () => {
    render(<UsageRetentionSection {...makeProps()} />);

    expect(
      screen.getByRole('img', { name: /42\.5% of cohort returned/i })
    ).toBeInTheDocument();
    expect(screen.getByText('42.5%')).toBeInTheDocument();
  });

  it('renders a nullable rate as an em dash with a No data label', () => {
    render(<UsageRetentionSection {...makeProps()} />);

    expect(screen.getByText('—')).toBeInTheDocument();
    expect(
      screen.getAllByRole('img', { name: 'No data' }).length
    ).toBeGreaterThan(0);
    expect(screen.queryByText('0.0%')).not.toBeInTheDocument();
  });
});
