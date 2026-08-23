import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SWRConfig } from 'swr';

// The hook reports via PostHog; no analytics client is needed here.
jest.mock('posthog-js/react', () => ({
  usePostHog: () => null,
}));

// The fleet-wide site-names fallback stays disabled (dialog closed) but the
// service is imported at module level — stub it.
jest.mock('@/shared/services/siteSummary', () => ({
  fetchAllSitesSummary: jest.fn().mockResolvedValue([]),
}));

// preferencesService is the network boundary under test: getCharts hydrates
// the chart list, updateChart captures the PUT bodies and their timing.
const updateChartMock = jest.fn();
jest.mock('@/shared/services/preferencesService', () => ({
  preferencesService: {
    getCharts: jest.fn().mockResolvedValue({
      success: true,
      data: [
        {
          _id: 'chart-1',
          fieldId: 1,
          title: 'Weekly PM2.5',
          site_ids: ['site-1'],
          days: 7,
          chartType: 'Line',
        },
      ],
    }),
    updateChart: (...args: unknown[]) => updateChartMock(...args),
    createChart: jest.fn(),
    copyChart: jest.fn(),
    deleteChart: jest.fn(),
  },
}));

// eslint-disable-next-line import/first
import { useChartManagement } from '../useChartManagement';
// eslint-disable-next-line import/first
import type { ExplorerChartType } from '../../utils/chartConfig';

type HandleChartTypeChange = (
  draftId: string,
  chartType: ExplorerChartType
) => Promise<void>;

let capturedHandle: HandleChartTypeChange | null = null;

const Harness = () => {
  const { charts, handleChartTypeChange } = useChartManagement('group-1', true);
  capturedHandle = handleChartTypeChange;
  return <div>{charts.length > 0 ? 'charts-loaded' : 'loading'}</div>;
};

const renderHarness = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  // Fresh SWR cache per render so tests never share chart lists.
  return render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <QueryClientProvider client={queryClient}>
        <Harness />
      </QueryClientProvider>
    </SWRConfig>
  );
};

describe('useChartManagement quick chart-type persistence queue', () => {
  beforeEach(() => {
    updateChartMock.mockReset();
    window.localStorage.clear();
    capturedHandle = null;
  });

  it('serializes rapid selections so the final persisted body is the last selection', async () => {
    const releaseBar = jest.fn();
    const releaseArea = jest.fn();
    updateChartMock
      .mockImplementationOnce(
        () =>
          new Promise(resolve => {
            releaseBar.mockImplementation(() =>
              resolve({ data: { _id: 'chart-1' } })
            );
          })
      )
      .mockImplementationOnce(
        () =>
          new Promise(resolve => {
            releaseArea.mockImplementation(() =>
              resolve({ data: { _id: 'chart-1' } })
            );
          })
      );

    renderHarness();
    await screen.findByText('charts-loaded');

    let first!: Promise<void>;
    let second!: Promise<void>;
    await act(async () => {
      first = capturedHandle!('chart-1', 'Bar');
      second = capturedHandle!('chart-1', 'Area');
    });

    // While the Bar PUT is in flight, the Area PUT must NOT have been sent:
    // per-chart serialization means it waits for the previous link to settle.
    expect(updateChartMock).toHaveBeenCalledTimes(1);
    expect(updateChartMock.mock.calls[0][1]).toMatchObject({
      chartType: 'Bar',
    });

    // Bar settles; only then is the Area PUT issued — with the Area mapping
    // (Area persists as Line server-side, the sidecar carries the real type).
    await act(async () => {
      releaseBar();
      await first;
    });
    expect(updateChartMock).toHaveBeenCalledTimes(2);
    expect(updateChartMock.mock.calls[1][1]).toMatchObject({
      chartType: 'Line',
    });

    await act(async () => {
      releaseArea();
      await Promise.all([first, second]);
    });
  });

  it('releases the queue when a persistence rejects so later selections still persist', async () => {
    updateChartMock
      .mockImplementationOnce(() => Promise.reject(new Error('bar PUT failed')))
      .mockImplementationOnce(() =>
        Promise.resolve({ data: { _id: 'chart-1' } })
      );

    renderHarness();
    await screen.findByText('charts-loaded');

    let first!: Promise<void>;
    let second!: Promise<void>;
    await act(async () => {
      first = capturedHandle!('chart-1', 'Bar');
      second = capturedHandle!('chart-1', 'Area');
    });

    // The failed Bar PUT rejects to its caller AND releases the chain so the
    // queued Area selection still persists (no deadlock).
    await act(async () => {
      await expect(first).rejects.toThrow('bar PUT failed');
    });
    await act(async () => {
      await second;
    });

    expect(updateChartMock).toHaveBeenCalledTimes(2);
    expect(updateChartMock.mock.calls[1][1]).toMatchObject({
      chartType: 'Line',
    });
  });
});
