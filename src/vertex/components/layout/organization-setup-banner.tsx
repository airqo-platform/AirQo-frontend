'use client';

import React, { useState } from 'react';
import { useUserContext } from '@/core/hooks/useUserContext';
import { useGroupCohorts, useCreateCohort, useAssignCohortsToGroup } from '@/core/hooks/useCohorts';
import { OrganizationSetupDialog } from '@/components/features/cohorts/organization-setup-dialog';
import { useQueryClient } from '@tanstack/react-query';
import { DEFAULT_COHORT_TAGS } from '@/core/constants/devices';


export const OrganizationSetupBanner: React.FC = () => {
    const queryClient = useQueryClient();
    const { isExternalOrg, activeGroup } = useUserContext();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    const { data: cohorts, isLoading: isLoadingCohorts } = useGroupCohorts(
        activeGroup?._id,
        { enabled: isExternalOrg && !!activeGroup?._id }
    );
    const { mutate: assignToGroup } = useAssignCohortsToGroup();
    const { mutate: createCohort } = useCreateCohort();

    // No longer allowing dismissal without completion

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
                setIsCompleted(true);
            },
            onError: () => {
                setIsProcessing(false);
            },
        });
    };

    if (!isExternalOrg || isLoadingCohorts || (cohorts && cohorts.length > 0) || isCompleted) {
        return null;
    }

    return (
        <OrganizationSetupDialog
            open={true}
            onOpenChange={() => {}}
            onConfirmCreate={handleCreateDefault}
            onConfirmLink={handleLinkCohort}
            isProcessing={isProcessing}
            preventDismiss={true}
        />
    );
};
