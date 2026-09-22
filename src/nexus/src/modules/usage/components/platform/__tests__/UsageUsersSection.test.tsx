import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UsageUsersSection, {
  type UsageUsersSectionProps,
} from '../UsageUsersSection';
import type {
  UsageOrder,
  UsageSort,
  UsageUsersResponse,
  UsageUserRow,
} from '@/shared/types/usage';

// ---------------------------------------------------------------------------
// Mock @airqo/icons-react to plain <span> stubs so tests don't depend on
// SVG rendering in jsdom. Mirrors DataExportPreview.test.tsx.
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
    AqDownload01: stub('download'),
    AqLoading02: stub('loading'),
    AqSearchRefraction: stub('search'),
    AqXClose: stub('close'),
    AqChevronLeft: stub('chevron-left'),
    AqChevronRight: stub('chevron-right'),
    AqMessageCheckCircle: stub('check-circle'),
    AqMessageXCircle: stub('x-circle'),
    AqAlertTriangle: stub('alert-triangle'),
    AqAnnotationInfo: stub('info'),
    AqAlertCircle: stub('alert-circle'),
    AqEye: stub('eye'),
    AqEyeOff: stub('eye-off'),
    AqCheck: stub('check'),
    AqMinus: stub('minus'),
    AqUser03: stub('user'),
    AqMenu02: stub('menu'),
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
// Mock next/navigation — the shared Button component calls useRouter().
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

// ---------------------------------------------------------------------------
// Mock react-responsive — Button calls useMediaQuery(), which needs
// matchMedia (absent in jsdom). Always false (desktop) so button text
// is never hidden as sr-only.
// ---------------------------------------------------------------------------
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
const makeRow = (index: number): UsageUserRow => ({
  user_id: `user-${index}`,
  email: `user${index}@example.com`,
  name: `User ${index}`,
  active_days: 3,
  total_actions: 10,
  page_views: 4,
  api_calls: 6,
  sessions: 2,
  total_time_sec: 120,
  last_active_day: '2025-07-15',
  first_seen: '2025-07-01',
  last_seen: '2025-07-15',
  sparkline: [1, 3, 2, 5],
});

const makeData = (
  overrides: Partial<UsageUsersResponse> = {}
): UsageUsersResponse => ({
  month: '2025-07',
  scope: 'platform',
  basis: 'all users',
  page: 1,
  limit: 25,
  total: 120,
  pages: 5,
  sort: 'total_actions' satisfies UsageSort,
  order: 'desc' satisfies UsageOrder,
  users: [makeRow(1), makeRow(2)],
  ...overrides,
});

const makeProps = (
  overrides: Partial<UsageUsersSectionProps> = {}
): UsageUsersSectionProps => ({
  data: makeData(),
  isLoading: false,
  error: null,
  onRetry: jest.fn(),
  search: '',
  onSearchChange: jest.fn(),
  sort: 'total_actions',
  order: 'desc',
  onSortChange: jest.fn(),
  onOrderChange: jest.fn(),
  page: 1,
  pageSize: 25,
  onPageChange: jest.fn(),
  onPageSizeChange: jest.fn(),
  month: '2025-07',
  isExporting: false,
  exportError: null,
  onExport: jest.fn(),
  ...overrides,
});

describe('UsageUsersSection — parent-owned pagination', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('a stale data.page=5 cannot override parent page=1: summary shows page 1 and next advances to 2', async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();

    render(
      <UsageUsersSection
        {...makeProps({
          page: 1,
          onPageChange,
          // Placeholder/keepPreviousData can leave a stale response page on
          // screen while the parent has already reset to page 1.
          data: makeData({ page: 5 }),
        })}
      />
    );

    // Summary must reflect the parent-owned page, not the stale echo.
    expect(screen.getByText(/page 1 of 5/)).toBeInTheDocument();
    expect(screen.queryByText(/page 5 of/)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Next page' }));

    expect(onPageChange).toHaveBeenCalledTimes(1);
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('parent page=3 with stale data.page=1: summary shows page 3 and prev goes back to 2', async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();

    render(
      <UsageUsersSection
        {...makeProps({
          page: 3,
          onPageChange,
          data: makeData({ page: 1 }),
        })}
      />
    );

    expect(screen.getByText(/page 3 of 5/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Previous page' }));

    expect(onPageChange).toHaveBeenCalledTimes(1);
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
