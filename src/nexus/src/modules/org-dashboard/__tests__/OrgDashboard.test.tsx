import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { themeReducer } from '@/modules/themes';
import uiReducer from '@/shared/store/uiSlice';
import userReducer from '@/shared/store/userSlice';
import insightsReducer from '@/shared/store/insightsSlice';
import cohortReducer from '@/shared/store/cohortSlice';
import mapSettingsReducer from '@/shared/store/mapSettingsSlice';
import selectedLocationReducer from '@/shared/store/selectedLocationSlice';
import analyticsReducer from '@/modules/analytics/store/analyticsSlice';
import type { UseChartManagementResult } from '@/modules/analytics/hooks/useChartManagement';
import type { ExplorerChartDraft } from '@/modules/analytics/utils/chartConfig';

// ── Mutable mock state ─────────────────────────────────────────────────────
// Jest hoists the mock factories above the imports; `mock`-prefixed bindings
// are the one exception allowed inside a factory, and OrgDashboard is
// required lazily at the bottom, after this line has run.
let mockCharts: ExplorerChartDraft[] = [];

jest.mock('@/shared/hooks/useUser', () => ({
  useUser: () => ({
    activeGroup: { id: 'org-group-1' },
    isLoading: false,
  }),
}));

jest.mock('@/shared/hooks/useOrgGroup', () => ({
  useOrgGroup: () => ({
    organizationGroup: { id: 'org-group-1', title: 'Acme Org' },
    organizationGroupId: 'org-group-1',
    isInitialLoading: false,
  }),
}));

jest.mock('posthog-js/react', () => ({
  usePostHog: () => ({ capture: jest.fn() }),
}));

jest.mock('@/shared/providers/aqi-config-provider', () => ({
  useAqiConfig: () => ({ config: null }),
}));

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/modules/analytics/hooks/useChartManagement', () => ({
  useChartManagement: (): UseChartManagementResult => ({
    charts: mockCharts,
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
  }),
}));

jest.mock('@/modules/ai/components/AiDrawerTrigger', () => ({
  AiDrawerTrigger: () => <button type="button" data-testid="ai-trigger" />,
}));

jest.mock('@/modules/analytics', () => ({
  AqiLegend: () => <div data-testid="aqi-legend" />,
}));

jest.mock('@/modules/analytics/components/comparison', () => ({
  ComparisonView: () => <div data-testid="comparison-view" />,
}));

jest.mock('../components/SavedPreferencesSection', () => ({
  SavedPreferencesSection: () => <div data-testid="saved-preferences" />,
}));

jest.mock('../components/DashboardCharts', () => ({
  DashboardCharts: () => <div data-testid="dashboard-charts" />,
}));

import { OrgDashboard } from '../OrgDashboard';

const STORAGE_KEY = 'nexus:org-dashboard:analysis-tab';

describe('OrgDashboard analysis tabs', () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockCharts = [{ id: 'chart-1' } as ExplorerChartDraft];
  });

  const renderDashboard = () => {
    const store = configureStore({
      reducer: {
        theme: themeReducer,
        ui: uiReducer,
        user: userReducer,
        insights: insightsReducer,
        cohorts: cohortReducer,
        mapSettings: mapSettingsReducer,
        selectedLocation: selectedLocationReducer,
        analytics: analyticsReducer,
      },
    });
    return render(
      <Provider store={store}>
        <OrgDashboard organizationSlug="acme" />
      </Provider>
    );
  };

  it('renders the trends children + legend and NOT ComparisonView by default', () => {
    renderDashboard();

    expect(screen.getByTestId('saved-preferences')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-charts')).toBeInTheDocument();
    expect(screen.getByTestId('aqi-legend')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /add chart/i })
    ).toBeInTheDocument();
    expect(screen.getByTestId('ai-trigger')).toBeInTheDocument();
    expect(screen.queryByTestId('comparison-view')).not.toBeInTheDocument();
  });

  it('renders ComparisonView and drops the legend/trends children when "Comparison" is clicked', async () => {
    const user = userEvent.setup();
    renderDashboard();

    await user.click(screen.getByText('Comparison'));

    expect(screen.getByTestId('comparison-view')).toBeInTheDocument();
    expect(screen.queryByTestId('saved-preferences')).not.toBeInTheDocument();
    expect(screen.queryByTestId('dashboard-charts')).not.toBeInTheDocument();
    expect(screen.queryByTestId('aqi-legend')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /add chart/i })
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('ai-trigger')).not.toBeInTheDocument();
  });

  it('persists the tab choice to localStorage on change', async () => {
    const user = userEvent.setup();
    renderDashboard();

    await user.click(screen.getByText('Comparison'));

    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('comparison');
  });

  it('lazy-inits the tab from localStorage (persisted choice survives reload)', () => {
    window.localStorage.setItem(STORAGE_KEY, 'comparison');
    renderDashboard();

    expect(screen.getByTestId('comparison-view')).toBeInTheDocument();
    expect(screen.queryByTestId('saved-preferences')).not.toBeInTheDocument();
  });

  it('falls back to trends for an invalid stored value', () => {
    window.localStorage.setItem(STORAGE_KEY, 'garbage');
    renderDashboard();

    expect(screen.getByTestId('aqi-legend')).toBeInTheDocument();
    expect(screen.queryByTestId('comparison-view')).not.toBeInTheDocument();
  });

  it('switches back to trends and restores the trends-only controls', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(STORAGE_KEY, 'comparison');
    renderDashboard();

    await user.click(screen.getByText('Trends'));

    expect(screen.getByTestId('aqi-legend')).toBeInTheDocument();
    expect(screen.queryByTestId('comparison-view')).not.toBeInTheDocument();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('trends');
  });
});
