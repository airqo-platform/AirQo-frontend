import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { store } from '@/shared/store';
import type { ExplorerChartDraft } from '@/modules/analytics/utils/chartConfig';

// The card reads chart data through the analytics hooks barrel — return
// inert data so no network/query machinery is involved.
jest.mock('@/modules/analytics/hooks', () => ({
  useAnalyticsChartData: () => ({
    chartData: [],
    isLoading: false,
    isRefreshing: false,
    error: null,
    refresh: jest.fn(),
  }),
}));

jest.mock('@/shared/providers/aqi-config-provider', () => ({
  useAqiConfig: () => ({ config: null }),
}));

// Forecast queries stay disabled (forecastEnabled=false) but the service is
// imported at module level — stub it.
jest.mock('@/shared/services/deviceService', () => ({
  deviceService: { getDailyForecast: jest.fn() },
}));

// flowbite-react ships ESM-only and cannot be parsed by ts-jest; the render
// tree only needs the component surface, never a real tooltip.
jest.mock('flowbite-react', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Shared UI Button uses the Next router; no router exists in unit tests.
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

// eslint-disable-next-line import/first
import { AnalyticsChartCard } from '../AnalyticsChartCard';

const makeDraft = (
  overrides: Partial<ExplorerChartDraft> = {}
): ExplorerChartDraft => ({
  id: 'chart-1',
  fieldId: 1,
  title: 'Weekly PM2.5',
  subtitle: '',
  chartType: 'Line',
  pollutant: 'pm2_5',
  frequency: 'daily',
  startDate: '2026-08-01T00:00:00.000Z',
  endDate: '2026-08-08T23:59:59.999Z',
  siteIds: ['site-1'],
  siteNames: { 'site-1': 'Kampala Site' },
  color: null,
  locationColors: [],
  themeColors: false,
  referenceStandard: 'WHO',
  showLegend: true,
  showGrid: true,
  showTooltip: true,
  referenceLines: [],
  ...overrides,
});

const renderCard = (
  props: Partial<React.ComponentProps<typeof AnalyticsChartCard>> = {}
) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AnalyticsChartCard
          draft={makeDraft()}
          groupId="group-1"
          siteNames={new Map([['site-1', 'Kampala Site']])}
          forecastEnabled={false}
          onForecastToggle={() => {}}
          onEdit={() => {}}
          onRequestDelete={() => {}}
          onDuplicate={() => Promise.resolve()}
          {...props}
        />
      </QueryClientProvider>
    </Provider>
  );
};

describe('AnalyticsChartCard quick chart-type persistence', () => {
  it('calls onChartTypeChange with (draft.id, capitalized type) and shows the picked label', async () => {
    const onChartTypeChange = jest.fn().mockResolvedValue(undefined);
    renderCard({ onChartTypeChange });

    const trigger = screen.getByRole('button', { name: 'Chart type' });
    expect(trigger).toHaveTextContent('Line Chart');

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('button', { name: 'Bar Chart' }));

    // Capitalized ExplorerChartType reaches the parent so the persist path
    // maps it exactly (Bar → bar in the API payload).
    await waitFor(() =>
      expect(onChartTypeChange).toHaveBeenCalledWith('chart-1', 'Bar')
    );
    // Optimistic UI: the selector label switches immediately.
    expect(
      screen.getByRole('button', { name: 'Chart type' })
    ).toHaveTextContent('Bar Chart');
  });

  it('reverts the selector to the saved type when persistence rejects', async () => {
    const onChartTypeChange = jest
      .fn()
      .mockRejectedValue(new Error('network down'));
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    try {
      renderCard({ onChartTypeChange });

      fireEvent.click(screen.getByRole('button', { name: 'Chart type' }));
      fireEvent.click(screen.getByRole('button', { name: 'Bar Chart' }));

      expect(onChartTypeChange).toHaveBeenCalledWith('chart-1', 'Bar');

      // After the failure the UI must never keep showing the unpersisted type.
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: 'Chart type' })
        ).toHaveTextContent('Line Chart')
      );
    } finally {
      consoleError.mockRestore();
    }
  });

  it('stays local-only when onChartTypeChange is omitted', () => {
    renderCard();

    fireEvent.click(screen.getByRole('button', { name: 'Chart type' }));
    fireEvent.click(screen.getByRole('button', { name: 'Area Chart' }));

    expect(
      screen.getByRole('button', { name: 'Chart type' })
    ).toHaveTextContent('Area Chart');
  });
});
