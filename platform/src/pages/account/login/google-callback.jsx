import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import jwt_decode from 'jwt-decode';
import Spinner from '@/components/Spinner';
import { handleGoogleCallback, getUserDetails } from '@/core/apis/Account';
import {
  setUserInfo,
  setSuccess,
} from '@/lib/store/services/account/LoginSlice';
import { getIndividualUserPreferences } from '@/lib/store/services/account/UserDefaultsSlice';

const GoogleCallback = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get query parameters from the URL
        const { code, state } = router.query;

        // Call the callback API
        const response = await handleGoogleCallback({ code, state });

        if (response.token) {
          const token = response.token;
          localStorage.setItem('token', token);

          // Get user details using the token
          const decoded = jwt_decode(token);
          const userResponse = await getUserDetails(decoded._id);
          const user = userResponse.users[0];

          if (!user.groups[0]?.grp_title) {
            throw new Error(
              'Server error. Contact support to add you to the AirQo Organisation',
            );
          }

          localStorage.setItem('loggedUser', JSON.stringify(user));

          // Get user preferences
          const preferencesResponse = await dispatch(
            getIndividualUserPreferences({ identifier: user._id }),
          );

          if (preferencesResponse.payload.success) {
            const preferences = preferencesResponse.payload.preferences;
            const activeGroup = preferences[0]?.group_id
              ? user.groups.find(
                  (group) => group._id === preferences[0].group_id,
                )
              : user.groups.find((group) => group.grp_title === 'airqo');
            localStorage.setItem('activeGroup', JSON.stringify(activeGroup));
          }

          dispatch(setUserInfo(user));
          dispatch(setSuccess(true));
          router.push('/Home');
        } else {
          throw new Error('No token received from server');
        }
      } catch (error) {
        console.error('Google callback error:', error);
        const errorMessage =
          error.response?.data?.message || 'Authentication failed';
        router.push(`/account/login?error=${encodeURIComponent(errorMessage)}`);
      }
    };

    if (router.isReady && router.query.code) {
      handleCallback();
    }
  }, [router.isReady, router.query]);

  return (
    <div className="h-screen flex items-center justify-center">
      <Spinner width={40} height={40} />
    </div>
  );
};

export default GoogleCallback;
