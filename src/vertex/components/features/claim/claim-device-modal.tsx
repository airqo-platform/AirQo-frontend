// ClaimDeviceModal.tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import ReusableDialog from '@/components/shared/dialog/ReusableDialog';

import { useAppSelector } from '@/core/redux/hooks';
import { useRouter } from 'next/navigation';
import { useClaimDevice, useBulkClaimDevices } from '@/core/hooks/useDevices';
import { useUserContext } from '@/core/hooks/useUserContext';
import { getApiErrorMessage } from '@/core/utils/getApiErrorMessage';
import {
  useGroupCohorts,
  useVerifyCohort,
  useAssignCohortsToGroup,
  useAssignCohortsToUser,
} from '@/core/hooks/useCohorts';
import dynamic from 'next/dynamic';

const StepLoader = () => (
  <div className="flex justify-center items-center py-12">
    <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
  </div>
);

const BulkClaimResults = dynamic(() => import('./steps/BulkClaimResults').then(mod => mod.BulkClaimResults), { loading: StepLoader });
const CohortImportStep = dynamic(() => import('./steps/CohortImportStep'), { loading: StepLoader });
const ManualInputStep = dynamic(() => import('./steps/ManualInputStep'), { loading: StepLoader });
const QRScanStep = dynamic(() => import('./steps/QRScanStep'), { loading: StepLoader });
const SuccessStep = dynamic(() => import('./steps/SuccessStep'), { loading: StepLoader });
const BulkConfirmationStep = dynamic(() => import('./steps/ConfirmationSteps').then(mod => mod.BulkConfirmationStep), { loading: StepLoader });
const CohortConfirmStep = dynamic(() => import('./steps/ConfirmationSteps').then(mod => mod.CohortConfirmStep), { loading: StepLoader });
const ConfirmationStep = dynamic(() => import('./steps/ConfirmationSteps').then(mod => mod.ConfirmationStep), { loading: StepLoader });
const MethodSelectStep = dynamic(() => import('./steps/MethodSelectStep'), { loading: StepLoader });
const BulkInputStep = dynamic(() => import('./steps/BulkInputStep'), { loading: StepLoader });

import { parseQRCode } from './utils';

// ============================================================
// MODES
// ============================================================

export type ClaimFlowMode = 'guided' | 'fast';

// ============================================================
// TYPES
// ============================================================

type DialogPrimaryAction = NonNullable<
  React.ComponentProps<typeof ReusableDialog>['primaryAction']
>;

type DialogSecondaryAction = NonNullable<
  React.ComponentProps<typeof ReusableDialog>['secondaryAction']
>;

export type FlowStep =
  | 'method-select'
  | 'manual-input'
  | 'qr-scan'
  | 'confirmation'
  | 'claiming'
  | 'success'
  | 'bulk-input'
  | 'bulk-confirmation'
  | 'bulk-claiming'
  | 'bulk-results'
  | 'cohort-import'
  | 'cohort-confirm'
  | 'assigning-cohort';

export interface ClaimedDeviceInfo {
  deviceId: string;
  deviceName: string;
  cohortId: string;
}

export interface ClaimDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (deviceInfo: ClaimedDeviceInfo & { isCohortImport?: boolean }) => void;
  initialStep?: FlowStep;
  mode?: ClaimFlowMode;
}

export interface BulkDevice {
  device_name: string;
  claim_token: string;
}

export interface VerifiedCohort {
  id: string;
  name: string;
}

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
      'Device ID can only contain letters, numbers, underscores, and hyphens',
    ),
  claim_token: z
    .string()
    .min(1, 'Claim token is required')
    .min(4, 'Claim token must be at least 4 characters'),
});

export type ClaimDeviceFormData = z.infer<typeof claimDeviceSchema>;

// ============================================================
// SHARED COMPONENTS
// ============================================================

export const ErrorAlert = ({ message }: { message: string }) => (
  <div className="flex items-center p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
    {message}
  </div>
);

const LoadingSpinner = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) => (
  <div className="flex flex-col items-center justify-center py-8 space-y-4">
    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
    <div className="text-center">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      {subtitle && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {subtitle}
        </p>
      )}
    </div>
  </div>
);

// ============================================================
// MAIN COMPONENT
// ============================================================

const ClaimDeviceModal: React.FC<ClaimDeviceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialStep = 'method-select',
  mode = 'fast',
}) => {
  const isGuidedMode = mode === 'guided';

  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: session } = useSession();
  const user = useAppSelector(state => state.user.userDetails);

  const { isPersonalContext, isExternalOrg, activeGroup, userScope } =
    useUserContext();

  const userId = (session?.user as { id?: string })?.id || user?._id;

  // ==========================================================
  // Cohorts
  // ==========================================================

  const { data: groupCohortIds } = useGroupCohorts(activeGroup?._id, {
    enabled: !isGuidedMode && !isPersonalContext && !!activeGroup?._id,
  });

  const defaultCohort = groupCohortIds?.[0] || null;

  // ==========================================================
  // Mutations
  // ==========================================================

  const {
    mutate: claimDevice,
    isPending,
    isSuccess,
    data: claimData,
    error: claimError,
  } = useClaimDevice();

  const {
    mutate: bulkClaimDevices,
    isPending: isBulkPending,
    isSuccess: isBulkSuccess,
    data: bulkClaimData,
    error: bulkClaimError,
  } = useBulkClaimDevices();

  const { mutateAsync: verifyCohort } = useVerifyCohort();
  const { mutate: assignCohortsToGroup } = useAssignCohortsToGroup();
  const { mutate: assignCohortsToUser } = useAssignCohortsToUser();

  // ==========================================================
  // State
  // ==========================================================

  const [step, setStep] = useState<FlowStep>(initialStep);
  const [error, setError] = useState<string | null>(null);
  const [bulkDevices, setBulkDevices] = useState<BulkDevice[]>([]);
  const [pendingSingleClaim, setPendingSingleClaim] = useState<{
    deviceId: string;
    claimToken: string;
  } | null>(null);
  const [cohortIdInput, setCohortIdInput] = useState('');

  // Tracks which step the user came from before confirmation,
  // so the Cancel/Back button returns to the right place.
  const [previousStep, setPreviousStep] = useState<FlowStep>('method-select');

  const [isImportingCohort, setIsImportingCohort] = useState(false);
  const [isCohortAssignmentSuccess, setIsCohortAssignmentSuccess] =
    useState(false);
  const [verifiedCohort, setVerifiedCohort] = useState<VerifiedCohort | null>(
    null,
  );

  // ==========================================================
  // Form
  // ==========================================================

  const formMethods = useForm<ClaimDeviceFormData>({
    resolver: zodResolver(claimDeviceSchema),
    defaultValues: {
      device_id: '',
      claim_token: '',
    },
  });

  // ==========================================================
  // Cache Helpers
  // ==========================================================

  const invalidatePersonalCaches = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['personalUserCohorts', userId] });
    queryClient.invalidateQueries({ queryKey: ['myDevices'] });
    queryClient.invalidateQueries({ queryKey: ['deviceCount', 'personal'] });
  }, [queryClient, userId]);

  const invalidateGroupCaches = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ['groupCohorts', activeGroup?._id],
    });
    queryClient.invalidateQueries({
      queryKey: ['deviceCount', activeGroup?._id],
    });
    queryClient.invalidateQueries({ queryKey: ['devices'] });
  }, [queryClient, activeGroup?._id]);

  // ==========================================================
  // Reset
  // ==========================================================

  const resetState = useCallback(() => {
    formMethods.reset();
    setStep('method-select');
    setError(null);
    setBulkDevices([]);
    setPendingSingleClaim(null);
    setCohortIdInput('');
    setPreviousStep('method-select');
    setIsImportingCohort(false);
    setIsCohortAssignmentSuccess(false);
    setVerifiedCohort(null);
  }, [formMethods]);

  // Always go through resetState so isCohortAssignmentSuccess etc. are cleared
  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  // ==========================================================
  // Effects
  // ==========================================================

  useEffect(() => {
    if (isOpen) {
      setStep(initialStep);
      setError(null);
      formMethods.reset();
    }
  }, [isOpen, initialStep, formMethods]);

  // Single claim: success
  useEffect(() => {
    if (!isSuccess || !claimData) return;

    if (isPersonalContext) {
      invalidatePersonalCaches();
    } else {
      invalidateGroupCaches();
    }

    setStep('success');

    if (onSuccess && claimData.device) {
      onSuccess({
        deviceId: claimData.device.name,
        deviceName: claimData.device.long_name || claimData.device.name,
        cohortId: '',
      });
    }
  }, [
    isSuccess,
    claimData,
    invalidatePersonalCaches,
    invalidateGroupCaches,
    isPersonalContext,
    onSuccess,
  ]);

  // Single claim: error
  useEffect(() => {
    if (claimError) {
      setError(
        claimError.message || 'Failed to add airqo device. Please try again.',
      );
      setStep('manual-input');
    }
  }, [claimError]);

  // Single claim: loading
  useEffect(() => {
    if (isPending && step !== 'claiming') {
      setStep('claiming');
    }
  }, [isPending, step]);

  // Bulk claim: success
  useEffect(() => {
    if (isBulkSuccess && bulkClaimData) {
      setStep('bulk-results');

      if (isPersonalContext) {
        invalidatePersonalCaches();
      } else {
        invalidateGroupCaches();
      }
    }
  }, [
    isBulkSuccess,
    bulkClaimData,
    invalidatePersonalCaches,
    invalidateGroupCaches,
    isPersonalContext,
  ]);

  // Bulk claim: error
  useEffect(() => {
    if (bulkClaimError) {
      setError(
        bulkClaimError.message || 'Failed to add airqo devices. Please try again.',
      );
      setStep('bulk-input');
    }
  }, [bulkClaimError]);

  // Bulk claim: loading
  useEffect(() => {
    if (isBulkPending && step !== 'bulk-claiming') {
      setStep('bulk-claiming');
    }
  }, [isBulkPending, step]);

  // ==========================================================
  // Single Claim Handlers
  // ==========================================================

  const handleClaimDevice = (deviceId: string, claimToken: string) => {
    if (!userId) {
      setError('User session not available. Please try again.');
      return;
    }

    // GUIDED MODE — claim only, no cohort assignment
    if (isGuidedMode) {
      setError(null);
      claimDevice({
        device_name: deviceId,
        user_id: userId,
        claim_token: claimToken,
      });
      return;
    }

    // FAST MODE — claim + optional auto-cohort assignment
    if (!isPersonalContext && !defaultCohort) {
      setError('No cohorts found. Please create a cohort first.');
      return;
    }

    setError(null);
    claimDevice({
      device_name: deviceId,
      user_id: userId,
      claim_token: claimToken,
      ...(defaultCohort && { cohort_id: defaultCohort }),
    });
  };

  const onManualSubmit = (data: ClaimDeviceFormData) => {
    setPendingSingleClaim({
      deviceId: data.device_id,
      claimToken: data.claim_token,
    });
    setPreviousStep('manual-input');
    setStep('confirmation');
  };

  const handleConfirmSingleClaim = () => {
    if (isPending || !pendingSingleClaim) return;
    handleClaimDevice(
      pendingSingleClaim.deviceId,
      pendingSingleClaim.claimToken,
    );
  };

  const handleQRScan = (result: string) => {
    const parsed = parseQRCode(result);

    if (!parsed) {
      setError('Invalid QR code format. Please try manual entry.');
      setStep('manual-input');
      return;
    }

    setPendingSingleClaim({
      deviceId: parsed.deviceId,
      claimToken: parsed.claimToken,
    });
    setPreviousStep('qr-scan');
    setStep('confirmation');
  };

  // ==========================================================
  // Bulk Handlers (FAST MODE ONLY)
  // ==========================================================

  /** Add a blank device row so the user can type into it. */
  const handleBulkAddDevice = () => {
    setBulkDevices(prev => [...prev, { device_name: '', claim_token: '' }]);
  };

  /** Remove the device row at the given index. */
  const handleBulkRemoveDevice = (index: number) => {
    setBulkDevices(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * Update a single field on a specific device row.
   * `field` is either 'device_name' or 'claim_token'.
   */
  const handleBulkDeviceChange = (
    index: number,
    field: keyof BulkDevice,
    value: string,
  ) => {
    setBulkDevices(prev =>
      prev.map((device, i) =>
        i === index ? { ...device, [field]: value } : device,
      ),
    );
  };

  /**
   * Replace the current device list with devices parsed from an
   * imported file (CSV, JSON, etc.). The BulkInputStep is responsible
   * for parsing; it hands us a ready-to-use BulkDevice array.
   */
  const handleBulkFileImport = (devices: BulkDevice[]) => {
    setError(null);
    setBulkDevices(devices);
  };

  /** Clear all device rows from the bulk list. */
  const handleBulkClear = () => {
    setBulkDevices([]);
    setError(null);
  };

  const handleBulkSubmit = () => {
    if (!userId) {
      setError('User session not available. Please try again.');
      return;
    }

    const valid = bulkDevices.filter(
      d => d.device_name.trim() && d.claim_token.trim(),
    );

    if (valid.length === 0) {
      setError('Please add at least one device with both name and token.');
      return;
    }

    setError(null);
    setStep('bulk-confirmation');
  };

  const handleConfirmBulkClaim = () => {
    if (!userId) return;

    const valid = bulkDevices.filter(
      d => d.device_name.trim() && d.claim_token.trim(),
    );

    bulkClaimDevices({
      user_id: userId,
      devices: valid,
      ...(defaultCohort && { cohort_id: defaultCohort }),
    });
  };

  // ==========================================================
  // Cohort Assignment (FAST MODE ONLY)
  // ==========================================================

  const handleVerifyCohort = async () => {
    const input = cohortIdInput.trim();

    if (!input) {
      setError('Please enter a valid Cohort ID');
      return;
    }

    setError(null);
    setIsImportingCohort(true);

    try {
      const result = await verifyCohort(input);

      if (!result.success) {
        setError(result.message || 'Invalid Cohort ID');
        return;
      }

      const cohortName =
        (result as { data?: { name?: string } }).data?.name ||
        result?.cohort?.name ||
        '';

      setVerifiedCohort({ id: input, name: cohortName || input });
      setStep('cohort-confirm');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to verify Cohort ID',
      );
    } finally {
      setIsImportingCohort(false);
    }
  };

  const handleConfirmCohortImport = () => {
    if (!verifiedCohort) {
      setError('Session expired. Please verify the cohort again.');
      return;
    }

    setStep('assigning-cohort');

    if (isExternalOrg && activeGroup?._id) {
      assignCohortsToGroup(
        { groupId: activeGroup._id, cohortIds: [verifiedCohort.id] },
        {
          onSuccess: () => {
            invalidateGroupCaches();
            if (onSuccess) {
              onSuccess({
                deviceId: '',
                deviceName: '',
                cohortId: verifiedCohort.id,
                isCohortImport: true,
              });
            }
            setTimeout(() => {
              setIsCohortAssignmentSuccess(true);
              setStep('success');
            }, 1500);
          },
          onError: err => {
            setError(getApiErrorMessage(err));
            setStep('cohort-import');
          },
        },
      );
      return;
    }

    if (isPersonalContext && userId) {
      assignCohortsToUser(
        { userId, cohortIds: [verifiedCohort.id] },
        {
          onSuccess: () => {
            invalidatePersonalCaches();
            if (onSuccess) {
              onSuccess({
                deviceId: '',
                deviceName: '',
                cohortId: verifiedCohort.id,
                isCohortImport: true,
              });
            }
            setTimeout(() => {
              setIsCohortAssignmentSuccess(true);
              setStep('success');
            }, 1500);
          },
          onError: err => {
            setError(getApiErrorMessage(err));
            setStep('cohort-import');
          },
        },
      );
    }
  };

  // ==========================================================
  // Dialog Config
  // ==========================================================

  const getDialogConfig = () => {
    const base = {
      title: 'Add AirQo Device',
      showFooter: false,
      showCloseButton: true,
      preventBackdropClose: false,
      primaryAction: undefined as DialogPrimaryAction | undefined,
      secondaryAction: undefined as DialogSecondaryAction | undefined,
    };

    const back = (to: FlowStep): DialogSecondaryAction => ({
      label: 'Back',
      onClick: () => setStep(to),
      variant: 'outline',
    });

    switch (step) {
      case 'method-select':
        return base;

      case 'qr-scan':
        return {
          ...base,
          title: 'Scan QR Code',
          showFooter: true,
          secondaryAction: back('method-select'),
        };

      case 'manual-input':
        return {
          ...base,
          showFooter: true,
          primaryAction: {
            label: isPending ? 'Adding...' : 'Add AirQo Device',
            onClick: formMethods.handleSubmit(onManualSubmit),
            disabled: isPending,
          },
          // Back goes to QR scan in fast mode, or method-select in guided mode.
          // If the user came from QR scan (previousStep), honour that; otherwise
          // fall back to method-select.
          secondaryAction: back(
            !isGuidedMode && previousStep === 'qr-scan'
              ? 'qr-scan'
              : 'method-select',
          ),
        };

      case 'confirmation':
        return {
          ...base,
          title: 'Confirm Device',
          showFooter: true,
          primaryAction: {
            label: isPending ? 'Claiming...' : 'Confirm & Continue',
            onClick: handleConfirmSingleClaim,
            disabled: isPending,
          },
          secondaryAction: {
            label: 'Cancel',
            onClick: () => setStep(previousStep),
            variant: 'outline' as const,
          },
        };

      case 'claiming':
        return {
          ...base,
          title: 'Claiming Device...',
          showCloseButton: false,
          preventBackdropClose: true,
        };

      case 'success':
        return {
          ...base,
          title: 'Success!',
          showFooter: true,
          primaryAction: {
            label: isGuidedMode ? 'Continue Setup' : 'See devices',
            onClick: () => {
              handleClose();
              if (!isGuidedMode) {
                router.push(
                  userScope === 'personal'
                    ? '/devices/my-devices'
                    : '/devices/overview',
                );
              }
            },
          },
        };

      // ======================================================
      // FAST MODE ONLY STEPS
      // ======================================================

      case 'cohort-import':
        return {
          ...base,
          title: 'Import Cohort',
          showFooter: true,
          primaryAction: {
            label: isImportingCohort ? 'Verifying...' : 'Import',
            onClick: handleVerifyCohort,
            disabled: isImportingCohort,
          },
          secondaryAction: back('method-select'),
        };

      case 'cohort-confirm':
        return {
          ...base,
          title: 'Confirm Cohort',
          showFooter: true,
          primaryAction: {
            label: 'Confirm & Import',
            onClick: handleConfirmCohortImport,
          },
          secondaryAction: {
            label: 'Cancel',
            onClick: () => setStep('cohort-import'),
            variant: 'outline' as const,
          },
        };

      case 'assigning-cohort':
        return {
          ...base,
          title: 'Assigning Cohort...',
          showCloseButton: false,
          preventBackdropClose: true,
        };

      case 'bulk-input':
        return {
          ...base,
          title: 'Add Multiple Devices',
          showFooter: true,
          primaryAction: {
            label: 'Review & Claim',
            onClick: handleBulkSubmit,
          },
          secondaryAction: back('method-select'),
        };

      case 'bulk-confirmation':
        return {
          ...base,
          title: 'Confirm Bulk Claim',
          showFooter: true,
          primaryAction: {
            label: isBulkPending ? 'Claiming...' : 'Confirm & Claim',
            onClick: handleConfirmBulkClaim,
            disabled: isBulkPending,
          },
          secondaryAction: {
            label: 'Cancel',
            onClick: () => setStep('bulk-input'),
            variant: 'outline' as const,
          },
        };

      case 'bulk-claiming':
        return {
          ...base,
          title: 'Claiming Devices...',
          showCloseButton: false,
          preventBackdropClose: true,
        };

      case 'bulk-results': {
        const hasSuccess =
          (bulkClaimData?.data?.successful_claims?.length ?? 0) > 0;

        return {
          ...base,
          title: 'Bulk Claim Results',
          showFooter: true,
          primaryAction: {
            label: hasSuccess ? 'Go to Devices' : 'Close',
            onClick: () => {
              handleClose();
              if (hasSuccess) {
                router.push(
                  userScope === 'personal'
                    ? '/devices/my-devices'
                    : '/devices/overview',
                );
              }
            },
          },
        };
      }

      default:
        return base;
    }
  };

  const dialogConfig = getDialogConfig();

  // ==========================================================
  // Render
  // ==========================================================

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
        {step === 'method-select' && (
          // Pass mode so MethodSelectStep can hide bulk/cohort options
          // in guided mode (only manual + QR should appear).
          <MethodSelectStep onSelect={setStep} mode={mode} />
        )}

        {step === 'qr-scan' && (
          <QRScanStep
            isOpen={isOpen}
            isPersonalContext={isPersonalContext}
            isExternalOrg={isExternalOrg}
            defaultCohort={defaultCohort}
            activeGroupTitle={activeGroup?.grp_title}
            onScan={handleQRScan}
            onManualEntry={() => {
              setPreviousStep('qr-scan');
              setStep('manual-input');
            }}
            onError={() => {
              setPreviousStep('qr-scan');
              setStep('manual-input');
              setError(
                'QR scanner encountered an issue. Please enter details manually.',
              );
            }}
          />
        )}

        {step === 'manual-input' && (
          <ManualInputStep
            formMethods={formMethods}
            isPersonalContext={isPersonalContext}
            isExternalOrg={isExternalOrg}
            defaultCohort={defaultCohort}
            activeGroupTitle={activeGroup?.grp_title}
            error={error}
          />
        )}

        {step === 'confirmation' && pendingSingleClaim && <ConfirmationStep />}

        {step === 'claiming' && (
          <LoadingSpinner
            title="Claiming Your Device"
            subtitle="Please wait while we set up your device..."
          />
        )}

        {step === 'success' &&
          (claimData?.device || isCohortAssignmentSuccess) && (
            <SuccessStep
              isCohortAssignmentSuccess={isCohortAssignmentSuccess}
              claimData={claimData}
            />
          )}
       
        <>
          {step === 'bulk-input' && (
            <BulkInputStep
              bulkDevices={bulkDevices}
              isPersonalContext={isPersonalContext}
              isExternalOrg={isExternalOrg}
              defaultCohort={defaultCohort}
              error={error}
              onAddDevice={handleBulkAddDevice}
              onRemoveDevice={handleBulkRemoveDevice}
              onDeviceChange={handleBulkDeviceChange}
              onFileImport={handleBulkFileImport}
              onClear={handleBulkClear}
            />
          )}

          {step === 'cohort-import' && (
            <CohortImportStep
              cohortIdInput={cohortIdInput}
              onChange={val => {
                setCohortIdInput(val);
                setError(null);
              }}
              error={error}
              isImporting={isImportingCohort}
            />
          )}

          {step === 'cohort-confirm' && verifiedCohort && (
            <CohortConfirmStep
              verifiedCohort={verifiedCohort}
              isExternalOrg={isExternalOrg}
            />
          )}

          {step === 'bulk-confirmation' && (
            <BulkConfirmationStep
              count={
                bulkDevices.filter(
                  d => d.device_name.trim() && d.claim_token.trim(),
                ).length
              }
            />
          )}

          {step === 'bulk-claiming' && (
            <LoadingSpinner
              title="Claiming Devices"
              subtitle="Please wait while we process your devices..."
            />
          )}

          {step === 'assigning-cohort' && (
            <LoadingSpinner
              title="Assigning Cohort"
              subtitle="Please wait while we configure cohort access..."
            />
          )}

          {step === 'bulk-results' && bulkClaimData?.data && (
            <BulkClaimResults results={bulkClaimData.data} />
          )}
        </>
       
      </div>
    </ReusableDialog>
  );
};

export default ClaimDeviceModal;