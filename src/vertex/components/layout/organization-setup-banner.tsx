'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useUserContext } from '@/core/hooks/useUserContext';
import { useGroupCohorts, useCreateCohort, useAssignCohortsToGroup } from '@/core/hooks/useCohorts';
import ReusableButton from '@/components/shared/button/ReusableButton';
import { OrganizationSetupDialog } from '@/components/features/cohorts/organization-setup-dialog';
import { useQueryClient } from '@tanstack/react-query';
import { DEFAULT_COHORT_TAGS } from '@/core/constants/devices';

const BANNER_DISMISS_KEY = 'org-setup-banner-dismissed';

export const OrganizationSetupBanner: React.FC = () => {
    const queryClient = useQueryClient();
    const { isExternalOrg, activeGroup } = useUserContext();
    const [isDismissed, setIsDismissed] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const { data: cohorts, isLoading: isLoadingCohorts } = useGroupCohorts(
        activeGroup?._id,
        { enabled: isExternalOrg && !!activeGroup?._id }
    );
    const { mutate: assignToGroup } = useAssignCohortsToGroup();
    const { mutate: createCohort } = useCreateCohort();

    useEffect(() => {
        if (activeGroup?._id) {
            const dismissed = localStorage.getItem(`${BANNER_DISMISS_KEY}-${activeGroup._id}`);
            setIsDismissed(dismissed === 'true');
        }
    }, [activeGroup?._id]);

    const handleDismiss = () => {
        if (activeGroup?._id) {
            localStorage.setItem(`${BANNER_DISMISS_KEY}-${activeGroup._id}`, 'true');
            setIsDismissed(true);
        }
    };

    const handleCreateDefault = () => {
        if (!activeGroup?._id || !activeGroup?.grp_title) return;

        setIsProcessing(true);
        const cohortName = `${activeGroup.grp_title} Cohort`;

        createCohort(
            {
                name: cohortName,
                network: 'airqo',
                cohort_tags: [
                    DEFAULT_COHORT_TAGS.find((tag) => tag.value === 'organizational')
                        ?.value || 'organizational',
                ],
            },
            {
                onSuccess: (data) => {
                    handleLinkCohort(data.cohort._id);
                },
                onError: () => {
                    setIsProcessing(false);
                },
            }
        );
    };

    const handleLinkCohort = (cohortId: string) => {
        if (!activeGroup?._id) return;

        setIsProcessing(true);
        assignToGroup({
            groupId: activeGroup._id,
            cohortIds: [cohortId]
        }, {
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: ['groupCohorts', activeGroup._id],
                });
                setIsProcessing(false);
                setIsDialogOpen(false);
                handleDismiss();
            },
            onError: () => {
                setIsProcessing(false);
            },
        });
    };

    if (!isExternalOrg || isLoadingCohorts || (cohorts && cohorts.length > 0) || isDismissed) {
        return null;
    }

    return (
        <>
            <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center justify-between gap-4">
                        {/* Left: Icon + Message */}
                        <div className="flex items-center gap-3 flex-1">
                            <div className="flex-shrink-0">
                                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    Complete Organization Setup
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                    Your organization needs at least one cohort to manage devices. Click &quot;Complete Setup&quot; to create a default cohort.
                                </p>
                            </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <ReusableButton
                                onClick={() => setIsDialogOpen(true)}
                                variant="filled"
                                className="text-sm h-9 px-4"
                                Icon={CheckCircle}
                            >
                                Complete Setup
                            </ReusableButton>
                        </div>
                    </div>
                </div>
            </div>

            <OrganizationSetupDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onConfirmCreate={handleCreateDefault}
                onConfirmLink={handleLinkCohort}
                isProcessing={isProcessing}
            />
        </>
    );
};
