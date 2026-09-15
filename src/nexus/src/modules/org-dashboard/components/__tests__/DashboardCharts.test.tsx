import React from 'react';
import { render, screen } from '@testing-library/react';
import type { UseChartManagementResult } from '@/modules/analytics/hooks/useChartManagement';
import type { ExplorerChartDraft } from '@/modules/analytics/utils/chartConfig';
import { CHART_LOAD_ERROR_MESSAGE } from '@/modules/analytics/constants';
import { DashboardCharts } from '../DashboardCharts';

jest.mock('@/modules/analytics/components/explorer/AnalyticsChartCard', () => ({
  AnalyticsChartCard: () => <div data-testid="chart-card" />,
}));

jest.mock('@/modules/analytics/components/explorer/ChartConfigDialog', () => ({
  ChartConfigDialog: () => null,
}));

jest.mock('@/shared/components/ui/dialog', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@airqo/icons-react', () => ({
  AqAlertCircle: () => null,
  AqTrash01: () => null,
}));

jest.mock('next/navigation', () => ({
  __esModule: true,
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

jest.mock('flowbite-react', () => ({
  __esModule: true,
  Spinner: () => <div data-testid="flowbite-spinner" />,
}));

const buildChartMgmt = (
  overrides: Partial<UseChartManagementResult> = {}
): UseChartManagementResult => ({
  charts: [],
  chartsLoading: false,
  chartsError: null,
  refetchCharts: jest.fn(),
  siteNames: new Map(),
  forecastChartIds: new Set(),
  dialogOpen: false,
  editingDraft: null,
  deleteDraft: null,
  isDeleteConfirming: false,
  saveError: null,
  isSaving: false,
  openCreate: jest.fn(),
  openEdit: jest.fn(),
  closeDialog: jest.fn(),
  handleSaveDraft: jest.fn(),
  handleRequestDelete: jest.fn(),
  cancelDelete: jest.fn(),
  confirmDelete: jest.fn(),
  handleDuplicate: jest.fn(),
  handleForecastToggle: jest.fn(),
  handleEditTitle: jest.fn(),
  handleChartTypeChange: jest.fn(),
  handleNamesResolved: jest.fn(),
  ...overrides,
});

describe('DashboardCharts error sanitization', () => {
  it('sanitizes a raw axios timeout message instead of rendering it verbatim', () => {
    const rawAxiosError = new Error('timeout of 30000ms exceeded');
    (rawAxiosError as { isAxiosError?: boolean }).isAxiosError = true;
    (rawAxiosError as { code?: string }).code = 'ECONNABORTED';

    render(
      <DashboardCharts
        groupId="org-group-1"
        chartMgmt={buildChartMgmt({
          chartsError: rawAxiosError as unknown as Error,
        })}
      />
    );

    // The fixed chart-load message renders...
    expect(screen.getByText(CHART_LOAD_ERROR_MESSAGE)).toBeInTheDocument();
    // ...and the raw axios string never reaches the UI.
    expect(
      screen.queryByText('timeout of 30000ms exceeded')
    ).not.toBeInTheDocument();
    // Retry action remains available.
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('sanitizes a raw axios network error', () => {
    const rawAxiosError = new Error('Network Error');
    (rawAxiosError as { isAxiosError?: boolean }).isAxiosError = true;
    (rawAxiosError as { code?: string }).code = 'ERR_NETWORK';

    render(
      <DashboardCharts
        groupId="org-group-1"
        chartMgmt={buildChartMgmt({
          chartsError: rawAxiosError as unknown as Error,
        })}
      />
    );

    expect(screen.getByText(CHART_LOAD_ERROR_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText('Network Error')).not.toBeInTheDocument();
  });

  it('never renders a backend diagnostic string — uses a fixed chart-load message', () => {
    // Simulate a preferencesService rejection whose message is a backend
    // diagnostic (the kind our sanitization now converts to a stable message).
    const backendDiagnostic = 'Backend exploded at line 42';
    const backendError = new Error(backendDiagnostic);

    render(
      <DashboardCharts
        groupId="org-group-1"
        chartMgmt={buildChartMgmt({
          chartsError: backendError as unknown as Error,
        })}
      />
    );

    // The backend diagnostic string must NOT reach the UI....
    expect(screen.queryByText(backendDiagnostic)).not.toBeInTheDocument();
    // ...the fixed, approved chart-load message IS rendered....
    expect(
      screen.getByText(
        /we could not load your charts right now\. please try again\./i
      )
    ).toBeInTheDocument();
    // ...and the Retry action remains available.
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('renders charts normally when there is no error', () => {
    const draft = { id: 'chart-1' } as ExplorerChartDraft;
    render(
      <DashboardCharts
        groupId="org-group-1"
        chartMgmt={buildChartMgmt({ charts: [draft] })}
      />
    );

    expect(screen.getByTestId('chart-card')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /retry/i })
    ).not.toBeInTheDocument();
  });
});
