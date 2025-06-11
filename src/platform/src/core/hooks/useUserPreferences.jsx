import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getIndividualUserPreferences } from '@/lib/store/services/account/UserDefaultsSlice';
import { useGetActiveGroup } from '@/core/hooks/useGetActiveGroupId';

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
 */
const useUserPreferences = () => {
  const dispatch = useDispatch();
  const { id: activeGroupId, userID } = useGetActiveGroup();

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
          // User preferences fetched successfully
        }
      } catch (error) {
        if (isMounted) {
          // eslint-disable-next-line no-console
          console.error('Error fetching user preferences:', error);
        }
      }
    };

    fetchPreferences();

    // Cleanup function to set the isMounted flag to false upon unmounting
    return () => {
      isMounted = false;
    };
  }, [dispatch, activeGroupId, userID]);
};

export default useUserPreferences;
