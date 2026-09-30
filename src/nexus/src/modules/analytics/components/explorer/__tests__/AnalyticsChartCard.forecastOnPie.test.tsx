import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { store } from '@/shared/store';
import type { ExplorerChartDraft } from '@/modules/analytics/utils/chartConfig';

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

const getDailyForecast = jest.fn();
jest.mock('@/shared/services/deviceService', () => ({
  deviceService: {
    getDailyForecast: (...args: unknown[]) => getDailyForecast(...args),
  },
}));

// flowbite-react ships ESM-only and cannot be parsed by ts-jest; the render
// tree only needs the component surface, never a real tooltip.
jest.mock('flowbite-react', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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

// eslint-disable-next-line import/first
import { AnalyticsChartCard } from '../AnalyticsChartCard';

const makeDraft = (
  overrides: Partial<ExplorerChartDraft> = {}
): ExplorerChartDraft => ({
  id: 'chart-1',
  fieldId: 1,
  title: 'Gulu city air quality reporting',
  subtitle: '',
  chartType: 'Pie',
  pollutant: 'pm2_5',
  frequency: 'daily',
  startDate: '2026-08-29T00:00:00.000Z',
  endDate: '2026-09-28T00:00:00.000Z',
  siteIds: ['site-1'],
  siteNames: { 'site-1': 'Gulu' },
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
          siteNames={new Map([['site-1', 'Gulu']])}
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

describe('AnalyticsChartCard forecast on composition charts', () => {
  beforeEach(() => {
    getDailyForecast.mockReset();
    getDailyForecast.mockResolvedValue({ data: { forecasts: [] } });
  });

  it('disables the forecast switch on a pie chart instead of leaving it dead', () => {
    renderCard();

    const toggle = screen.getByRole('switch', {
      name: /forecast \(unavailable for this chart type\)/i,
    });

    expect(toggle).toHaveAttribute('aria-disabled', 'true');
    // The control explains WHY it is unavailable, rather than toggling into
    // the void — and points at a way out.
    expect(
      screen.getByRole('button', { name: /use line chart/i })
    ).toHaveAttribute('title', expect.stringContaining('needs a time axis'));
  });

  it('never requests forecast data for a pie chart, even when the preference is on', async () => {
    renderCard({ forecastEnabled: true });

    // Composition charts drop the overlay entirely, so the per-site forecast
    // queries must not fire at all.
    await waitFor(() => {
      expect(getDailyForecast).not.toHaveBeenCalled();
    });
  });

  it('offers a one-click escape hatch to a time-series chart', async () => {
    const onChartTypeChange = jest.fn().mockResolvedValue(undefined);
    renderCard({ onChartTypeChange });

    fireEvent.click(screen.getByRole('button', { name: /use line chart/i }));

    expect(onChartTypeChange).toHaveBeenCalledWith('chart-1', 'Line');
  });

  it('keeps the forecast switch interactive on a line chart', () => {
    const onForecastToggle = jest.fn();
    renderCard({
      draft: makeDraft({ chartType: 'Line' }),
      forecastEnabled: false,
      onForecastToggle,
    });

    const toggle = screen.getByRole('switch', { name: 'Forecast' });

    expect(toggle).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(toggle);
    expect(onForecastToggle).toHaveBeenCalledTimes(1);
  });

  it('still explains the PM₁₀ limitation ahead of the chart-type rule', () => {
    renderCard({ draft: makeDraft({ pollutant: 'pm10', chartType: 'Line' }) });

    expect(screen.getByText(/available for PM₂.₅ charts/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('switch', { name: /unavailable for this chart type/i })
    ).not.toBeInTheDocument();
  });
});
