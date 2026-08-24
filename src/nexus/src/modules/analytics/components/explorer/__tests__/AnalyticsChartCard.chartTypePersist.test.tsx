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

  describe('rapid selection race (controlled promises)', () => {
    // The toolbar selector keeps the dropdown OPEN after a pick (options are
    // plain buttons, not auto-closing menu items), so two rapid selections
    // are one open followed by two consecutive option clicks.
    const selectTypes = (...labels: string[]) => {
      fireEvent.click(screen.getByRole('button', { name: 'Chart type' }));
      labels.forEach(label => {
        fireEvent.click(screen.getByRole('button', { name: label }));
      });
    };

    it('keeps the newest selection when an older request fails after a newer one succeeded', async () => {
      let rejectBar!: (reason?: unknown) => void;
      let resolveArea!: () => void;
      const barRequest = new Promise<void>((_, reject) => {
        rejectBar = reject;
      });
      const areaRequest = new Promise<void>(resolve => {
        resolveArea = resolve;
      });
      const onChartTypeChange = jest
        .fn()
        .mockImplementationOnce(() => barRequest)
        .mockImplementationOnce(() => areaRequest);
      const consoleError = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      try {
        renderCard({ onChartTypeChange });

        // Two rapid selections: Bar then Area. Both PUTs are in flight.
        selectTypes('Bar Chart', 'Area Chart');
        expect(onChartTypeChange).toHaveBeenCalledTimes(2);
        expect(onChartTypeChange).toHaveBeenNthCalledWith(1, 'chart-1', 'Bar');
        expect(onChartTypeChange).toHaveBeenNthCalledWith(2, 'chart-1', 'Area');

        // Area (the NEWEST request) completes first, THEN the older Bar
        // request fails — it must NOT revert the UI to Bar or Line.
        resolveArea();
        rejectBar(new Error('stale bar request failed'));
        // The failure handler ran (it logs) ...
        await waitFor(() => expect(consoleError).toHaveBeenCalled());
        // ... but the override still shows the newer, successful selection.
        expect(
          screen.getByRole('button', { name: 'Chart type' })
        ).toHaveTextContent('Area Chart');
      } finally {
        consoleError.mockRestore();
      }
    });

    it('keeps the newest optimistic selection when an older request resolves last', async () => {
      let resolveBar!: () => void;
      let resolveArea!: () => void;
      const barRequest = new Promise<void>(resolve => {
        resolveBar = resolve;
      });
      const areaRequest = new Promise<void>(resolve => {
        resolveArea = resolve;
      });
      const onChartTypeChange = jest
        .fn()
        .mockImplementationOnce(() => barRequest)
        .mockImplementationOnce(() => areaRequest);

      renderCard({ onChartTypeChange });

      selectTypes('Bar Chart', 'Area Chart');

      // Reversed completion: Area settles first, Bar afterwards. Neither
      // success touches the override, so the newest pick stays visible.
      resolveArea();
      resolveBar();
      await Promise.all([barRequest, areaRequest]);

      expect(
        screen.getByRole('button', { name: 'Chart type' })
      ).toHaveTextContent('Area Chart');
    });

    it('still reverts when the LATEST request fails', async () => {
      let resolveBar!: () => void;
      let rejectArea!: (reason?: unknown) => void;
      const barRequest = new Promise<void>(resolve => {
        resolveBar = resolve;
      });
      const areaRequest = new Promise<void>((_, reject) => {
        rejectArea = reject;
      });
      const onChartTypeChange = jest
        .fn()
        .mockImplementationOnce(() => barRequest)
        .mockImplementationOnce(() => areaRequest);
      const consoleError = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      try {
        renderCard({ onChartTypeChange });

        selectTypes('Bar Chart', 'Area Chart');

        // Bar succeeds; then the latest (Area) request fails — the guard
        // must not swallow a legitimate revert of the newest selection.
        resolveBar();
        rejectArea(new Error('area persist failed'));

        await waitFor(() =>
          expect(
            screen.getByRole('button', { name: 'Chart type' })
          ).toHaveTextContent('Line Chart')
        );
      } finally {
        consoleError.mockRestore();
      }
    });
  });
});
