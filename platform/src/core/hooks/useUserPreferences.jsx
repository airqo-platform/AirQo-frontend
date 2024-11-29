import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getIndividualUserPreferences } from '@/lib/store/services/account/UserDefaultsSlice';

const useUserPreferences = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchPreferences = async () => {
      const storedUser = localStorage.getItem('loggedUser');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          const userId = parsedUser?._id;
          if (userId) {
            await dispatch(getIndividualUserPreferences(userId));
          }
        } catch (error) {
          console.error('Failed to parse loggedUser from localStorage:', error);
        }
      }
    };

    fetchPreferences();
  }, [dispatch]);
};

export default useUserPreferences;
