import React, { useState, useCallback, useEffect, useMemo } from 'react';
import AccountPageLayout from '@/components/Account/Layout';
import RadioComponent from '@/components/Account/RadioComponent';
import {
  updateUserCreationDetails,
  verifyUserEmailApi,
} from '@/core/apis/Account';
import { useRouter } from 'next/router';
import Toast from '@/components/Toast';
import Spinner from '@/components/Spinner';
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
  const { id: userId, token } = useMemo(
    () => ({ id: router.query.id, token: router.query.token }),
    [router.query],
  );

  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [interestDetails, setInterestDetails] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Verify email on mount
  useEffect(() => {
    if (userId && token) {
      verifyUserEmailApi(userId, token).catch(() => {
        // optional: handle verification failure
      });
    }
  }, [userId, token]);

  const handleUpdate = useCallback(async () => {
    setLoading(true);
    setError('');

    const payload = {
      industry: selectedIndustry,
      interest: interestDetails,
    };

    try {
      const updateResp = await updateUserCreationDetails(payload, userId);
      if (!updateResp.success) throw new Error(updateResp.message);

      const defaultsResp = await dispatch(
        postUserDefaults({ user: userId }),
      ).unwrap();
      if (!defaultsResp.success) throw new Error(defaultsResp.message);

      router.push('/account/creation/get-started');
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [selectedIndustry, interestDetails, userId, dispatch, router]);

  const isFormValid = Boolean(selectedIndustry && interestDetails.trim());

  return (
    <AccountPageLayout
      childrenHeight="lg:h-[580]"
      pageTitle="Interest | AirQo"
      rightText="What you've built here is so much better for air pollution monitoring than anything else on the market!"
    >
      {error && <Toast type="error" timeout={5000} message={error} />}

      <div className="w-full px-0 md:px-2">
        <h2 className="text-3xl font-medium text-black-700">
          Help us understand your interest
        </h2>
        <p className="mt-3 text-xl font-normal text-black-700">
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
                <label className="block text-sm">
                  Give us more details about your interests?
                </label>
                <textarea
                  value={interestDetails}
                  onChange={(e) => setInterestDetails(e.target.value)}
                  rows={3}
                  className="textarea textarea-lg w-full mt-2 bg-white rounded-lg border-input-light-outline focus:border-input-outline"
                  placeholder="Type here"
                />
              </div>
            </div>
          ) : (
            radioOptions.map((label) => (
              <div
                key={label}
                className="w-full"
                onClick={() => setSelectedIndustry(label)}
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
            className={`w-full rounded-[12px] text-sm outline-none border-none transition \
              ${
                isFormValid
                  ? 'btn bg-blue-600 hover:bg-blue-500'
                  : 'btn-disabled bg-white'
              }`}
            style={{ textTransform: 'none' }}
          >
            {loading ? <Spinner width={25} height={25} /> : 'Continue'}
          </button>
        </div>
      </div>
    </AccountPageLayout>
  );
}
