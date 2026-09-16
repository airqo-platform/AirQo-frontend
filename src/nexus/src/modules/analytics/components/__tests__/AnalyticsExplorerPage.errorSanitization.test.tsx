import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { themeReducer } from '@/modules/themes';
import analyticsReducer from '@/modules/analytics/store/analyticsSlice';
import type { UseChartManagementResult } from '@/modules/analytics/hooks/useChartManagement';

let mockChartsError: unknown = null;
let mockChartsLoading = false;

jest.mock('@/shared/hooks/useUser', () => ({
  useUser: () => ({
    user: { id: 'user-1' },
    activeGroup: { id: 'group-1' },
    isLoading: false,
  }),
}));

jest.mock('@/shared/hooks/useOrgGroup', () => ({
  useOrgGroup: () => ({
    organizationGroup: null,
    organizationGroupId: '',
    groupId: 'group-1',
    isInitialLoading: false,
  }),
}));

jest.mock('posthog-js/react', () => ({
  usePostHog: () => ({ capture: jest.fn() }),
}));

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

jest.mock('@/shared/providers/aqi-config-provider', () => ({
  useAqiConfig: () => ({ config: null, isLoading: false }),
}));

jest.mock('@/modules/analytics/hooks/useChartManagement', () => ({
  useChartManagement: (): UseChartManagementResult => ({
    charts: [],
    chartsLoading: mockChartsLoading,
    chartsError: mockChartsError,
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
  }),
}));

jest.mock('@/modules/analytics/components/explorer/AnalyticsChartCard', () => ({
  AnalyticsChartCard: () => <div data-testid="chart-card" />,
}));

jest.mock('@/modules/analytics/components/explorer/ChartConfigDialog', () => ({
  ChartConfigDialog: () => null,
}));

jest.mock('@/modules/analytics/components/explorer/ChartsOverviewView', () => ({
  ChartsOverviewView: () => <div data-testid="charts-overview" />,
}));

jest.mock('@/modules/analytics/components/comparison', () => ({
  ComparisonView: () => <div data-testid="comparison-view" />,
}));

jest.mock('@/modules/ai/components/AiDrawerTrigger', () => ({
  AiDrawerTrigger: () => null,
}));

jest.mock('@/modules/ai/context/ai-page-context', () => ({
  AiPageContextProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

jest.mock('@airqo/icons-react', () => ({
  AqAlertCircle: () => null,
  AqMessageCheckCircle: () => null,
  AqMessageXCircle: () => null,
  AqAlertTriangle: () => null,
  AqAnnotationInfo: () => null,
  AqTrash01: () => null,
  AqPlus: () => null,
  AqLayoutGrid01: () => null,
  AqList: () => null,
}));

jest.mock('flowbite-react', () => ({
  __esModule: true,
  Spinner: () => <div data-testid="flowbite-spinner" />,
}));

import { AnalyticsExplorerPage } from '../AnalyticsExplorerPage';

const renderPage = (error: unknown = null) => {
  mockChartsError = error;
  mockChartsLoading = false;
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const store = configureStore({
    reducer: {
      theme: themeReducer,
      analytics: analyticsReducer,
    },
  });
  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AnalyticsExplorerPage />
      </QueryClientProvider>
    </Provider>
  );
};

describe('AnalyticsExplorerPage chart-load error sanitization', () => {
  it('never renders a backend diagnostic string — uses a fixed chart-load message', () => {
    const backendDiagnostic = 'Backend exploded at line 42';
    const backendError = new Error(backendDiagnostic);

    renderPage(backendError);

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
});
