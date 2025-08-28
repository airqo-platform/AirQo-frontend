import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { getIndividualUserPreferences } from '@/lib/store/services/account/UserDefaultsSlice';
import { useGetActiveGroup } from '@/app/providers/UnifiedGroupProvider';

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
        // eslint-disable-next-line no-console
        console.warn('No user ID available to fetch preferences.');
        return;
      }

      // Only proceed if we have valid ObjectIds
      if (!isValidObjectId(userID)) {
        // eslint-disable-next-line no-console
        console.warn('Invalid user ID format:', userID);
        return;
      }

      // Check if we already fetched for this combination
      const lastFetched = lastFetchedRef.current;
      if (
        lastFetched.userID === userID &&
        lastFetched.activeGroupId === activeGroupId
      ) {
        return; // Already fetched, skip
      }

      // Only include groupID if it's a valid ObjectId
      const params = { identifier: userID };
      if (activeGroupId && isValidObjectId(activeGroupId)) {
        params.groupID = activeGroupId;
      }

      try {
        // Dispatch the action to fetch user preferences
        await dispatch(getIndividualUserPreferences(params));

        // Only proceed if the component is still mounted
        if (isMounted) {
          // Update last fetched to prevent duplicate calls
          lastFetchedRef.current = { userID, activeGroupId };
        }
      } catch (error) {
        if (isMounted) {
          // eslint-disable-next-line no-console
          console.error('Error fetching user preferences:', error);
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
