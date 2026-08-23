import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { useSWRConfig } from 'swr';
import { preferencesService } from '../services/preferencesService';
import type {
  CreateChartRequest,
  UpdateChartRequest,
  UserChartConfig,
} from '../types/api';

const CHARTS_KEY_PREFIX = 'preferences/charts';

const CHARTS_FETCH_OPTIONS = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  // A 30-minute persisted provider cache already covers reloads; never
  // re-fetch purely because mounted data is stale (the page owns its
  // mutations and refreshes optimistically).
  revalidateIfStale: false,
  shouldRetryOnError: false,
  // Deduplicate simultaneous requests across mounted consumers; widened so
  // rapid create/update/delete flows don't each trigger a fresh list fetch.
  dedupingInterval: 10000,
  // Avoid infinite loops when a group switch invalidates the key.
  errorRetryCount: 0,
  errorRetryInterval: 1000,
} as const;

const chartsKey = (groupId: string) =>
  groupId ? `${CHARTS_KEY_PREFIX}/${groupId}` : CHARTS_KEY_PREFIX;

/**
 * Fetch the user's chart configuration documents (user-scoped v2 API; a
 * `group_id` narrows the list and defaults to the user's default group).
 * Each item is a flat chart document carrying its own site/device scope,
 * subTitle and locationColors.
 */
export const useGroupCharts = (groupId: string, enabled = true) => {
  return useSWR<UserChartConfig[]>(
    enabled ? chartsKey(groupId) : null,
    async () => {
      const response = await preferencesService.getCharts(groupId || undefined);

      if (!response?.success) {
        throw new Error(
          response?.message || 'Failed to get chart configurations'
        );
      }

      return response.data ?? [];
    },
    CHARTS_FETCH_OPTIONS
  );
};

/**
 * Create a chart configuration. Writes the created chart into the cache
 * immediately (real-time UI) and revalidates in the background so the
 * dashboard reflects the new chart right away.
 */
export const useCreateGroupChart = () => {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    `${CHARTS_KEY_PREFIX}/create`,
    async (
      key,
      { arg }: { arg: { groupId: string; request: CreateChartRequest } }
    ) => {
      const result = await preferencesService.createChart(arg.request);
      const listKey = chartsKey(arg.groupId);
      const created = result?.data;
      // Populate the cache with the created chart before the background
      // revalidation lands, so the dashboard updates instantly. Matches the
      // list key EXACTLY (never a prefix): when groupId is empty the key is
      // the bare 'preferences/charts', which is also a prefix of every
      // group-scoped key — a prefix match would bleed this chart into other
      // groups' caches.
      mutate(
        (cacheKey: unknown) =>
          typeof cacheKey === 'string' && cacheKey === listKey,
        (current: UserChartConfig[] | undefined) => {
          if (!created?._id) return current;
          return [created, ...(Array.isArray(current) ? current : [])];
        },
        // No automatic list refetch: the optimistic write above is the
        // source of truth for this session and re-fetching only adds load.
        { revalidate: false }
      );
      return result;
    }
  );
};

/**
 * Update a chart configuration (flat partial body — verified live).
 * Writes the updated config into the cache immediately (real-time UI) and
 * revalidates in the background so the dashboard never shows stale values
 * while the refetch is in flight.
 */
export const useUpdateGroupChart = () => {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    `${CHARTS_KEY_PREFIX}/update`,
    async (
      key,
      {
        arg,
      }: {
        arg: {
          groupId: string;
          chartId: string;
          request: UpdateChartRequest;
        };
      }
    ) => {
      const result = await preferencesService.updateChart(
        arg.chartId,
        arg.request
      );
      const listKey = chartsKey(arg.groupId);
      const updated = result?.data;
      mutate(
        cacheKey =>
          typeof cacheKey === 'string' && cacheKey === listKey,
        (current: UserChartConfig[] | undefined) => {
          if (!Array.isArray(current) || !updated?._id) return current;
          return current.map(item =>
            item._id === updated._id
              ? {
                  ...item,
                  ...updated,
                  // The PUT body carries the scope; keep the cached copy's
                  // ids when the response omits them.
                  site_ids: arg.request.site_ids ?? item.site_ids,
                  device_ids: arg.request.device_ids ?? item.device_ids,
                }
              : item
          );
        },
        { revalidate: false }
      );
      return result;
    }
  );
};

/**
 * Duplicate a chart configuration via the server copy endpoint (includes
 * device_ids/site_ids/locationColors; new title ends with "(Copy)"). The
 * copy is inserted into the cache immediately so the dashboard updates
 * without waiting for the background revalidation.
 */
export const useCopyGroupChart = () => {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    `${CHARTS_KEY_PREFIX}/copy`,
    async (
      key,
      { arg }: { arg: { groupId: string; chartId: string } }
    ) => {
      const result = await preferencesService.copyChart(arg.chartId);
      const listKey = chartsKey(arg.groupId);
      const copy = result?.data;
      mutate(
        cacheKey =>
          typeof cacheKey === 'string' && cacheKey === listKey,
        (current: UserChartConfig[] | undefined) => {
          if (!copy?._id) return current;
          return [
            copy,
            ...(Array.isArray(current) ? current : []),
          ];
        },
        { revalidate: false }
      );
      return result;
    }
  );
};

/**
 * Delete a chart configuration. Removes the chart from the cache
 * immediately (real-time UI) and revalidates in the background.
 */
export const useDeleteGroupChart = () => {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    `${CHARTS_KEY_PREFIX}/delete`,
    async (
      key,
      { arg }: { arg: { groupId: string; chartId: string } }
    ) => {
      const result = await preferencesService.deleteChart(arg.chartId);
      const listKey = chartsKey(arg.groupId);
      mutate(
        cacheKey =>
          typeof cacheKey === 'string' && cacheKey === listKey,
        (current: UserChartConfig[] | undefined) => {
          if (!Array.isArray(current)) return current;
          return current.filter(item => item._id !== arg.chartId);
        },
        { revalidate: false }
      );
      return result;
    }
  );
};
