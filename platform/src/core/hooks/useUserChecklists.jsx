import { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUserChecklists,
  updateUserChecklists,
} from '@/lib/store/services/checklists/CheckData';
import { updateCards } from '@/lib/store/services/checklists/CheckList';
import { useDebounce } from '@/core/hooks';

// Define a constant key prefix for localStorage
const DATA_FETCHED_KEY_PREFIX = 'dataFetched_';

/**
 * Utility functions for localStorage access.
 */
const localStorageUtils = {
  /**
   * Check if data has been fetched for a specific user.
   */
  isDataFetched: (userId) => {
    if (typeof window !== 'undefined' && userId) {
      return (
        localStorage.getItem(`${DATA_FETCHED_KEY_PREFIX}${userId}`) === 'true'
      );
    }
    return false;
  },

  /**
   * Mark data as fetched for a specific user.
   */
  setDataFetched: (userId) => {
    if (typeof window !== 'undefined' && userId) {
      localStorage.setItem(`${DATA_FETCHED_KEY_PREFIX}${userId}`, 'true');
    }
  },

  /**
   * Reset the data fetched flag for a specific user.
   */
  resetDataFetched: (userId) => {
    if (typeof window !== 'undefined' && userId) {
      localStorage.removeItem(`${DATA_FETCHED_KEY_PREFIX}${userId}`);
    }
  },
};

/**
 * Custom hook to manage user checklists.
 *
 * It fetches the user's checklists when the user is logged in and data hasn't been fetched yet.
 */
const useUserChecklists = () => {
  const dispatch = useDispatch();

  // Select necessary pieces of state from Redux store
  const userInfo = useSelector((state) => state.login.userInfo);
  const cardCheckList = useSelector((state) => state.cardChecklist.cards);

  // Debounce the cardCheckList to limit the frequency of updates
  const debouncedCardCheckList = useDebounce(cardCheckList, 5000);

  // Local state to manage errors and loading status
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  /**
   * Fetch user checklists from the server.
   * Dispatches actions to fetch and update the Redux store.
   */
  const fetchUserData = useCallback(async () => {
    if (userInfo?._id && !localStorageUtils.isDataFetched(userInfo._id)) {
      setLoading(true);
      try {
        // Dispatch the fetchUserChecklists action
        const action = await dispatch(fetchUserChecklists(userInfo._id));

        if (fetchUserChecklists.fulfilled.match(action)) {
          const { payload } = action;

          // Ensure payload is an array and has items
          if (Array.isArray(payload) && payload.length > 0) {
            // Dispatch the updateCards action with the first item's items
            dispatch(updateCards(payload[0].items));
          }

          // Mark data as fetched
          localStorageUtils.setDataFetched(userInfo._id);
        } else {
          // Handle the rejected action
          const errorMsg =
            action.error?.message || 'Failed to fetch user checklists.';
          throw new Error(errorMsg);
        }
      } catch (err) {
        // Log and set the error state
        console.error('Failed to fetch user checklists:', err);
        setError(
          err.message ||
            'An unexpected error occurred while fetching checklists.',
        );
      } finally {
        // Always set loading to false when done
        setLoading(false);
      }
    }
  }, [dispatch, userInfo]);

  /**
   * Update user checklists on the server with debounced changes.
   */
  const updateChecklists = useCallback(async () => {
    if (
      userInfo?._id &&
      debouncedCardCheckList &&
      debouncedCardCheckList.length > 0
    ) {
      try {
        const action = await dispatch(
          updateUserChecklists({
            user_id: userInfo._id,
            items: debouncedCardCheckList,
          }),
        );

        if (updateUserChecklists.rejected.match(action)) {
          const errorMsg =
            action.error?.message || 'Failed to update user checklists.';
          throw new Error(errorMsg);
        }
      } catch (err) {
        console.error('Failed to update user checklists:', err);
        setError(
          err.message ||
            'An unexpected error occurred while updating checklists.',
        );
      }
    }
  }, [dispatch, userInfo, debouncedCardCheckList]);

  /**
   * Effect to fetch user data when the component mounts or when fetchUserData changes.
   */
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  /**
   * Effect to update checklists when debouncedCardCheckList changes.
   */
  useEffect(() => {
    updateChecklists();
  }, [updateChecklists]);

  /**
   * Optional: Provide a method to reset the data fetched flag.
   * This can be used if you need to refetch the data.
   */
  const resetDataFetched = useCallback(() => {
    if (userInfo?._id) {
      localStorageUtils.resetDataFetched(userInfo._id);
      fetchUserData();
    }
  }, [userInfo, fetchUserData]);

  return { error, loading, cardCheckList, resetDataFetched };
};

export default useUserChecklists;
