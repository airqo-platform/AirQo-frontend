import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

const mockUseOrganizationReport = jest.fn();
const mockCohortContext = {
  organizationGroup: null,
  organizationGroupId: 'org-group-1',
  cohorts: [{ id: 'cohort-1', name: 'Makerere' }],
  cohortIds: ['cohort-1'],
  selectedCohortId: 'cohort-1',
  selectedCohort: { id: 'cohort-1', name: 'Makerere' },
  selectCohort: jest.fn(),
  isLoading: false,
  error: null,
  refetch: jest.fn(),
};

jest.mock('@/shared/providers/org-cohort-provider', () => ({
  useOrgCohortContextRequired: () => mockCohortContext,
}));

jest.mock('@/shared/providers/aqi-config-provider', () => ({
  useAqiConfig: () => ({ config: null, isLoading: false }),
}));

jest.mock('../hooks/useOrganizationReport', () => ({
  useOrganizationReport: (options: unknown) => {
    mockUseOrganizationReport(options);
    return {
      report: null,
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: jest.fn(),
    };
  },
}));

// The shared Button calls useRouter()/useMediaQuery(), which need the app
// router and a matchMedia stub that jsdom does not provide.
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

// The shared DatePicker renders through react-popper, which is unreliable in
// jsdom (see OrgCohortSelector.test.tsx). This stub keeps the contract the
// dashboard relies on — a controlled single-date value plus the min/max bounds
// it computes — and surfaces the bounds as data attributes so they can be
// asserted. The calendar's own day-disabling is covered by
// Calendar.selectableWindow.test.tsx.
jest.mock('@/shared/components/calendar', () => {
  const format = (date?: Date) =>
    date instanceof Date && !Number.isNaN(date.getTime())
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          '0'
        )}-${String(date.getDate()).padStart(2, '0')}`
      : '';

  const MockDatePicker = ({
    id,
    value,
    onChange,
    minDate,
    maxDate,
  }: {
    id?: string;
    value?: Date;
    onChange?: (value: Date) => void;
    minDate?: Date;
    maxDate?: Date;
  }) => (
    <input
      id={id}
      type="date"
      value={format(value)}
      data-min={format(minDate)}
      data-max={format(maxDate)}
      onChange={event => {
        const [year, month, dayOfMonth] = event.target.value
          .split('-')
          .map(Number);
        onChange?.(new Date(year, month - 1, dayOfMonth));
      }}
    />
  );

  return { DatePicker: MockDatePicker };
});

// The chart stack is irrelevant to the period controls and pulls in recharts.
jest.mock('@/shared/components/charts', () => ({
  ChartContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DynamicChart: () => null,
}));

jest.mock('@/modules/analytics', () => ({ AqiLegend: () => null }));

// Card reads the theme slice off the redux store; the period controls do not
// depend on it, so render the markup without the provider.
jest.mock('@/shared/components/ui/card', () => {
  const MockCard = ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  );
  return {
    Card: MockCard,
    CardHeader: MockCard,
    CardTitle: MockCard,
    CardDescription: MockCard,
    CardContent: MockCard,
    CardFooter: MockCard,
  };
});

import { OrganizationReportDashboard } from '../components/OrganizationReportDashboard';

// Fixed past dates: the future-date guard compares against the real clock, so a
// 2026-06 window stays in the past whenever the suite runs.
const START = '2026-06-01';
const CAP_END = '2026-07-01'; // START + 30 days = exactly 31 inclusive dates

const startPicker = () => screen.getByLabelText('From') as HTMLInputElement;
const endPicker = () => screen.getByLabelText('To') as HTMLInputElement;
const refreshButton = () =>
  screen.getByRole('button', { name: 'Refresh organization report' });

const pickDate = (input: HTMLInputElement, value: string) =>
  fireEvent.change(input, { target: { value } });

const lastRequest = () =>
  mockUseOrganizationReport.mock.calls.at(-1)?.[0] as {
    startTime: string;
    endTime: string;
    enabled: boolean;
  };

describe('OrganizationReportDashboard reporting period', () => {
  beforeEach(() => {
    mockUseOrganizationReport.mockClear();
  });

  it('uses the shared date picker twice, not raw date inputs', () => {
    render(<OrganizationReportDashboard organizationTitle="Acme Org" />);

    const period = screen.getByRole('group', { name: 'Reporting period' });
    expect(period).toBeInTheDocument();
    expect(startPicker()).toBeInTheDocument();
    expect(endPicker()).toBeInTheDocument();
    // The range calendar's presets sidebar is gone.
    expect(screen.queryByText('Last 90 days')).not.toBeInTheDocument();
    expect(screen.queryByText('This month')).not.toBeInTheDocument();
    expect(screen.queryByText('Select date range')).not.toBeInTheDocument();
  });

  it('defaults to a period that already fits the 31-day limit', () => {
    render(<OrganizationReportDashboard organizationTitle="Acme Org" />);

    const days =
      (Date.parse(`${endPicker().value}T00:00:00Z`) -
        Date.parse(`${startPicker().value}T00:00:00Z`)) /
        86_400_000 +
      1;
    expect(days).toBeGreaterThan(0);
    expect(days).toBeLessThanOrEqual(31);
    expect(
      screen.getByText(`${days} of 31 days selected.`)
    ).toBeInTheDocument();
    expect(lastRequest().enabled).toBe(true);
  });

  it('caps the end picker at start + 30 days so the calendar cannot exceed the limit', () => {
    render(<OrganizationReportDashboard organizationTitle="Acme Org" />);

    pickDate(startPicker(), START);

    expect(endPicker()).toHaveAttribute('data-max', CAP_END);
    expect(endPicker()).toHaveAttribute('data-min', START);
    // The start can never pass the end, and never a future date. Moving the
    // start back leaves the end on today, so today is the start's ceiling.
    expect(startPicker()).toHaveAttribute('data-max', endPicker().value);
  });

  it('blocks the report and explains the limit when the period runs past 31 days', () => {
    render(<OrganizationReportDashboard organizationTitle="Acme Org" />);

    // Moving the start back leaves the end on today, which is now more than
    // 31 dates away. The calendar greys those days out, so the guard has to
    // reject the selection too.
    pickDate(startPicker(), START);

    expect(
      screen.getByText(/choose a period of 31 days or fewer/i)
    ).toBeInTheDocument();
    expect(screen.queryByText(/of 31 days selected\./)).not.toBeInTheDocument();
    expect(lastRequest().enabled).toBe(false);
    expect(refreshButton()).toBeDisabled();
  });

  it('accepts exactly 31 days and requests the selected local calendar days', () => {
    render(<OrganizationReportDashboard organizationTitle="Acme Org" />);

    pickDate(startPicker(), START);
    pickDate(endPicker(), CAP_END);

    expect(screen.getByText('31 of 31 days selected.')).toBeInTheDocument();
    expect(
      screen.queryByText(/choose a period of 31 days or fewer/i)
    ).not.toBeInTheDocument();
    expect(lastRequest()).toMatchObject({
      enabled: true,
      startTime: '2026-06-01T00:00:00.000Z',
      endTime: '2026-07-01T23:59:59.999Z',
    });
    expect(refreshButton()).not.toBeDisabled();
  });

  it('drags the end along when the start is moved past it', () => {
    render(<OrganizationReportDashboard organizationTitle="Acme Org" />);

    pickDate(endPicker(), START);
    expect(endPicker().value).toBe(START);

    // A start after the end must never produce an inverted range.
    pickDate(startPicker(), '2026-06-10');
    expect(startPicker().value).toBe('2026-06-10');
    expect(endPicker().value).toBe('2026-06-10');
  });

  it('states the month limit in the info banner', () => {
    render(<OrganizationReportDashboard organizationTitle="Acme Org" />);

    expect(
      screen.getByText(/single period of up to 31 days/i)
    ).toBeInTheDocument();
    expect(screen.queryByText(/92 days/i)).not.toBeInTheDocument();
  });
});
