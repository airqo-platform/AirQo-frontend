'use client';

import React, { useMemo, useState, useEffect, useRef, useId } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useParams } from 'next/navigation';
import AuthLayout from '@/shared/layouts/AuthLayout';
import { Button } from '@/shared/components/ui/button';
import { AqArrowNarrowLeft } from '@airqo/icons-react';
import { SearchField } from '@/shared/components/ui/search-field';
import { TextInput } from '@/shared/components/ui/text-input';
import { LoadingSpinner } from '@/shared/components/ui/loading-spinner';
import {
  useVerifyEmail,
  useSitesSummaryWithToken,
  useUpdatePreferencesWithToken,
  useUpdateUserDetails,
} from '@/shared/hooks';
import { showToast } from '@/shared/components/ui/toast';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';

interface Site {
  _id: string;
  name: string;
  search_name: string;
  location_name: string;
  country: string;
  // Add other fields as needed
}

const INDUSTRIES = [
  'Health Professional',
  'Software Developer',
  'Community Champion',
  'Environmental Scientist',
  'Student',
  'Policy Maker',
  'Researcher',
  'Air Quality Partner',
];

const OptionCard: React.FC<{
  label: string;
  selected: boolean;
  onClick: () => void;
}> = ({ label, selected, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        `w-full text-left rounded-lg border p-4 transition-shadow flex items-center justify-between ` +
        (selected
          ? 'border-primary bg-primary/10 shadow-sm'
          : 'border-gray-200 bg-white hover:shadow-sm')
      }
    >
      <div className="flex items-center gap-3">
        <div
          className={
            `w-5 h-5 rounded-full border flex items-center justify-center ` +
            (selected
              ? 'bg-primary text-white border-primary'
              : 'bg-white border-gray-300')
          }
        >
          {selected ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="w-3 h-3"
            >
              <path
                d="M5 13l4 4L19 7"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <div className="w-3 h-3 rounded-full" />
          )}
        </div>

        <span className="text-sm text-gray-800">{label}</span>
      </div>

      {/* small country / extra info placeholder */}
      <div className="text-xs text-gray-400" />
    </button>
  );
};

const Page: React.FC = () => {
  const params = useParams();
  const userId = params.id as string;
  const token = params.token as string;

  const [step, setStep] = useState<number>(1);
  const [query, setQuery] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState<boolean>(false);

  const hasVerifiedRef = useRef(false);
  const searchInputId = useId();

  const { control, getValues } = useForm({
    defaultValues: {
      notes: '',
    },
  });

  const maxLocations = 4;

  // Verify email on mount
  const { trigger: verifyEmail } = useVerifyEmail();

  // Get sites data
  const { data: sitesData, isLoading: isLoadingSites } =
    useSitesSummaryWithToken(
      { search: query || undefined },
      !!userId && !!token
    );

  // Update preferences and user details
  const { trigger: updatePreferences, isMutating: isUpdatingPreferences } =
    useUpdatePreferencesWithToken();
  const { trigger: updateUserDetails, isMutating: isUpdatingUserDetails } =
    useUpdateUserDetails();

  // Verify email on component mount
  useEffect(() => {
    if (emailVerified || !userId || !token || hasVerifiedRef.current) return;
    hasVerifiedRef.current = true;
    verifyEmail({ userId, token })
      .then(response => {
        setEmailVerified(true);
        if (response && response.success) {
          showToast({
            title: 'Email Verified',
            description: 'Your email has been successfully verified.',
            variant: 'success',
          });
        } else {
          showToast({
            title: 'Email Verification Failed',
            description: response?.message || 'Failed to verify email.',
            variant: 'error',
          });
        }
      })
      .catch(error => {
        setEmailVerified(true);
        const errorMessage = getUserFriendlyErrorMessage(error);
        showToast({
          title: 'Email Verification Failed',
          description: errorMessage,
          variant: 'error',
        });
      });
  }, [userId, token, verifyEmail, emailVerified]);

  const sites = useMemo(() => sitesData?.sites || [], [sitesData]);

  const filteredLocations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sites as unknown as Site[];
    return (sites as unknown as Site[]).filter(
      (site: Site) =>
        site.name?.toLowerCase().includes(q) ||
        site.search_name?.toLowerCase().includes(q) ||
        site.location_name?.toLowerCase().includes(q) ||
        site.country?.toLowerCase().includes(q)
    );
  }, [query, sites]);

  const toggleLocation = (id: string) => {
    setSelectedLocations(prev => {
      if (prev.includes(id)) return prev.filter(p => p !== id);
      if (prev.length >= maxLocations) return prev; // enforce max
      return [...prev, id];
    });
  };

  const finishDisabled =
    !selectedIndustry || isUpdatingPreferences || isUpdatingUserDetails;

  return (
    <AuthLayout
      pageTitle="Your interests"
      heading={step === 1 ? 'Select Your Locations' : 'Your Interests'}
      subtitle={
        step === 1
          ? 'Choose up to 4 locations you are interested in.'
          : 'Help us tailor your experience.'
      }
    >
      <div className="w-full">
        {step === 1 ? (
          <div className="space-y-6">
            <div>
              <label
                htmlFor={searchInputId}
                className="block text-sm font-medium text-gray-700 mb-3"
              >
                Filter by location
              </label>
              <div className="mb-4">
                <SearchField
                  id={searchInputId}
                  placeholder="Search locations..."
                  value={query}
                  onChange={e => setQuery((e.target as HTMLInputElement).value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {isLoadingSites ? (
                  <div className="col-span-2 flex justify-center py-8">
                    <LoadingSpinner size={32} />
                  </div>
                ) : filteredLocations.length === 0 ? (
                  <div className="col-span-2 text-center text-gray-500 py-8">
                    No results found.
                  </div>
                ) : (
                  filteredLocations.map(l => {
                    const selected = selectedLocations.includes(l._id);
                    return (
                      <button
                        key={l._id}
                        type="button"
                        onClick={() => toggleLocation(l._id)}
                        className={`w-full text-left rounded-lg border p-4 transition-shadow flex items-center justify-between ${
                          selected
                            ? 'border-primary bg-primary/10 shadow-sm'
                            : 'border-gray-200 bg-white hover:shadow-sm'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-medium text-gray-800">
                            {l.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {l.country}
                          </div>
                        </div>

                        {selected ? (
                          <div className="text-xs text-primary">Selected</div>
                        ) : (
                          <div className="text-xs text-gray-400">Select</div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="border-t pt-6 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {selectedLocations.length}/{maxLocations} selected
              </div>
              <div>
                <Button
                  variant="filled"
                  disabled={selectedLocations.length === 0}
                  aria-disabled={selectedLocations.length === 0}
                  onClick={() => {
                    if (selectedLocations.length === 0) return;
                    setStep(2);
                  }}
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Which industry are you in?
              </label>

              <div className="grid grid-cols-2 gap-3">
                {INDUSTRIES.map(industry => (
                  <OptionCard
                    key={industry}
                    label={industry}
                    selected={selectedIndustry === industry}
                    onClick={() => setSelectedIndustry(industry)}
                  />
                ))}
              </div>

              <div>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      label="Tell us more about your specific interests"
                      placeholder="E.g., I'm a researcher focusing on PM2.5 trends..."
                      rows={6}
                      {...field}
                    />
                  )}
                />
              </div>
            </div>

            <div className="border-t pt-6 flex items-center justify-between">
              <div>
                <Button
                  variant="outlined"
                  onClick={() => setStep(1)}
                  Icon={AqArrowNarrowLeft}
                >
                  Back
                </Button>
              </div>

              <div>
                <Button
                  variant="filled"
                  disabled={finishDisabled}
                  aria-disabled={finishDisabled}
                  loading={isUpdatingPreferences || isUpdatingUserDetails}
                  onClick={async () => {
                    if (finishDisabled) return; // extra safety

                    try {
                      // Update preferences
                      const selectedSites = (sites as unknown as Site[]).filter(
                        site => selectedLocations.includes(site._id)
                      );
                      const normalizedSites = selectedSites.map(s => ({
                        _id: s._id,
                        name: s.name || s.location_name || s.search_name || '',
                        search_name:
                          s.search_name || s.name || s.location_name || '',
                        country: s.country || '',
                      }));

                      const preferencesPayload = {
                        selected_sites: normalizedSites,
                        user_id: userId,
                      };

                      const userDetailsPayload = {
                        interests: [selectedIndustry!],
                        interestsDescription: getValues('notes').trim(),
                      };

                      await Promise.all([
                        updatePreferences(preferencesPayload),
                        updateUserDetails({
                          userId,
                          details: userDetailsPayload,
                        }),
                      ]);

                      showToast({
                        title: 'Setup Complete',
                        description:
                          'Your preferences have been saved successfully.',
                        variant: 'success',
                      });

                      // TODO: redirect to next step
                    } catch (error) {
                      const errorMessage = getUserFriendlyErrorMessage(error);
                      showToast({
                        title: 'Setup Failed',
                        description: errorMessage,
                        variant: 'error',
                      });
                    }
                  }}
                >
                  Finish Setup
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default Page;
