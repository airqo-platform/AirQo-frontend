'use client';

import React, { useState, useCallback } from 'react';
import { CheckCircle2, Loader2, AlertCircle, RefreshCw, QrCode, Keyboard } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ReusableDialog from '@/components/shared/dialog/ReusableDialog';
import ReusableInputField from '@/components/shared/inputfield/ReusableInputField';
import { Form, FormField } from '@/components/ui/form';
import { useUserContext } from '@/core/hooks/useUserContext';
import { useAppSelector } from '@/core/redux/hooks';
import { useRouter } from 'next/navigation';
import ReusableToast from '@/components/shared/toast/ReusableToast';
import { QRScanner } from '../devices/qr-scanner';

// ============================================================
// FORM SCHEMA
// ============================================================
const claimDeviceSchema = z.object({
    device_id: z
        .string()
        .min(1, 'Device ID is required')
        .min(3, 'Device ID must be at least 3 characters')
        .regex(
            /^[a-zA-Z0-9_-]+$/,
            'Device ID can only contain letters, numbers, underscores, and hyphens'
        ),
    claim_token: z
        .string()
        .min(1, 'Claim token is required')
        .min(4, 'Claim token must be at least 4 characters'),
});

type ClaimDeviceFormData = z.infer<typeof claimDeviceSchema>;

type FlowStep = 'method-select' | 'manual-input' | 'qr-scan' | 'claiming' | 'assigning' | 'success' | 'partial-success';

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAYS = [500, 1000, 2000];

// ============================================================
// MOCK CONFIG - Toggle these to test different scenarios
// ============================================================
const MOCK_CONFIG = {
    ENABLE_MOCKS: true,
    API1_SHOULD_FAIL: false,
    API2_SHOULD_FAIL: false,
    API1_DELAY_MS: 1500,
    API2_DELAY_MS: 1000,
};

const mockOnboardDevice = async (data: {
    device_name: string;
    claim_token: string;
    owner_type: 'user' | 'organization';
    owner_id: string;
}) => {
    await new Promise(resolve => setTimeout(resolve, MOCK_CONFIG.API1_DELAY_MS));
    
    if (MOCK_CONFIG.API1_SHOULD_FAIL) {
        throw new Error('Mock: Device claim failed - device already claimed');
    }
    
    return {
        success: true,
        message: 'Device onboarded successfully',
        cohort_id: 'mock-cohort-id-12345',
        device: {
            _id: 'mock-device-id-67890',
            name: data.device_name,
            long_name: `AirQo Device ${data.device_name}`,
            status: 'not deployed',
            claim_status: 'claimed' as const,
            claimed_at: new Date().toISOString(),
        },
    };
};

const mockAssignCohortToUser = async (data: { userId: string; cohortIds: string[] }) => {
    await new Promise(resolve => setTimeout(resolve, MOCK_CONFIG.API2_DELAY_MS));
    
    if (MOCK_CONFIG.API2_SHOULD_FAIL) {
        throw new Error('Mock: Failed to assign cohort to user');
    }
    
    return { success: true, message: 'Cohort assigned to user' };
};

const mockAssignCohortToGroup = async (data: { groupId: string; cohortIds: string[] }) => {
    await new Promise(resolve => setTimeout(resolve, MOCK_CONFIG.API2_DELAY_MS));
    
    if (MOCK_CONFIG.API2_SHOULD_FAIL) {
        throw new Error('Mock: Failed to assign cohort to organization');
    }
    
    return { success: true, message: 'Cohort assigned to organization' };
};
// ============================================================
// END MOCK CONFIG
// ============================================================

export interface ClaimedDeviceInfo {
    deviceId: string;
    deviceName: string;
    cohortId: string;
}

export interface ClaimDeviceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (deviceInfo: ClaimedDeviceInfo) => void;
    redirectOnSuccess?: boolean;
}

const ClaimDeviceModal: React.FC<ClaimDeviceModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    redirectOnSuccess = true,
}) => {
    const router = useRouter();
    const { userContext } = useUserContext();
    const activeGroup = useAppSelector(state => state.user.activeGroup);
    const user = useAppSelector(state => state.user.userDetails);

    const [step, setStep] = useState<FlowStep>('method-select');
    const [error, setError] = useState<string | null>(null);
    const [isRetrying, setIsRetrying] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pendingCohortId, setPendingCohortId] = useState<string | null>(null);
    const [claimedDeviceId, setClaimedDeviceId] = useState<string>('');

    const form = useForm<ClaimDeviceFormData>({
        resolver: zodResolver(claimDeviceSchema),
        defaultValues: {
            device_id: '',
            claim_token: '',
        },
    });

    const resetState = useCallback(() => {
        form.reset();
        setStep('method-select');
        setError(null);
        setPendingCohortId(null);
        setIsRetrying(false);
        setIsSubmitting(false);
        setClaimedDeviceId('');
    }, [form]);

    const handleClose = useCallback(() => {
        resetState();
        onClose();
    }, [resetState, onClose]);

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const getRedirectPath = () => {
        return userContext === 'personal' ? '/devices/my-devices' : '/devices/overview';
    };

    const assignCohortWithRetry = async (cohortId: string): Promise<boolean> => {
        for (let attempt = 0; attempt < MAX_RETRY_ATTEMPTS; attempt++) {
            try {
                if (MOCK_CONFIG.ENABLE_MOCKS) {
                    if (userContext === 'personal') {
                        await mockAssignCohortToUser({
                            userId: user?._id || '',
                            cohortIds: [cohortId],
                        });
                    } else {
                        await mockAssignCohortToGroup({
                            groupId: activeGroup?._id || '',
                            cohortIds: [cohortId],
                        });
                    }
                }
                return true;
            } catch (err) {
                console.error(`Assign attempt ${attempt + 1} failed:`, err);
                if (attempt < MAX_RETRY_ATTEMPTS - 1) {
                    await delay(RETRY_DELAYS[attempt]);
                }
            }
        }
        return false;
    };

    const handleRetryAssignment = async () => {
        if (!pendingCohortId) return;

        setIsRetrying(true);
        setError(null);
        setStep('assigning');

        const success = await assignCohortWithRetry(pendingCohortId);

        if (success) {
            setStep('success');
            onSuccess?.({
                deviceId: pendingCohortId!,
                deviceName: claimedDeviceId,
                cohortId: pendingCohortId!,
            });
            if (redirectOnSuccess) {
                setTimeout(() => {
                    handleClose();
                    router.push(getRedirectPath());
                }, 2000);
            }
        } else {
            setError('Unable to complete setup. Please try again or contact support.');
            setStep('partial-success');
        }
        setIsRetrying(false);
    };

    const handleSkipAndContinue = () => {
        ReusableToast({
            message: 'Device claimed. You can complete setup from your devices page.',
            type: 'INFO',
        });
        handleClose();
        if (redirectOnSuccess) {
            router.push(getRedirectPath());
        }
    };

    const claimDevice = async (deviceId: string, claimToken: string) => {
        setError(null);
        setStep('claiming');
        setClaimedDeviceId(deviceId);

        try {
            const ownerType = userContext === 'personal' ? 'user' : 'organization';
            const ownerId = userContext === 'personal' ? user?._id : activeGroup?._id;

            let onboardResponse;
            
            if (MOCK_CONFIG.ENABLE_MOCKS) {
                onboardResponse = await mockOnboardDevice({
                    device_name: deviceId,
                    claim_token: claimToken,
                    owner_type: ownerType,
                    owner_id: ownerId || '',
                });
            }

            const cohortId = onboardResponse!.cohort_id;
            setPendingCohortId(cohortId);

            setStep('assigning');
            const assignSuccess = await assignCohortWithRetry(cohortId);

            if (assignSuccess) {
                setStep('success');
                onSuccess?.({
                    deviceId: cohortId,
                    deviceName: deviceId,
                    cohortId: cohortId,
                });
                if (redirectOnSuccess) {
                    setTimeout(() => {
                        handleClose();
                        router.push(getRedirectPath());
                    }, 2000);
                }
            } else {
                setError('Device claimed, but we couldn\'t complete the setup.');
                setStep('partial-success');
            }
        } catch (err: any) {
            console.error('Error in claim flow:', err);
            setError(err.message || 'Failed to claim device. Please try again.');
            setStep('manual-input');
        }
    };

    const onManualSubmit = async (data: ClaimDeviceFormData) => {
        setIsSubmitting(true);
        await claimDevice(data.device_id, data.claim_token);
        setIsSubmitting(false);
    };

    const parseQRCode = (qrData: string): { deviceId: string; claimToken: string } | null => {
        try {
            const url = new URL(qrData);
            const deviceId = url.searchParams.get('id');
            const claimToken = url.searchParams.get('token');
            
            if (deviceId && claimToken) {
                return { deviceId, claimToken };
            }
        } catch {
            // Not a URL
        }

        try {
            const parsed = JSON.parse(qrData);
            if (parsed.device_id && parsed.token) {
                return { deviceId: parsed.device_id, claimToken: parsed.token };
            }
        } catch {
            // Not JSON
        }

        return null;
    };

    const handleQRScan = async (result: string) => {
        const parsed = parseQRCode(result);
        
        if (parsed) {
            await claimDevice(parsed.deviceId, parsed.claimToken);
        } else {
            setError('Invalid QR code format. Please try manual entry.');
            setStep('manual-input');
        }
    };

    const getDialogConfig = () => {
        const baseConfig = {
            title: 'Add AirQo Device',
            showFooter: false,
            showCloseButton: true,
            preventBackdropClose: false,
            primaryAction: undefined as ClaimDeviceModalProps['onSuccess'] extends undefined ? undefined : {
                label: string;
                onClick: () => void;
                disabled?: boolean;
            } | undefined,
            secondaryAction: undefined as {
                label: string;
                onClick: () => void;
                variant?: 'outline';
            } | undefined,
        };

        switch (step) {
            case 'method-select':
                return {
                    ...baseConfig,
                    showFooter: false,
                };

            case 'qr-scan':
                return {
                    ...baseConfig,
                    title: 'Scan QR Code',
                    showFooter: true,
                    secondaryAction: {
                        label: 'Back',
                        onClick: () => setStep('method-select'),
                        variant: 'outline' as const,
                    },
                };

            case 'manual-input':
                return {
                    ...baseConfig,
                    showFooter: true,
                    primaryAction: {
                        label: isSubmitting ? 'Adding...' : 'Add Device',
                        onClick: form.handleSubmit(onManualSubmit),
                        disabled: isSubmitting,
                    },
                    secondaryAction: {
                        label: 'Back',
                        onClick: () => setStep('method-select'),
                        variant: 'outline' as const,
                    },
                };

            case 'claiming':
            case 'assigning':
                return {
                    ...baseConfig,
                    title: step === 'claiming' ? 'Claiming Device...' : 'Completing Setup...',
                    showCloseButton: false,
                    preventBackdropClose: true,
                    showFooter: false,
                };

            case 'partial-success':
                return {
                    ...baseConfig,
                    title: 'Almost There',
                    showFooter: true,
                    primaryAction: {
                        label: isRetrying ? 'Retrying...' : 'Retry Setup',
                        onClick: handleRetryAssignment,
                        disabled: isRetrying,
                    },
                    secondaryAction: {
                        label: 'Continue Anyway',
                        onClick: handleSkipAndContinue,
                        variant: 'outline' as const,
                    },
                };

            case 'success':
                return {
                    ...baseConfig,
                    title: 'Success!',
                    showCloseButton: false,
                    preventBackdropClose: true,
                    showFooter: false,
                };

            default:
                return baseConfig;
        }
    };

    const dialogConfig = getDialogConfig();

    return (
        <ReusableDialog
            isOpen={isOpen}
            onClose={handleClose}
            title={dialogConfig.title}
            showCloseButton={dialogConfig.showCloseButton}
            preventBackdropClose={dialogConfig.preventBackdropClose}
            showFooter={dialogConfig.showFooter}
            primaryAction={dialogConfig.primaryAction}
            secondaryAction={dialogConfig.secondaryAction}
        >
            <div className="space-y-6 py-2">
                {/* Method Selection Step */}
                {step === 'method-select' && (
                    <div className="space-y-6">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Choose how you'd like to add your device.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                onClick={() => setStep('qr-scan')}
                                className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            >
                                <QrCode className="w-10 h-10 text-blue-600 dark:text-blue-400 mb-3" />
                                <span className="font-medium text-gray-900 dark:text-white">Scan QR Code</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Fast & automatic
                                </span>
                            </button>

                            <button
                                onClick={() => setStep('manual-input')}
                                className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            >
                                <Keyboard className="w-10 h-10 text-blue-600 dark:text-blue-400 mb-3" />
                                <span className="font-medium text-gray-900 dark:text-white">Enter Manually</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Type device details
                                </span>
                            </button>
                        </div>
                    </div>
                )}

                {/* QR Scan Step */}
                {step === 'qr-scan' && (
                    <div className="space-y-4">
                        <QRScanner
                            onScan={handleQRScan}
                            onClose={() => setStep('method-select')}
                            showCloseButton={false}
                        />
                        
                        <button
                            onClick={() => setStep('manual-input')}
                            className="w-full text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Having trouble? Enter details manually
                        </button>
                    </div>
                )}

                {/* Manual Input Step */}
                {step === 'manual-input' && (
                    <Form {...form}>
                        <div className="space-y-6">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Enter the device details found on the shipping label.
                            </p>

                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="device_id"
                                    render={({ field, fieldState }) => (
                                        <ReusableInputField
                                            label="Device ID (Serial Number)"
                                            placeholder="e.g. aq_g5_001"
                                            error={fieldState.error?.message}
                                            required
                                            {...field}
                                        />
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="claim_token"
                                    render={({ field, fieldState }) => (
                                        <ReusableInputField
                                            label="Claim Token"
                                            placeholder="Enter unique token"
                                            error={fieldState.error?.message}
                                            required
                                            {...field}
                                        />
                                    )}
                                />
                            </div>

                            {error && (
                                <div className="flex items-center p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
                                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                                    {error}
                                </div>
                            )}
                        </div>
                    </Form>
                )}

                {/* Loading Steps */}
                {(step === 'claiming' || step === 'assigning') && (
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                        <div className="text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Please wait while we set up your device.
                            </p>
                        </div>
                    </div>
                )}

                {/* Partial Success */}
                {step === 'partial-success' && (
                    <div className="flex flex-col items-center justify-center py-6 space-y-4">
                        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                We couldn't complete the final setup step.
                            </p>
                        </div>

                        <div className="w-full p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                    Device "{claimedDeviceId}" claimed successfully
                                </span>
                            </div>
                        </div>

                        {error && (
                            <div className="w-full p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <div className="flex items-start gap-2 text-red-600 dark:text-red-400">
                                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm">{error}</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Full Success */}
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
                                {redirectOnSuccess ? 'Redirecting you to your devices...' : 'You can now close this dialog.'}
                            </p>
                        </div>

                        <div className="w-full space-y-2 mt-2">
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Device claimed</span>
                            </div>
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Setup complete</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ReusableDialog>
    );
};

export default ClaimDeviceModal;