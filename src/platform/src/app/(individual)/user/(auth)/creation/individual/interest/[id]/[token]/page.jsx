'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import AccountPageLayout from '@/components/Account/Layout';
import RadioComponent from '@/components/Account/RadioComponent';
import {
  updateUserCreationDetails,
  verifyUserEmailApi,
} from '@/core/apis/Account';
import { useRouter, useParams } from 'next/navigation';
import CustomToast from '@/common/components/Toast/CustomToast';
import { postUserDefaults } from '@/lib/store/services/account/UserDefaultsSlice';
import { useDispatch } from 'react-redux';

const radioOptions = [
  'Health Professional',
  'Software Developer',
  'Community Champion',
  'Environmental Scientist',
  'Student',
  'Policy Maker',
  'Researcher',
  'Air Quality Partner',
];

export default function IndividualAccountInterest() {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();

  // Memoize userId and token extraction
  const { userId, token } = useMemo(
    () => ({ userId: params?.id, token: params?.token }),
    [params],
  );

  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [interestDetails, setInterestDetails] = useState('');
  // Error state is now handled by CustomToast
  const [loading, setLoading] = useState(false);

  // Verify email on mount
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates if component unmounts

    const verifyEmail = async () => {
      if (userId && token) {
        try {
          // Assuming verifyUserEmailApi returns a promise
          await verifyUserEmailApi(userId, token);
          // Optionally handle success if needed in UI
        } catch (err) {
          // Silently fail or log, as the primary flow continues
          if (process.env.NODE_ENV !== 'production') {
            console.warn('Email verification failed:', err);
          }
        }
      }
    };

    verifyEmail();

    // Cleanup function (optional but good practice)
    return () => {
      isMounted = false;
      // If verifyUserEmailApi triggered side effects (like global state/UI changes),
      // you might need cleanup logic here, but typically not for simple API calls.
    };
  }, [userId, token]); // Dependencies are stable due to useMemo

  const handleUpdate = useCallback(async () => {
    if (loading) return; // Prevent multiple clicks

    setLoading(true);
    // Error state handled by CustomToast

    const payload = {
      industry: selectedIndustry,
      interest: interestDetails.trim(), // Trim whitespace
    };

    try {
      const updateResp = await updateUserCreationDetails(payload, userId);
      if (!updateResp?.success) {
        CustomToast({
          message: updateResp?.message || 'Failed to update user details.',
          type: 'error',
        });
        throw new Error(
          updateResp?.message || 'Failed to update user details.',
        );
      }

      // Unwrap to get the actual payload from the thunk
      const defaultsResp = await dispatch(
        postUserDefaults({ user: userId }),
      ).unwrap();
      if (!defaultsResp?.success) {
        CustomToast({
          message: defaultsResp?.message || 'Failed to set user defaults.',
          type: 'error',
        });
        throw new Error(
          defaultsResp?.message || 'Failed to set user defaults.',
        );
      }

      CustomToast({
        message: 'Your interests have been saved successfully!',
        type: 'success',
      });
      router.push('/user/creation/get-started');
    } catch (err) {
      CustomToast({
        message:
          err.message || 'An unexpected error occurred. Please try again.',
        type: 'error',
      });
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error('Interest update error:', err);
      }
    } finally {
      setLoading(false); // Ensure loading is reset
    }
  }, [selectedIndustry, interestDetails, userId, dispatch, router, loading]); // Added loading to dependencies

  // Simplified form validity check
  const isFormValid = Boolean(selectedIndustry && interestDetails.trim());

  return (
    <AccountPageLayout
      childrenHeight="lg:h-[580]"
      pageTitle="Interest | AirQo"
      rightText="What you've built here is so much better for air pollution monitoring than anything else on the market!"
    >
      {/* Error and success toasts are now handled by CustomToast */}

      <div className="w-full px-0 md:px-2">
        <h2 className="text-3xl font-medium text-black-700 dark:text-white">
          Help us understand your interest
        </h2>
        <p className="mt-3 text-xl font-normal text-black-700 dark:text-gray-300">
          We will help you get started based on your response
        </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedIndustry ? (
            <div className="col-span-2">
              <RadioComponent
                text={selectedIndustry}
                checked
                titleFont="text-md font-normal"
                padding="px-3 py-4"
                width="w-full"
              />
              <div className="mt-6">
                <label
                  htmlFor="interestDetails"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Give us more details about your interests?
                </label>
                <textarea
                  id="interestDetails" // Added id for accessibility
                  value={interestDetails}
                  onChange={(e) => setInterestDetails(e.target.value)}
                  rows={3}
                  className="textarea textarea-lg w-full mt-2 bg-white dark:bg-gray-800 rounded-lg border border-input-light-outline dark:border-gray-600 focus:border-input-outline dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-500"
                  placeholder="Please describe your interests related to being a..."
                />
              </div>
            </div>
          ) : (
            radioOptions.map((label) => (
              <div
                key={label}
                className="w-full"
                onClick={() => setSelectedIndustry(label)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedIndustry(label);
                  }
                }}
                role="button" // Make div focusable and clickable via keyboard
                tabIndex={0} // Make div focusable
                aria-label={`Select ${label}`} // Accessibility label
              >
                <RadioComponent
                  text={label}
                  titleFont="text-md font-normal"
                  padding="px-3 py-4"
                  width="w-full"
                />
              </div>
            ))
          )}
        </div>

        <div className="mt-10 md:w-1/3">
          <button
            type="button"
            disabled={!isFormValid || loading}
            onClick={handleUpdate}
            className={`w-full rounded-[12px] text-sm outline-none border-none transition-colors duration-200 ${
              isFormValid && !loading
                ? 'btn bg-blue-600 hover:bg-blue-500 text-white'
                : 'btn-disabled bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
            style={{ textTransform: 'none' }}
          >
            {loading ? 'Submitting...' : 'Continue'}
          </button>
        </div>
      </div>
    </AccountPageLayout>
  );
}
