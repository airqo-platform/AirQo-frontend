import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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

jest.mock('@/shared/services/deviceService', () => ({
  deviceService: { getDailyForecast: jest.fn() },
}));

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

// The real picker needs a dialog + calendar interaction; a stub exposes the
// picked range so the wiring (toolbar → onDateRangeChange) can be asserted.
// The card passes the DateRange shape the shared picker expects: {from, to}.
const PICK = {
  from: '2026-08-03T00:00:00.000Z',
  to: '2026-08-09T23:59:59.999Z',
};
jest.mock('@/shared/components/calendar', () => ({
  DatePicker: ({
    value,
    onChange,
  }: {
    value: { from?: Date; to?: Date };
    onChange: (value: unknown) => void;
  }) => (
    <div>
      <span data-testid="picker-label">
        {value.from instanceof Date ? value.from.toISOString() : ''} →{' '}
        {value.to instanceof Date ? value.to.toISOString() : ''}
      </span>
      <button
        type="button"
        onClick={() => onChange({ from: PICK.from, to: PICK.to })}
      >
        pick-range
      </button>
    </div>
  ),
}));

// eslint-disable-next-line import/first
import { AnalyticsChartCard } from '../AnalyticsChartCard';

const SAVED = {
  startDate: '2026-08-29T00:00:00.000Z',
  endDate: '2026-09-28T23:59:59.999Z',
};

const makeDraft = (
  overrides: Partial<ExplorerChartDraft> = {}
): ExplorerChartDraft => ({
  id: 'chart-1',
  fieldId: 1,
  title: 'Gulu city air quality reporting',
  subtitle: '',
  chartType: 'Line',
  pollutant: 'pm2_5',
  frequency: 'daily',
  ...SAVED,
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

describe('AnalyticsChartCard date-range persistence wiring', () => {
  it('persists the picked range instead of only mutating local state', async () => {
    const onDateRangeChange = jest.fn().mockResolvedValue(undefined);
    renderCard({ onDateRangeChange });

    expect(screen.getByTestId('picker-label')).toHaveTextContent(
      `${SAVED.startDate} → ${SAVED.endDate}`
    );

    const { fireEvent } = await import('@testing-library/react');
    fireEvent.click(screen.getByRole('button', { name: 'pick-range' }));

    // The picked range is what the user sees...
    await waitFor(() =>
      expect(screen.getByTestId('picker-label')).toHaveTextContent(
        `${PICK.from} → ${PICK.to}`
      )
    );
    // ...and it is handed to the parent so it can be persisted. Without this
    // the range silently resets to "N days ending today" on reload.
    expect(onDateRangeChange).toHaveBeenCalledWith('chart-1', {
      startDate: PICK.from,
      endDate: PICK.to,
    });
  });

  it('reverts to the saved range and reports the failure when saving fails', async () => {
    const onDateRangeChange = jest
      .fn()
      .mockRejectedValue(new Error('network down'));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    renderCard({ onDateRangeChange });

    const { fireEvent } = await import('@testing-library/react');
    fireEvent.click(screen.getByRole('button', { name: 'pick-range' }));

    await waitFor(() =>
      expect(screen.getByTestId('picker-label')).toHaveTextContent(
        `${SAVED.startDate} → ${SAVED.endDate}`
      )
    );
    expect(errorSpy).toHaveBeenCalledWith(
      'Failed to persist date range',
      expect.anything()
    );
    errorSpy.mockRestore();
  });

  it('stays local-only when no persistence handler is supplied', async () => {
    renderCard();

    const { fireEvent } = await import('@testing-library/react');
    fireEvent.click(screen.getByRole('button', { name: 'pick-range' }));

    await waitFor(() =>
      expect(screen.getByTestId('picker-label')).toHaveTextContent(
        `${PICK.from} → ${PICK.to}`
      )
    );
    // No handler → no save attempted, and no revert (preview-only chart).
  });
});
