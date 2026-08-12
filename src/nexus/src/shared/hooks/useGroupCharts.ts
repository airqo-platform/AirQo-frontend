import { useRef } from 'react';
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
 * Create a group chart configuration. Invalidates the group charts cache on
 * success so the dashboard reflects the new chart immediately.
 */
export const useCreateGroupChart = () => {
  const { mutate } = useSWRConfig();
  const lastGroupIdRef = useRef('');

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
      lastGroupIdRef.current = arg.groupId;
      return preferencesService.createGroupChart(arg.groupId, arg.request);
    },
    {
      onSuccess: () => {
        const prefix = `${GROUP_CHARTS_KEY_PREFIX}/${lastGroupIdRef.current}`;
        mutate(
          cacheKey => typeof cacheKey === 'string' && cacheKey.startsWith(prefix)
        );
      },
    }
  );
};

/**
 * Update a group chart configuration (flat partial body — verified live).
 */
export const useUpdateGroupChart = () => {
  const { mutate } = useSWRConfig();
  const lastGroupIdRef = useRef('');

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
      lastGroupIdRef.current = arg.groupId;
      return preferencesService.updateGroupChart(
        arg.groupId,
        arg.chartId,
        arg.request
      );
    },
    {
      onSuccess: () => {
        const prefix = `${GROUP_CHARTS_KEY_PREFIX}/${lastGroupIdRef.current}`;
        mutate(
          cacheKey => typeof cacheKey === 'string' && cacheKey.startsWith(prefix)
        );
      },
    }
  );
};

/**
 * Delete a group chart configuration.
 */
export const useDeleteGroupChart = () => {
  const { mutate } = useSWRConfig();
  const lastGroupIdRef = useRef('');

  return useSWRMutation(
    `${GROUP_CHARTS_KEY_PREFIX}/delete`,
    async (
      key,
      { arg }: { arg: { groupId: string; chartId: string } }
    ) => {
      lastGroupIdRef.current = arg.groupId;
      return preferencesService.deleteGroupChart(arg.groupId, arg.chartId);
    },
    {
      onSuccess: () => {
        const prefix = `${GROUP_CHARTS_KEY_PREFIX}/${lastGroupIdRef.current}`;
        mutate(
          cacheKey => typeof cacheKey === 'string' && cacheKey.startsWith(prefix)
        );
      },
    }
  );
};
