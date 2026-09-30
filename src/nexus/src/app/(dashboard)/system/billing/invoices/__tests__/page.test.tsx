import React from 'react';
import { render, screen, within } from '@testing-library/react';
import InvoicesPage from '../page';
import {
  useBillingList,
  useBillingQuery,
} from '@/modules/system-billing/lib/hooks';

// flowbite-react ships ESM-only and cannot be parsed by ts-jest (same stub as
// the ExportUsersButton tests); the shared UI barrel and the system-billing
// barrel both re-export components that import its Tooltip.
jest.mock('flowbite-react', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mutable per-test query string; the `mock` prefix keeps it referenceable
// from the hoisted module factory.
let mockSearchString = '';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/system/billing/invoices',
  useSearchParams: () => new URLSearchParams(mockSearchString),
}));

// Button calls useMediaQuery(), which needs matchMedia (absent in jsdom).
// Same stub as UsageUsersSection.test.tsx — always false (desktop).
jest.mock('react-responsive', () => ({
  useMediaQuery: () => false,
}));

// The shared Card reads state.theme through useAppSelector; render without a
// react-redux Provider. Same stub as UsageUsersSection.test.tsx.
jest.mock('@/shared/hooks/redux', () => ({
  useAppSelector: (
    selector: (state: { theme: { interfaceStyle: string } }) => unknown
  ) => selector({ theme: { interfaceStyle: 'plain' } }),
  useAppDispatch: () => jest.fn(),
}));

// The whole point of this test: read the `defaultFilters` argument the page
// passes to useBillingList. The rest of the hooks surface is inert — the page
// renders its empty state when the query returns nothing.
jest.mock('@/modules/system-billing/lib/hooks', () => ({
  useBillingList: jest.fn(),
  useBillingQuery: jest.fn(),
  toPaginationProps: jest.fn(() => ({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
    onPageChange: jest.fn(),
    onPageSizeChange: jest.fn(),
  })),
}));

const useBillingListMock = useBillingList as jest.Mock;
const useBillingQueryMock = useBillingQuery as jest.Mock;

const getStatusTabs = () =>
  within(screen.getByRole('radiogroup', { name: 'Filter invoices by status' }));

beforeEach(() => {
  jest.clearAllMocks();
  mockSearchString = '';
  // Mirror the real hook: filters state starts as defaultFilters.
  useBillingListMock.mockImplementation(
    (options: { defaultFilters?: Record<string, unknown> }) => ({
      filters: options.defaultFilters ?? {},
      params: { ...(options.defaultFilters ?? {}) },
      searchInput: '',
      setSearchInput: jest.fn(),
      setFilter: jest.fn(),
      page: 1,
      pageSize: 10,
      onPageChange: jest.fn(),
      onPageSizeChange: jest.fn(),
    })
  );
  useBillingQueryMock.mockReturnValue({
    data: undefined,
    error: undefined,
    isLoading: false,
    isValidating: false,
    mutate: jest.fn(),
  });
});

describe('InvoicesPage ?status= deep-link', () => {
  it('passes no status filter through when the deep-link value is unknown', () => {
    mockSearchString = 'status=foo';

    render(<InvoicesPage />);

    expect(useBillingListMock).toHaveBeenCalledWith(
      expect.objectContaining({ defaultFilters: {} })
    );
    // The tab group still has an active option ("All"), not none at all.
    expect(getStatusTabs().getByRole('radio', { name: 'All' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
  });

  it('passes a known deep-link value through as the status filter', () => {
    mockSearchString = 'status=open';

    render(<InvoicesPage />);

    expect(useBillingListMock).toHaveBeenCalledWith(
      expect.objectContaining({ defaultFilters: { status: ['open'] } })
    );
    expect(
      getStatusTabs().getByRole('radio', { name: 'Open' })
    ).toHaveAttribute('aria-checked', 'true');
  });

  it('passes no status filter when the deep-link is absent', () => {
    render(<InvoicesPage />);

    expect(useBillingListMock).toHaveBeenCalledWith(
      expect.objectContaining({ defaultFilters: {} })
    );
  });
});
