import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SWRConfig } from 'swr';

jest.mock('posthog-js/react', () => ({
  usePostHog: () => null,
}));

jest.mock('@/shared/services/siteSummary', () => ({
  fetchAllSitesSummary: jest.fn().mockResolvedValue([]),
}));

const updateChartMock = jest.fn();
const getChartsMock = jest.fn();
jest.mock('@/shared/services/preferencesService', () => ({
  preferencesService: {
    getCharts: (...args: unknown[]) => getChartsMock(...args),
    updateChart: (...args: unknown[]) => updateChartMock(...args),
    createChart: jest.fn(),
    copyChart: jest.fn(),
    deleteChart: jest.fn(),
  },
}));

/** A saved chart document as GET /users/preferences/charts returns it. */
const chartDocument = (overrides: Record<string, unknown> = {}) => ({
  _id: 'chart-1',
  fieldId: 1,
  title: 'Gulu city air quality reporting',
  site_ids: ['site-1'],
  days: 30,
  chartType: 'Line',
  ...overrides,
});

// eslint-disable-next-line import/first
import { useChartManagement } from '../useChartManagement';
// eslint-disable-next-line import/first
import {
  persistedConfigToDraft,
  readChartSidecar,
} from '../../utils/chartConfig';

type HandleDateRangeChange = (
  draftId: string,
  range: { startDate: string; endDate: string }
) => Promise<void>;

let capturedHandle: HandleDateRangeChange | null = null;
let capturedDraft: { startDate: string; endDate: string } | null = null;

const Harness = () => {
  const { charts, handleDateRangeChange } = useChartManagement('group-1', true);
  capturedHandle = handleDateRangeChange;
  if (charts[0]) {
    capturedDraft = {
      startDate: charts[0].startDate,
      endDate: charts[0].endDate,
    };
  }
  return <div>{charts.length > 0 ? 'charts-loaded' : 'loading'}</div>;
};

const renderHarness = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <QueryClientProvider client={queryClient}>
        <Harness />
      </QueryClientProvider>
    </SWRConfig>
  );
};

/** Reads the client sidecar the same way the chart list does on load. */
const readSidecarRange = (groupId: string, chartId: string) =>
  readChartSidecar(groupId, chartId);

describe('useChartManagement quick date-range persistence', () => {
  beforeEach(() => {
    updateChartMock.mockReset();
    updateChartMock.mockResolvedValue({
      success: true,
      data: { _id: 'chart-1' },
    });
    getChartsMock.mockReset();
    // Default: a legacy document carrying only `days` (no explicit range), so
    // the first test keeps exercising the "N days ending today" baseline.
    getChartsMock.mockResolvedValue({
      success: true,
      data: [chartDocument()],
    });
    window.localStorage.clear();
    capturedHandle = null;
    capturedDraft = null;
  });

  it('persists a toolbar range and restores it into the draft after a reload', async () => {
    renderHarness();
    await waitFor(() => expect(capturedHandle).not.toBeNull());

    // Baseline: with no sidecar, the draft's range is re-derived from the day
    // count, i.e. "30 days ending today" — NOT a custom range.
    expect(capturedDraft).not.toEqual({
      startDate: '2026-08-03T00:00:00.000Z',
      endDate: '2026-08-09T23:59:59.999Z',
    });

    await act(async () => {
      await capturedHandle!('chart-1', {
        startDate: '2026-08-03T00:00:00.000Z',
        endDate: '2026-08-09T23:59:59.999Z',
      });
    });

    // The API is told the new window: the exact boundaries AND the derived
    // day count + period label.
    expect(updateChartMock).toHaveBeenCalledTimes(1);
    const [, body] = updateChartMock.mock.calls[0];
    expect(body).toMatchObject({
      days: 7,
      startDate: '2026-08-03T00:00:00.000Z',
      endDate: '2026-08-09T23:59:59.999Z',
    });
    expect(body.period?.label).toContain('Aug 3');

    // The sidecar also keeps the range on THIS browser (backwards compatible
    // with charts saved before the range was persisted server-side).
    const sidecar = readSidecarRange('group-1', 'chart-1');
    expect(sidecar.startDate).toBe('2026-08-03T00:00:00.000Z');
    expect(sidecar.endDate).toBe('2026-08-09T23:59:59.999Z');

    // Reload on a DIFFERENT device: no sidecar at all, only what the
    // preferences API returned. The window must still be the user's pick.
    const reloaded = persistedConfigToDraft({
      _id: 'chart-1',
      fieldId: 1,
      title: 'Gulu city air quality reporting',
      chartType: 'Line',
      days: 7,
      startDate: '2026-08-03T00:00:00.000Z',
      endDate: '2026-08-09T23:59:59.999Z',
    });
    expect(reloaded.startDate).toBe('2026-08-03T00:00:00.000Z');
    expect(reloaded.endDate).toBe('2026-08-09T23:59:59.999Z');
  });

  it('rolls the sidecar back when the save fails', async () => {
    updateChartMock.mockRejectedValueOnce(new Error('network down'));
    renderHarness();
    await waitFor(() => expect(capturedHandle).not.toBeNull());

    await act(async () => {
      await expect(
        capturedHandle!('chart-1', {
          startDate: '2026-08-03T00:00:00.000Z',
          endDate: '2026-08-09T23:59:59.999Z',
        })
      ).rejects.toThrow('network down');
    });

    const sidecar = readSidecarRange('group-1', 'chart-1');
    // Either absent or restored to the previous value — never the failed pick.
    expect(sidecar.startDate).not.toBe('2026-08-03T00:00:00.000Z');
  });

  it('keeps the saved window in the cached chart even when the response omits it', async () => {
    // A real deployment that stores ranges returns them, so the chart arrives
    // with an OLD window; the PUT response then omits the field. The cached
    // copy must still pick up the NEW window from the request body — otherwise
    // the stale server dates outrank the freshly written sidecar and the card
    // re-renders with the wrong range until the next refetch.
    getChartsMock.mockResolvedValue({
      success: true,
      data: [
        chartDocument({
          days: 7,
          startDate: '2026-01-01T00:00:00.000Z',
          endDate: '2026-01-07T23:59:59.999Z',
        }),
      ],
    });
    updateChartMock.mockResolvedValueOnce({
      success: true,
      data: { _id: 'chart-1', title: 'Gulu city air quality reporting' },
    });

    renderHarness();
    await waitFor(() => expect(capturedHandle).not.toBeNull());
    // Baseline: the loaded document's (old) window.
    expect(capturedDraft).toEqual({
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2026-01-07T23:59:59.999Z',
    });

    await act(async () => {
      await capturedHandle!('chart-1', {
        startDate: '2026-08-03T00:00:00.000Z',
        endDate: '2026-08-09T23:59:59.999Z',
      });
    });

    await waitFor(() =>
      expect(capturedDraft).toEqual({
        startDate: '2026-08-03T00:00:00.000Z',
        endDate: '2026-08-09T23:59:59.999Z',
      })
    );
  });
});
