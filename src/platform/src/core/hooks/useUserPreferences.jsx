import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getIndividualUserPreferences } from '@/lib/store/services/account/UserDefaultsSlice';
import { useGetActiveGroup } from '@/core/hooks/useGetActiveGroupId';

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
        console.warn('No user ID available to fetch preferences.');
        return;
      }

      try {
        // Dispatch the action to fetch user preferences
        await dispatch(
          getIndividualUserPreferences({
            identifier: userID,
            groupID: activeGroupId,
          }),
        );
        // Only proceed if the component is still mounted
        if (isMounted) {
          console.log('User preferences fetched successfully.');
        }
      } catch (error) {
        if (isMounted) {
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
