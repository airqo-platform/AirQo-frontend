import React, { useState } from 'react';
import ReusableDialog from '@/components/shared/dialog/ReusableDialog';
import { useVerifyCohort } from '@/core/hooks/useCohorts';
import ReusableInputField from '@/components/shared/inputfield/ReusableInputField';
import { Loader2, Plus, Database, CheckCircle2 } from 'lucide-react';

type SetupView = 'CHOICE' | 'LINK' | 'CONFIRM_LINK';

interface OrganizationSetupDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirmCreate: () => void;
    onConfirmLink: (cohortId: string) => void;
    isProcessing: boolean;
}

export const OrganizationSetupDialog: React.FC<OrganizationSetupDialogProps> = ({
    open,
    onOpenChange,
    onConfirmCreate,
    onConfirmLink,
    isProcessing,
}) => {
    const [view, setView] = useState<SetupView>('CHOICE');
    const [cohortId, setCohortId] = useState('');
    const [verifiedCohortId, setVerifiedCohortId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const { mutateAsync: verifyCohort, isPending: isVerifying } = useVerifyCohort();

    const handleClose = () => {
        onOpenChange(false);
        setTimeout(() => {
            setView('CHOICE');
            setCohortId('');
            setVerifiedCohortId(null);
            setError(null);
        }, 300);
    };

    const handleVerify = async () => {
        setError(null);
        if (!cohortId.trim()) {
            setError('Please enter a valid Cohort ID');
            return;
        }

        try {
            const result = await verifyCohort(cohortId.trim());
            if (result?.success) {
                setVerifiedCohortId(cohortId.trim());
                setView('CONFIRM_LINK');
            } else {
                setError('Cohort not found. Please check the ID and try again.');
            }
        } catch {
            setError('Failed to verify cohort. User might not have access or ID is invalid.');
        }
    };

    const renderChoiceView = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
                {/* Card A: Create New Cohort */}
                <button
                    onClick={onConfirmCreate}
                    disabled={isProcessing}
                    className="flex items-center p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left w-full group"
                >
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-full group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors mr-4 shrink-0">
                        <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-base text-gray-900 dark:text-white">Create New Cohort</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            Create a default cohort for your organization.
                        </p>
                    </div>
                </button>

                {/* Card B: Link Existing Cohort */}
                <button
                    onClick={() => setView('LINK')}
                    className="flex items-center p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-violet-500 dark:hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors text-left w-full group"
                >
                    <div className="p-2 bg-violet-100 dark:bg-violet-900/40 rounded-full group-hover:bg-violet-200 dark:group-hover:bg-violet-800 transition-colors mr-4 shrink-0">
                        <Database className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-base text-gray-900 dark:text-white">I have a Cohort ID</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            Link an existing cohort using its unique ID.
                        </p>
                    </div>
                </button>
            </div>
        </div>
    );

    const renderLinkView = () => (
        <div className="space-y-6">
            <div className="space-y-4">
                <ReusableInputField
                    label="Cohort ID"
                    value={cohortId}
                    onChange={(e) => {
                        setCohortId(e.target.value);
                        setError(null);
                    }}
                    error={error || undefined}
                    disabled={isVerifying}
                />
                {isVerifying && (
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                        <span className="ml-2 text-sm text-gray-500">Verifying Cohort ID...</span>
                    </div>
                )}
            </div>
        </div>
    );

    const renderConfirmLinkView = () => (
        <div className="flex flex-col items-center justify-center py-6 px-4 space-y-4 text-center">
            <div className="p-3 bg-violet-100 dark:bg-violet-900/40 rounded-full">
                <CheckCircle2 className="w-8 h-8 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Confirm Cohort Link
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 max-w-sm mx-auto">
                    You are about to link Cohort ID <strong>{verifiedCohortId}</strong> to your organization.
                </p>
            </div>
        </div>
    );

    const getDialogContent = () => {
        const baseConfig = {
            title: 'Organization Setup',
            subtitle: undefined as string | undefined,
            showFooter: false,
            showCloseButton: true,
            preventBackdropClose: false,
            primaryAction: undefined,
            secondaryAction: undefined,
        };

        switch (view) {
            case 'CHOICE':
                return {
                    ...baseConfig,
                    subtitle: 'How would you like to set up your organization?',
                    content: renderChoiceView(),
                    secondaryAction: { label: 'Cancel', onClick: handleClose, variant: 'outline' as const }
                };
            case 'LINK':
                return {
                    ...baseConfig,
                    title: 'Link Existing Cohort',
                    showFooter: true,
                    content: renderLinkView(),
                    primaryAction: {
                        label: isVerifying ? 'Verifying...' : 'Verify ID',
                        onClick: handleVerify,
                        disabled: !cohortId.trim() || isVerifying
                    },
                    secondaryAction: {
                        label: 'Back',
                        onClick: () => {
                            setError(null);
                            setView('CHOICE');
                        },
                        variant: 'outline' as const
                    }
                };
            case 'CONFIRM_LINK':
                return {
                    ...baseConfig,
                    title: 'Confirm Link',
                    showFooter: true,
                    content: renderConfirmLinkView(),
                    primaryAction: {
                        label: isProcessing ? 'Linking...' : 'Confirm & Link',
                        onClick: () => verifiedCohortId && onConfirmLink(verifiedCohortId),
                        disabled: isProcessing
                    },
                    secondaryAction: {
                        label: 'Back',
                        onClick: () => setView('LINK'),
                        variant: 'outline' as const
                    }
                };
            default:
                return { ...baseConfig, content: null };
        }
    };

    const params = getDialogContent();

    return (
        <ReusableDialog
            isOpen={open}
            onClose={handleClose}
            title={params.title}
            subtitle={params.subtitle}
            primaryAction={params.primaryAction}
            secondaryAction={params.secondaryAction}
            showFooter={params.showFooter}
            size="md"
        >
            {params.content}
        </ReusableDialog>
    );
};
