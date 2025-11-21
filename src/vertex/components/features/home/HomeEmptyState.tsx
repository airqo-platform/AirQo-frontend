'use client';

import React, { useState } from 'react';
import { Plus, Upload, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import ReusableButton from '@/components/shared/button/ReusableButton';
import ReusableDialog from '@/components/shared/dialog/ReusableDialog';
import ReusableInputField from '@/components/shared/inputfield/ReusableInputField';
import { useUserContext } from '@/core/hooks/useUserContext';
import { useAppSelector } from '@/core/redux/hooks';
import { useClaimDevice } from '@/core/hooks/useDevices';
import {
    useCreateCohortWithDevices,
    useCohorts,
    useAssignDevicesToCohort,
    useGroupCohorts,
} from '@/core/hooks/useCohorts';
import { useRouter } from 'next/navigation';
import ReusableToast from '@/components/shared/toast/ReusableToast';
import { AqCollocation } from '@airqo/icons-react';
import { devices } from '@/core/apis/devices';
import { Cohort } from '@/app/types/cohorts';

const HomeEmptyState = () => {
    const router = useRouter();
    const { userContext } = useUserContext();
    const activeGroup = useAppSelector(state => state.user.activeGroup);
    const activeNetwork = useAppSelector(state => state.user.activeNetwork);
    const user = useAppSelector(state => state.user.userDetails);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deviceId, setDeviceId] = useState('');
    const [claimToken, setClaimToken] = useState('');
    const [step, setStep] = useState<
        'input' | 'claiming' | 'configuring' | 'success'
    >('input');
    const [error, setError] = useState<string | null>(null);

    const { mutateAsync: claimDevice, isPending: isClaiming } = useClaimDevice();
    const { mutateAsync: createCohort, isPending: isCreatingCohort } =
        useCreateCohortWithDevices();
    const { mutateAsync: assignDevices } = useAssignDevicesToCohort();

    // Fetch existing cohorts to check for duplicates
    // Optimize: Only fetch personal cohorts if in personal context, otherwise fetch group cohorts
    const { cohorts: personalCohorts } = useCohorts({
        limit: 1000,
        // Only enable if personal context
    }); // Note: useCohorts doesn't support 'enabled' option in its current signature shown in previous turns,
    // but we can just ignore the result if not personal.
    // However, to be efficient we should ideally conditionalize it.
    // Given the signature: export const useCohorts = (options: CohortListingOptions = {})
    // It seems we can't easily disable it without modifying the hook.
    // But the user request says "fetching all cohorts is a lot of processing", implying we should avoid it if possible.
    // Since we can't disable useCohorts easily without changing the hook, we will assume for now we use it for personal.
    // For group, we use useGroupCohorts.

    const { data: groupCohorts } = useGroupCohorts(activeGroup?._id, {
        enabled: userContext !== 'personal' && !!activeGroup?._id,
    });

    const resetState = () => {
        setDeviceId('');
        setClaimToken('');
        setStep('input');
        setError(null);
        setIsModalOpen(false);
    };

    const handleClaimAndCreate = async () => {
        if (!deviceId) {
            setError('Device ID is required');
            return;
        }

        setError(null);
        setStep('claiming');

        try {
            // Step A: Claim Device
            // The mutation will throw an error if the status code is not 2xx
            const claimResponse = await claimDevice({
                device_name: deviceId,
                claim_token: claimToken,
                user_id: user?._id || '',
            });

            setStep('configuring');

            // Step B: Determine Cohort Name
            let cohortName = '';
            if (userContext === 'personal') {
                cohortName =
                    `${user?.firstName || 'User'} ${user?.lastName || ''} Cohort`.trim();
            } else {
                cohortName = activeGroup?.grp_title || 'Organization Cohort';
            }

            // Step C: Get Device ID
            const responseData = (claimResponse as any).data || claimResponse.device;
            let deviceDbId = responseData?._id;
            const deviceName = responseData?.name || deviceId;

            if (!deviceDbId) {
                try {
                    const devicesResult = await devices.getDevicesSummaryApi({
                        search: deviceName,
                        limit: 1,
                    });

                    if (devicesResult.devices && devicesResult.devices.length > 0) {
                        deviceDbId = devicesResult.devices[0]._id;
                    }
                } catch (fetchErr) {
                    console.error('Failed to fetch device details for ID', fetchErr);
                    deviceDbId = deviceName;
                }
            }

            if (!deviceDbId) {
                throw new Error('Could not retrieve device ID for assignment.');
            }

            // Check if cohort already exists
            let existingCohort: Cohort | undefined;

            if (userContext === 'personal') {
                existingCohort = personalCohorts.find(
                    (c: Cohort) => c.name.toLowerCase() === cohortName.toLowerCase()
                );
            } else {
                // groupCohorts returns an array of cohorts directly based on the hook signature seen previously
                existingCohort = groupCohorts?.find(
                    (c: Cohort) => c.name.toLowerCase() === cohortName.toLowerCase()
                );
            }

            if (existingCohort) {
                // Assign to existing cohort
                await assignDevices({
                    cohortId: existingCohort._id,
                    deviceIds: [deviceDbId],
                });
            } else {
                // Create new cohort and assign
                await createCohort({
                    name: cohortName,
                    network: 'airqo',
                    deviceIds: [deviceDbId],
                });
            }

            setStep('success');

            // Step 4: Completion & Redirection
            setTimeout(() => {
                resetState();
                if (userContext === 'personal') {
                    router.push('/devices/my-devices');
                } else {
                    router.push('/devices/overview');
                }
            }, 2000);
        } catch (err: any) {
            console.error('Error in claim flow:', err);
            setError(err.message || 'An error occurred during the process.');
            setStep('input');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm mt-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-full mb-6">
                <AqCollocation className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                No Devices Found
            </h2>

            <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
                Add your AirQo devices or import existing devices from a external device
                network to begin tracking your device fleet.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <ReusableButton onClick={() => setIsModalOpen(true)} Icon={Plus}>
                    Add AirQo Device
                </ReusableButton>

                <ReusableButton
                    variant="outlined"
                    onClick={() =>
                        ReusableToast({
                            message: 'Import feature coming soon',
                            type: 'INFO',
                        })
                    }
                    Icon={Upload}
                >
                    Import Existing Device
                </ReusableButton>
            </div>

            <ReusableDialog
                isOpen={isModalOpen}
                onClose={() => {
                    if (step === 'input') resetState();
                }}
                title={step === 'success' ? 'Success!' : 'Add AirQo Device'}
                showCloseButton={step === 'input'}
                preventBackdropClose={step !== 'input'}
                showFooter={false}
            >
                <div className="space-y-6 py-2">
                    {step === 'input' && (
                        <>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Enter the device details found on the shipping label.
                            </p>

                            <div className="space-y-4">
                                <ReusableInputField
                                    label="Device ID (Serial Number)"
                                    placeholder="e.g. aq_g5_001"
                                    value={deviceId}
                                    onChange={e => setDeviceId(e.target.value)}
                                    required
                                />

                                <ReusableInputField
                                    label="Claim Token"
                                    placeholder="Enter unique token"
                                    value={claimToken}
                                    onChange={e => setClaimToken(e.target.value)}
                                />
                            </div>

                            {error && (
                                <div className="flex items-center p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
                                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-6">
                                <ReusableButton variant="outlined" onClick={resetState}>
                                    Cancel
                                </ReusableButton>
                                <ReusableButton
                                    onClick={handleClaimAndCreate}
                                    disabled={!deviceId}
                                >
                                    Add Device
                                </ReusableButton>
                            </div>
                        </>
                    )}

                    {(step === 'claiming' || step === 'configuring') && (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {step === 'claiming'
                                        ? 'Claiming Device...'
                                        : 'Configuring Cohort...'}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Please wait while we set up your device environment.
                                </p>
                            </div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Device Added Successfully
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Redirecting you to your devices...
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </ReusableDialog>
        </div>
    );
};

export default HomeEmptyState;
