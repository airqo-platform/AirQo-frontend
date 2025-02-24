import { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUserChecklists,
  updateUserChecklists,
} from '@/lib/store/services/checklists/CheckData';
import { updateCards } from '@/lib/store/services/checklists/CheckList';

// Define a constant key prefix for localStorage
const DATA_FETCHED_KEY_PREFIX = 'dataFetched_';

/**
 * Utility functions for localStorage access.
 */
const localStorageUtils = {
  isDataFetched: (userId) => {
    if (typeof window !== 'undefined' && userId) {
      return (
        localStorage.getItem(`${DATA_FETCHED_KEY_PREFIX}${userId}`) === 'true'
      );
    }
    return false;
  },

  setDataFetched: (userId) => {
    if (typeof window !== 'undefined' && userId) {
      localStorage.setItem(`${DATA_FETCHED_KEY_PREFIX}${userId}`, 'true');
    }
  },

  resetDataFetched: (userId) => {
    if (typeof window !== 'undefined' && userId) {
      localStorage.removeItem(`${DATA_FETCHED_KEY_PREFIX}${userId}`);
    }
  },
};

/**
 * Custom hook to manage user checklists.
 */
const useUserChecklists = () => {
  const dispatch = useDispatch();

  // Select necessary pieces of state from Redux store
  const userInfo = useSelector((state) => state.login.userInfo);
  const cardCheckList = useSelector((state) => state.cardChecklist.cards);

  // Local state to manage errors and loading status
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  /**
   * Fetch user checklists from the server.
   */
  const fetchUserData = useCallback(async () => {
    if (userInfo?._id && !localStorageUtils.isDataFetched(userInfo._id)) {
      setLoading(true);
      try {
        const action = await dispatch(fetchUserChecklists(userInfo._id));

        if (fetchUserChecklists.fulfilled.match(action)) {
          const { payload } = action;

          if (Array.isArray(payload) && payload.length > 0) {
            dispatch(updateCards(payload[0].items));
          }

          localStorageUtils.setDataFetched(userInfo._id);
        } else {
          const errorMsg =
            action.error?.message || 'Failed to fetch user checklists.';
          throw new Error(errorMsg);
        }
      } catch (err) {
        console.error('Failed to fetch user checklists:', err);
        setError(
          err.message ||
            'An unexpected error occurred while fetching checklists.',
        );
      } finally {
        setLoading(false);
      }
    }
  }, [dispatch, userInfo]);

  /**
   * Update user checklists on the server when cardCheckList changes.
   */
  const updateChecklists = useCallback(async () => {
    if (userInfo?._id && cardCheckList && cardCheckList.length > 0) {
      try {
        const action = await dispatch(
          updateUserChecklists({
            user_id: userInfo._id,
            items: cardCheckList,
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
  }, [dispatch, userInfo, cardCheckList]);

  /**
   * Effect to fetch user data when the component mounts or when fetchUserData changes.
   */
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  /**
   * Effect to update checklists when cardCheckList changes.
   */
  useEffect(() => {
    updateChecklists();
  }, [updateChecklists]);

  /**
   * Optional: Provide a method to reset the data fetched flag.
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
