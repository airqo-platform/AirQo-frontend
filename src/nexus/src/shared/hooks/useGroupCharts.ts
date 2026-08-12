import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { useSWRConfig } from 'swr';
import { preferencesService } from '../services/preferencesService';
import type {
  CreateGroupChartRequest,
  UpdateGroupChartRequest,
  GroupChartDocument,
  GroupChartConfig,
} from '../types/api';

const GROUP_CHARTS_KEY_PREFIX = 'preferences/groups/charts';

const GROUP_CHARTS_FETCH_OPTIONS = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  shouldRetryOnError: false,
  // Deduplicate simultaneous requests across mounted consumers.
  dedupingInterval: 5000,
  // Avoid infinite loops when a group switch invalidates the key.
  errorRetryCount: 0,
  errorRetryInterval: 1000,
} as const;

const groupChartsKey = (groupId: string) =>
  groupId ? `${GROUP_CHARTS_KEY_PREFIX}/${groupId}` : null;

/**
 * Fetch the group's chart configuration documents. Documents are stored as
 * `{ site_ids, device_ids, chartConfigurations: [...] }`; the hook flattens
 * them into one chart config per item for direct consumption.
 */
export const useGroupCharts = (groupId: string, enabled = true) => {
  return useSWR<GroupChartConfig[]>(
    enabled ? groupChartsKey(groupId) : null,
    async () => {
      const response = await preferencesService.getGroupCharts(groupId);

      if (!response?.success) {
        throw new Error(
          response?.message || 'Failed to get chart configurations'
        );
      }

      const documents: GroupChartDocument[] = response.data ?? [];
      return documents.flatMap(document =>
        (document.chartConfigurations ?? []).map(config => ({
          ...config,
          site_ids: document.site_ids ?? [],
          device_ids: document.device_ids ?? [],
        }))
      );
    },
    GROUP_CHARTS_FETCH_OPTIONS
  );
};

/**
 * Create a group chart configuration. Writes the created chart into the
 * cache immediately (real-time UI) and revalidates the group's charts in the
 * background so the dashboard reflects the new chart right away.
 */
export const useCreateGroupChart = () => {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    `${GROUP_CHARTS_KEY_PREFIX}/create`,
    async (
      key,
      {
        arg,
      }: {
        arg: { groupId: string; request: CreateGroupChartRequest };
      }
    ) => {
      const result = await preferencesService.createGroupChart(
        arg.groupId,
        arg.request
      );
      const prefix = `${GROUP_CHARTS_KEY_PREFIX}/${arg.groupId}`;
      const created = result?.data;
      // Populate the cache with the created chart before the background
      // revalidation lands, so the dashboard updates instantly. Uses the
      // arg's groupId (never a shared ref) so a fast group switch can't
      // invalidate the wrong group's cache.
      mutate(
        cacheKey =>
          typeof cacheKey === 'string' && cacheKey.startsWith(prefix),
        (current: GroupChartConfig[] | undefined) => {
          if (!created?._id) return current;
          const createdItem: GroupChartConfig = {
            ...created,
            site_ids: arg.request.site_ids ?? [],
            device_ids: arg.request.device_ids ?? [],
          };
          return [
            createdItem,
            ...(Array.isArray(current) ? current : []),
          ];
        }
      );
      return result;
    }
  );
};

/**
 * Update a group chart configuration (flat partial body — verified live).
 * Writes the updated config into the cache immediately (real-time UI) and
 * revalidates in the background so the dashboard never shows stale values
 * while the refetch is in flight.
 */
export const useUpdateGroupChart = () => {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    `${GROUP_CHARTS_KEY_PREFIX}/update`,
    async (
      key,
      {
        arg,
      }: {
        arg: {
          groupId: string;
          chartId: string;
          request: UpdateGroupChartRequest;
        };
      }
    ) => {
      const result = await preferencesService.updateGroupChart(
        arg.groupId,
        arg.chartId,
        arg.request
      );
      const prefix = `${GROUP_CHARTS_KEY_PREFIX}/${arg.groupId}`;
      const updated = result?.data;
      mutate(
        cacheKey =>
          typeof cacheKey === 'string' && cacheKey.startsWith(prefix),
        (current: GroupChartConfig[] | undefined) => {
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
        }
      );
      return result;
    }
  );
};

/**
 * Delete a group chart configuration. Removes the chart from the cache
 * immediately (real-time UI) and revalidates in the background.
 */
export const useDeleteGroupChart = () => {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    `${GROUP_CHARTS_KEY_PREFIX}/delete`,
    async (
      key,
      { arg }: { arg: { groupId: string; chartId: string } }
    ) => {
      const result = await preferencesService.deleteGroupChart(
        arg.groupId,
        arg.chartId
      );
      const prefix = `${GROUP_CHARTS_KEY_PREFIX}/${arg.groupId}`;
      mutate(
        cacheKey =>
          typeof cacheKey === 'string' && cacheKey.startsWith(prefix),
        (current: GroupChartConfig[] | undefined) => {
          if (!Array.isArray(current)) return current;
          return current.filter(item => item._id !== arg.chartId);
        }
      );
      return result;
    }
  );
};
