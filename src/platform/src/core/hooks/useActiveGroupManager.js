/**
 * Custom hook to manage active group updates in a controlled way
 * This hook provides a centralized way to update group data while
 * preventing conflicts with the UnifiedGroupProvider
 */

import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { updateGroupDetails } from '@/lib/store/services/groups';
import logger from '@/lib/logger';

export const useActiveGroupManager = () => {
  const dispatch = useDispatch();

  /**
   * Updates group details in Redux without directly setting active group
   * The UnifiedGroupProvider will handle active group updates automatically
   * to prevent conflicts and maintain consistency
   */
  const updateActiveGroupDetails = useCallback(
    async (updatedGroupData) => {
      try {
        logger.info('useActiveGroupManager: Updating group details in Redux', {
          groupId: updatedGroupData._id,
          groupName: updatedGroupData.grp_title,
        });

        // Update group details in Redux
        dispatch(updateGroupDetails(updatedGroupData));

        // Dispatch a custom event to notify other components of the update
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('groupDataUpdated', {
              detail: {
                groupId: updatedGroupData._id,
                groupData: updatedGroupData,
                timestamp: Date.now(),
              },
            }),
          );
        }

        return { success: true };
      } catch (error) {
        logger.error(
          'useActiveGroupManager: Failed to update group details',
          error,
        );
        return { success: false, error: error.message };
      }
    },
    [dispatch],
  );

  /**
   * Refreshes group data after external updates (like domain changes)
   * This triggers a global refresh without directly manipulating active group
   */
  const triggerGroupRefresh = useCallback(() => {
    try {
      logger.info('useActiveGroupManager: Triggering group data refresh');

      // Dispatch refresh events for all components to refetch their data
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('groupDataRefreshRequested'));
        window.dispatchEvent(new Event('logoRefresh'));
      }

      return { success: true };
    } catch (error) {
      logger.error('useActiveGroupManager: Failed to trigger refresh', error);
      return { success: false, error: error.message };
    }
  }, []);

  return {
    updateActiveGroupDetails,
    triggerGroupRefresh,
  };
};

export default useActiveGroupManager;
