import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useSWRConfig } from 'swr';
import { setActiveGroup, setActiveGroupById } from '@/shared/store/userSlice';
import { useUser } from './useUser';
import { useLogout } from './useLogout';
import type { NormalizedGroup } from '@/shared/utils/userUtils';

/**
 * Hook for user-related actions and state
 */
export const useUserActions = () => {
  const dispatch = useDispatch();
  const { mutate } = useSWRConfig();
  const { user, groups, activeGroup, isLoading, isLoggingOut, error } =
    useUser();
  const logout = useLogout();

  const switchGroup = useCallback(
    (group: NormalizedGroup) => {
      const previousGroupId = activeGroup?.id;

      // Only proceed if actually switching to a different group
      if (previousGroupId === group.id) {
        return; // No need to do anything if it's the same group
      }

      // Switch to new group
      dispatch(setActiveGroup(group));

      // Invalidate all SWR cache related to preferences and themes
      // This ensures fresh data is fetched for the new group and prevents cross-group data bleeding
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
            keyText.startsWith('preferences/theme/') ||
            keyText.includes('/preferences') ||
            keyText.includes('/theme') ||
            keyText.includes('group/cohorts') ||
            keyText.includes('cohort/details') ||
            keyText.includes('cohort/sites') ||
            keyText.includes('cohort/devices') ||
            keyText.includes('/devices/groups/') ||
            keyText.includes('/devices/cohorts/') ||
            (!!previousGroupId && keyText.includes(`/${previousGroupId}`)) // Clear old group specific cache
          );
        },
        undefined,
        { revalidate: false } // Don't revalidate immediately, let components handle their own revalidation
      );
    },
    [activeGroup?.id, dispatch, mutate]
  );

  const switchGroupById = useCallback(
    (groupId: string) => {
      const group = groups.find(g => g.id === groupId);
      if (group) {
        switchGroup(group);
      } else {
        // Fallback to just dispatching the action if group not found
        dispatch(setActiveGroupById(groupId));
      }
    },
    [dispatch, groups, switchGroup]
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
