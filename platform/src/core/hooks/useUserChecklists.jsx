import { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUserChecklists,
  updateUserChecklists,
} from '@/lib/store/services/checklists/CheckData';
import { updateCards } from '@/lib/store/services/checklists/CheckList';
import { useDebounce } from '@/core/hooks';

const useUserChecklists = () => {
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.login.userInfo);
  const cardCheckList = useSelector((state) => state.cardChecklist.cards);
  const debouncedCardCheckList = useDebounce(cardCheckList, 5000);
  const [error, setError] = useState(null);

  const fetchUserData = useCallback(async () => {
    if (userInfo?._id && !localStorage.getItem('dataFetched')) {
      try {
        const action = await dispatch(fetchUserChecklists(userInfo._id));
        if (fetchUserChecklists.fulfilled.match(action)) {
          const { payload } = action;
          if (payload?.length > 0) {
            dispatch(updateCards(payload[0].items));
          }
          localStorage.setItem('dataFetched', 'true');
        } else {
          throw new Error(
            action.error?.message || 'Failed to fetch user checklists.',
          );
        }
      } catch (err) {
        console.error('Failed to fetch user checklists:', err);
        setError(err.message);
      }
    }
  }, [dispatch, userInfo]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    const updateChecklists = async () => {
      if (userInfo?._id && debouncedCardCheckList) {
        try {
          await dispatch(
            updateUserChecklists({
              user_id: userInfo._id,
              items: debouncedCardCheckList,
            }),
          );
        } catch (error) {
          console.error('Failed to update user checklists:', error);
          setError(error.message);
        }
      }
    };

    updateChecklists();
  }, [dispatch, userInfo, debouncedCardCheckList]);

  return { error };
};

export default useUserChecklists;
