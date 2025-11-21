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

  const switchGroup = (group: NormalizedGroup) => {
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
        if (typeof key !== 'string') return false;
        return (
          key.startsWith('preferences/') ||
          key.startsWith('preferences/theme/') ||
          key.includes('/preferences') ||
          key.includes('/theme') ||
          key.includes(`/${previousGroupId}`) // Clear old group specific cache
        );
      },
      undefined,
      { revalidate: false } // Don't revalidate immediately, let components handle their own revalidation
    );
  };

  const switchGroupById = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      switchGroup(group);
    } else {
      // Fallback to just dispatching the action if group not found
      dispatch(setActiveGroupById(groupId));
    }
  };

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
