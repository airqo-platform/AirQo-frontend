import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useSWRConfig } from 'swr';
import { usePostHog } from 'posthog-js/react';
import { useQueryClient } from '@tanstack/react-query';
import { setActiveGroup, setActiveGroupById } from '@/shared/store/userSlice';
import { useUser } from './useUser';
import { useLogout } from './useLogout';
import type { NormalizedGroup } from '@/shared/utils/userUtils';
import { trackGroupChange } from '@/shared/utils/enhancedAnalytics';

/**
 * Hook for user-related actions and state
 */
export const useUserActions = () => {
  const dispatch = useDispatch();
  const { mutate } = useSWRConfig();
  const { user, groups, activeGroup, isLoading, isLoggingOut, error } =
    useUser();
  const posthog = usePostHog();
  const queryClient = useQueryClient();
  const logout = useLogout();

  const invalidateGroupScopedCache = useCallback(
    (previousGroupId?: string, nextGroupId?: string) => {
      mutate(
        key => {
          const keyText = Array.isArray(key)
            ? key
                .filter(
                  (segment): segment is string | number =>
                    typeof segment === 'string' || typeof segment === 'number'
                )
                .join(' ')
            : typeof key === 'string'
              ? key
              : '';

          if (!keyText) {
            return false;
          }

          return (
            keyText.startsWith('preferences/') ||
            keyText.startsWith('preferences/list/') ||
            keyText.startsWith('preferences/theme/') ||
            keyText.startsWith('analytics/') ||
            keyText.startsWith('sites/summary') ||
            keyText.startsWith('grids/summary') ||
            keyText.startsWith('checklist/') ||
            keyText.includes('/preferences') ||
            keyText.includes('/theme') ||
            keyText.includes('group/cohorts') ||
            keyText.includes('cohort/details') ||
            keyText.includes('cohort/sites') ||
            keyText.includes('cohort/devices') ||
            keyText.includes('/devices/groups/') ||
            keyText.includes('/devices/cohorts/') ||
            (!!previousGroupId && keyText.includes(`/${previousGroupId}`)) ||
            (!!nextGroupId && keyText.includes(`/${nextGroupId}`))
          );
        },
        undefined,
        // revalidate: false clears the cache without firing immediate background
        // refetch requests for all matching keys. Components will fetch fresh data
        // naturally when they next mount under the new group context.
        { revalidate: false }
      );

      queryClient.removeQueries({
        predicate: query => {
          const key = query.queryKey;
          const keyText = Array.isArray(key)
            ? key
                .filter(
                  (segment): segment is string | number =>
                    typeof segment === 'string' || typeof segment === 'number'
                )
                .join(' ')
            : typeof key === 'string'
              ? key
              : '';

          if (!keyText) {
            return false;
          }

          return (
            keyText.includes('sites-by-country') ||
            keyText.includes('group/cohorts') ||
            keyText.includes('cohort') ||
            (!!previousGroupId && keyText.includes(previousGroupId)) ||
            (!!nextGroupId && keyText.includes(nextGroupId))
          );
        },
      });
    },
    [mutate, queryClient]
  );

  const switchGroup = useCallback(
    (group: NormalizedGroup) => {
      const previousGroupId = activeGroup?.id;
      const previousGroupName = activeGroup?.title;
      const previousOrganizationSlug = activeGroup?.organizationSlug;

      // Only proceed if actually switching to a different group
      if (previousGroupId === group.id) {
        return; // No need to do anything if it's the same group
      }

      trackGroupChange(posthog, {
        fromGroupId: previousGroupId,
        fromGroupName: previousGroupName,
        fromOrganizationSlug: previousOrganizationSlug,
        toGroupId: group.id,
        toGroupName: group.title,
        toOrganizationSlug: group.organizationSlug,
      });

      // Switch to new group
      dispatch(setActiveGroup(group));

      invalidateGroupScopedCache(previousGroupId, group.id);
    },
    [
      activeGroup?.id,
      activeGroup?.organizationSlug,
      activeGroup?.title,
      dispatch,
      invalidateGroupScopedCache,
      posthog,
    ]
  );

  const switchGroupById = useCallback(
    (groupId: string) => {
      const group = groups.find(g => g.id === groupId);
      if (group) {
        switchGroup(group);
      } else {
        const previousGroupId = activeGroup?.id;
        const previousGroupName = activeGroup?.title;
        const previousOrganizationSlug = activeGroup?.organizationSlug;
        console.warn(
          `[useUserActions] Group not found in current groups list for id ${groupId}. Applying ID-only switch fallback.`
        );
        trackGroupChange(posthog, {
          fromGroupId: previousGroupId,
          fromGroupName: previousGroupName,
          fromOrganizationSlug: previousOrganizationSlug,
          toGroupId: groupId,
        });
        dispatch(setActiveGroupById(groupId));
        invalidateGroupScopedCache(previousGroupId, groupId);
      }
    },
    [
      activeGroup?.id,
      activeGroup?.title,
      activeGroup?.organizationSlug,
      dispatch,
      groups,
      invalidateGroupScopedCache,
      posthog,
      switchGroup,
    ]
  );

  return {
    // State
    user,
    groups,
    activeGroup,
    isLoading,
    isLoggingOut,
    error,
    // Actions
    switchGroup,
    switchGroupById,
    logout,
  };
};
