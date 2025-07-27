// components/Account/IndividualAccountInterest.jsx
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import AccountPageLayout from '@/components/Account/Layout';
import { useRouter, useParams } from 'next/navigation';
import CustomToast from '@/common/components/Toast/CustomToast';
import {
  verifyUserEmailApi,
  updateUserCreationDetailsWithToken,
  postUserPreferencesApiWithToken,
} from '@/core/apis/Account';
import { getSiteSummaryDetailsWithToken } from '@/core/apis/DeviceRegistry';

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

const SiteCard = ({ site, isSelected, onSelect, isDisabled }) => (
  <div
    onClick={() => !isDisabled && onSelect(site)}
    className={`p-3 rounded-md border cursor-pointer transition-all duration-150 ease-in-out ${
      isSelected
        ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
        : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:shadow-sm'
    } ${isDisabled && !isSelected ? 'opacity-60 cursor-not-allowed' : ''}`}
  >
    <div className="flex items-center">
      <input
        type="checkbox"
        checked={isSelected}
        readOnly
        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer flex-shrink-0"
      />
      <div className="ml-3 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {site.name}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {site.city ? `${site.city}, ` : ''}
          {site.country}
        </p>
      </div>
    </div>
  </div>
);

export default function IndividualAccountInterest() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id;
  const token = params?.token;

  const [currentStep, setCurrentStep] = useState(1);
  const [sites, setSites] = useState([]);
  const [selectedSites, setSelectedSites] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [interestDetails, setInterestDetails] = useState('');
  const [loading, setLoading] = useState({
    sites: true,
    step1: false,
    step2: false,
  });
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSites = useMemo(() => {
    if (!searchTerm.trim()) return sites;
    const term = searchTerm.toLowerCase().trim();
    return sites.filter((site) => {
      const name = site.name ? site.name.toLowerCase() : '';
      const country = site.country ? site.country.toLowerCase() : '';
      const city = site.city ? site.city.toLowerCase() : '';
      return (
        name.includes(term) || country.includes(term) || city.includes(term)
      );
    });
  }, [sites, searchTerm]);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (!userId || !token) return;

      verifyUserEmailApi(userId, token)
        .then((response) => {
          if (isMounted && response?.success === true) {
            CustomToast({
              message: 'Email verified successfully!',
              type: 'success',
            });
          }
        })
        .catch((err) => {
          console.warn(
            'Email verification check completed (may have been already verified).',
            err,
          );
          if (isMounted) {
            CustomToast({
              message: 'Email verification check completed.',
              type: 'info',
            });
          }
        });

      try {
        const siteResponse = await getSiteSummaryDetailsWithToken();
        if (isMounted && siteResponse?.success) {
          setSites(siteResponse.sites || []);
        } else if (isMounted) {
          CustomToast({
            message: 'Could not load all locations.',
            type: 'warning',
          });
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching sites:', err);
          CustomToast({ message: 'Failed to load locations.', type: 'error' });
        }
      } finally {
        if (isMounted) setLoading((prev) => ({ ...prev, sites: false }));
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [userId, token]);

  const handleSiteSelect = useCallback((site) => {
    setSelectedSites((prev) => {
      const isSelected = prev.some((s) => s._id === site._id);
      if (isSelected) {
        return prev.filter((s) => s._id !== site._id);
      } else {
        if (prev.length >= 4) return prev;
        return [...prev, site];
      }
    });
  }, []);

  const handleIndustrySelect = (industry) => {
    setSelectedIndustry(industry);
  };

  const handleSavePreferences = async () => {
    if (loading.step1 || !userId || !token || selectedSites.length === 0)
      return;
    setLoading((prev) => ({ ...prev, step1: true }));

    try {
      const payload = {
        selected_sites: selectedSites.map((site) => ({
          _id: site._id,
          latitude: site.latitude,
          longitude: site.longitude,
          country: site.country,
          name: site.name,
          search_name: site.search_name,
        })),
        user_id: userId,
      };

      const response = await postUserPreferencesApiWithToken(payload);
      if (response?.success) {
        setCurrentStep(2);
      } else {
        const errorMsg =
          response?.message || response?.errors || 'Failed to save locations.';
        throw new Error(
          typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg),
        );
      }
    } catch (err) {
      console.error('API Error saving preferences:', err);
      CustomToast({
        message: `Error: ${err.message || 'Failed to save locations.'}`,
        type: 'error',
      });
    } finally {
      setLoading((prev) => ({ ...prev, step1: false }));
    }
  };

  const handleSaveDetails = async () => {
    if (loading.step2 || !userId || !token) return;

    if (!selectedIndustry || !interestDetails.trim()) {
      CustomToast({ message: 'Please complete all fields.', type: 'error' });
      return;
    }

    setLoading((prev) => ({ ...prev, step2: true }));

    try {
      const payload = {
        industry: selectedIndustry,
        interest: interestDetails.trim(),
      };
      const response = await updateUserCreationDetailsWithToken(
        payload,
        userId,
      );

      if (response?.success) {
        CustomToast({
          message: 'Setup completed successfully!',
          type: 'success',
        });
        router.push('/user/creation/get-started');
      } else {
        const errorMsg =
          response?.message || response?.errors || 'Failed to save details.';
        throw new Error(
          typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg),
        );
      }
    } catch (err) {
      console.error('API Error saving details:', err);
      CustomToast({
        message: `Error: ${err.message || 'Failed to save details.'}`,
        type: 'error',
      });
    } finally {
      setLoading((prev) => ({ ...prev, step2: false }));
    }
  };

  return (
    <AccountPageLayout
      pageTitle="Get Started | AirQo"
      childrenHeight="lg:h-auto"
    >
      <div className="w-full mx-auto">
        {currentStep === 1 && (
          <div className="transition-opacity duration-300">
            <div className="text-left mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Select Your Locations
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Choose up to 4 locations you are interested in.
              </p>
            </div>

            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  disabled={loading.sites}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="mt-2">
              {loading.sites ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-3"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Loading locations...
                  </p>
                </div>
              ) : filteredSites.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1">
                  {filteredSites.map((site) => (
                    <SiteCard
                      key={site._id}
                      site={site}
                      isSelected={selectedSites.some((s) => s._id === site._id)}
                      onSelect={handleSiteSelect}
                      isDisabled={
                        selectedSites.length >= 4 &&
                        !selectedSites.some((s) => s._id === site._id)
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center rounded-md border border-dashed border-gray-300 dark:border-gray-700">
                  <svg
                    className="mx-auto h-10 w-10 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    No locations found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {searchTerm
                      ? 'Try a different search term.'
                      : 'No locations match your criteria.'}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    selectedSites.length > 0
                      ? selectedSites.length >= 4
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {selectedSites.length}/4 selected
                </span>
              </div>
              <button
                onClick={handleSavePreferences}
                disabled={
                  loading.step1 || loading.sites || selectedSites.length === 0
                }
                className={`w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary flex items-center justify-center ${
                  selectedSites.length > 0 && !loading.step1 && !loading.sites
                    ? 'bg-primary hover:bg-primary/90 text-white shadow-sm'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                {loading.step1 ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Continue'
                )}
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="transition-opacity duration-300">
            <div className="text-left mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Your Interests
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Help us tailor your experience.
              </p>
            </div>

            <div className="mt-6">
              <h3 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-3">
                Which industry are you in?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {radioOptions.map((label) => (
                  <div
                    key={label}
                    onClick={() => handleIndustrySelect(label)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleIndustrySelect(label);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className={`p-3 text-sm rounded-md border cursor-pointer transition-colors ${
                      selectedIndustry === label
                        ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center mr-3 flex-shrink-0 ${
                          selectedIndustry === label
                            ? 'border-primary bg-primary'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {selectedIndustry === label && (
                          <svg
                            className="h-3 w-3 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <span>{label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <label
                htmlFor="interestDetails"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Tell us more about your specific interests
              </label>
              <textarea
                id="interestDetails"
                value={interestDetails}
                onChange={(e) => setInterestDetails(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="E.g., I'm a researcher focusing on PM2.5 trends..."
              />
            </div>

            <div className="mt-8 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setCurrentStep(1)}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary flex items-center justify-center"
              >
                <svg
                  className="h-4 w-4 mr-1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Back
              </button>
              <button
                onClick={handleSaveDetails}
                disabled={
                  loading.step2 || !selectedIndustry || !interestDetails.trim()
                }
                className={`w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary flex items-center justify-center ${
                  selectedIndustry && interestDetails.trim() && !loading.step2
                    ? 'bg-primary hover:bg-primary/90 text-white shadow-sm'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                {loading.step2 ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Finishing...
                  </>
                ) : (
                  <>
                    Finish Setup
                    <svg
                      className="h-4 w-4 ml-1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </AccountPageLayout>
  );
}
