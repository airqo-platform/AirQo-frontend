import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { getIndividualUserPreferences } from '@/lib/store/services/account/UserDefaultsSlice';
import { useGetActiveGroup } from '@/app/providers/UnifiedGroupProvider';
import logger from '@/lib/logger';

/**
 * Validates MongoDB ObjectId format
 * @param {string} id - The id to validate
 * @returns {boolean} - Whether the id is valid
 */
const isValidObjectId = (id) => {
  return id && /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Custom hook to fetch and manage user preferences based on the active group and user ID.
 * Optimized to prevent unnecessary API calls and memory leaks
 */
const useUserPreferences = () => {
  const dispatch = useDispatch();
  const { id: activeGroupId, userID } = useGetActiveGroup();
  const lastFetchedRef = useRef({ userID: null, activeGroupId: null });

  useEffect(() => {
    let isMounted = true;

    /**
     * Fetches user preferences if a valid user ID is present.
     */
    const fetchPreferences = async () => {
      if (!userID) {
        logger.warn('No user ID available to fetch preferences.');
        return;
      }

      // Only proceed if we have valid ObjectIds
      if (!isValidObjectId(userID)) {
        logger.warn('Invalid user ID format:', userID);
        return;
      }

      // Check if we already fetched for this combination or marked in-flight
      const lastFetched = lastFetchedRef.current;
      if (
        lastFetched.userID === userID &&
        lastFetched.activeGroupId === activeGroupId
      ) {
        return; // Already fetched or in-flight, skip
      }
      // Mark as in-flight to prevent duplicate calls on rapid re-renders
      lastFetchedRef.current = { userID, activeGroupId };

      // Only include groupID if it's a valid ObjectId
      const params = { identifier: userID };
      if (activeGroupId && isValidObjectId(activeGroupId)) {
        params.groupID = activeGroupId;
      }

      try {
        // Dispatch the action to fetch user preferences
        await dispatch(getIndividualUserPreferences(params));
        // Nothing else to do; lastFetchedRef already set above
      } catch (error) {
        if (isMounted) {
          logger.error('Error fetching user preferences:', error);
          // Reset ref to allow retry after error
          lastFetchedRef.current = { userID: null, activeGroupId: null };
        }
      }
    };

    // Only fetch if userID or activeGroupId changed
    const lastFetched = lastFetchedRef.current;
    if (
      lastFetched.userID !== userID ||
      lastFetched.activeGroupId !== activeGroupId
    ) {
      fetchPreferences();
    }

    // Cleanup function to set the isMounted flag to false upon unmounting
    return () => {
      isMounted = false;
    };
  }, [dispatch, activeGroupId, userID]);
};

export default useUserPreferences;
