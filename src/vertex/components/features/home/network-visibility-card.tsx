import React, { useState } from 'react';
import { Globe, Lock, AlertTriangle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useCohorts, useGroupCohorts } from '@/core/hooks/useCohorts';
import { cohorts as cohortsApi } from '@/core/apis/cohorts';
import ReusableDialog from '@/components/shared/dialog/ReusableDialog';
import ReusableButton from '@/components/shared/button/ReusableButton';
import { PERMISSIONS } from '@/core/permissions/constants';
import ReusableToast from '@/components/shared/toast/ReusableToast';
import { useQueryClient } from '@tanstack/react-query';
import { usePermissions } from '@/core/hooks/usePermissions';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/core/hooks/useUserContext';

const NetworkVisibilityCard = () => {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [targetVisibility, setTargetVisibility] = useState<boolean>(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const { activeGroup, isExternalOrg } = useUserContext();

    // 1. Fetch group cohort IDs to ensure we only target this org's cohorts
    const { data: groupCohortIds, isLoading: isLoadingGroupCohorts } = useGroupCohorts(
        activeGroup?._id,
        { enabled: isExternalOrg && !!activeGroup?._id }
    );

    const hasIdsToFetch = groupCohortIds && groupCohortIds.length > 0;

    // 2. Fetch details for these specific cohorts
    const { cohorts, isLoading: isLoadingCohorts } = useCohorts(
        {
            limit: 1000,
            cohort_id: hasIdsToFetch ? groupCohortIds : undefined
        },
        { enabled: !!hasIdsToFetch }
    );

    const isLoading = (isExternalOrg && isLoadingGroupCohorts) || isLoadingCohorts;

    const hasDeviceUpdatePermission = usePermissions([PERMISSIONS.DEVICE.UPDATE])[
        PERMISSIONS.DEVICE.UPDATE
    ];

    if (!hasDeviceUpdatePermission) {
        return null;
    }

    // Safely handle empty state (if loading finishes but no cohorts found)
    if (!isLoading && (!cohorts || cohorts.length === 0)) {
        return null; // Don't show card if no cohorts to manage
    }

    // Determine current implied global state.
    // Default to: if all are public -> ON (Public). Else -> OFF (Private).
    const allPublic = cohorts.length > 0 && cohorts.every((c) => c.visibility === true);

    // Local state for the switch
    const isChecked = allPublic;

    const handleToggle = (checked: boolean) => {
        setTargetVisibility(checked);
        setIsDialogOpen(true);
    };

    const handleRunningUpdate = async () => {
        setIsUpdating(true);
        try {
            const cohortsToUpdate = cohorts.filter(c => c.visibility !== targetVisibility);

            if (cohortsToUpdate.length === 0) {
                ReusableToast({
                    message: `All cohorts are already ${targetVisibility ? 'Public' : 'Private'}`,
                    type: 'INFO',
                });
                setIsDialogOpen(false);
                setIsUpdating(false);
                return;
            }

            await Promise.all(
                cohortsToUpdate.map((cohort) =>
                    cohortsApi.updateCohortDetailsApi(cohort._id, { visibility: targetVisibility })
                )
            );

            ReusableToast({
                message: `Successfully set ${cohortsToUpdate.length} cohorts to ${targetVisibility ? 'Public' : 'Private'}`,
                type: 'SUCCESS',
            });

            queryClient.invalidateQueries({ queryKey: ['cohorts'] });

        } catch (error) {
            console.error(error);
            ReusableToast({
                message: 'Failed to update network visibility',
                type: 'ERROR',
            });
        } finally {
            setIsUpdating(false);
            setIsDialogOpen(false);
        }
    };

    if (isLoading) {
        return null;
    }

    // UI States
    const isPrivate = !isChecked; // State A

    // State A: Private
    // Icon: Lock (Gray/Dark Blue), Headline: "Your network is Private", Description: "Your sensors are hidden..."

    // State B: Public
    // Icon: Globe (Green/Blue), Headline: "Your network is Public", Description: "Your sensors are visible..."

    return (
        <>
            <div className="pt-2">
                <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                    <div className="flex gap-4">
                        <div className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                            isPrivate ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                        )}>
                            {isPrivate ? <Lock className="w-6 h-6" /> : <Globe className="w-6 h-6" />}
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                {isPrivate ? "Your network is Private" : "Your network is Public"}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xl">
                                {isPrivate
                                    ? "Your sensors are hidden from the public. Data is visible only in your account."
                                    : "Your sensors are visible to anyone on the AirQo Map. You are contributing to open data."
                                }
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <span className={cn(
                            "text-sm font-medium",
                            isPrivate ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"
                        )}>
                            Private
                        </span>
                        <Switch
                            checked={isChecked}
                            onCheckedChange={handleToggle}
                            className="data-[state=checked]:bg-green-500"
                        />
                        <span className={cn(
                            "text-sm font-medium",
                            !isPrivate ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"
                        )}>
                            Public
                        </span>
                    </div>
                </div>
                <div className="border-t mt-6 flex justify-start -mx-6 px-6 pt-1">
                    <ReusableButton
                        variant="text"
                        className="text-muted-foreground hover:text-primary"
                        onClick={() => router.push('/cohorts')}
                    >
                        View Cohorts
                    </ReusableButton>
                </div>
            </div>

            <ReusableDialog
                isOpen={isDialogOpen}
                onClose={() => !isUpdating && setIsDialogOpen(false)}
                title={targetVisibility ? "Make all devices public?" : "Make all devices private?"}
                size="md"
                customFooter={
                    <div className="flex items-center justify-end gap-3 w-full px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                        <ReusableButton
                            variant="outlined"
                            onClick={() => setIsDialogOpen(false)}
                            disabled={isUpdating}
                        >
                            Cancel
                        </ReusableButton>
                        <ReusableButton
                            onClick={handleRunningUpdate}
                            disabled={isUpdating}
                            variant="filled"
                            className={targetVisibility ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                        >
                            {isUpdating ? "Updating..." : (targetVisibility ? "Confirm & Publish" : "Confirm & Make Private")}
                        </ReusableButton>
                    </div>
                }
            >
                <div className="space-y-4 py-2">
                    <p className="text-gray-600 dark:text-gray-300">
                        {targetVisibility
                            ? "You are about to make your entire network visible on the public AirQo Map. This means anyone can see your air quality readings."
                            : "You are about to make your entire network private. Your data will only be visible to your organization and will not appear on the public map."
                        }
                    </p>

                    {targetVisibility && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md border border-yellow-100 dark:border-yellow-800 flex gap-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
                            <div className="text-sm text-yellow-800 dark:text-yellow-200">
                                <span className="font-semibold">GPS Note:</span> Ensure your devices have correct locations before proceeding.
                            </div>
                        </div>
                    )}
                </div>
            </ReusableDialog>
        </>
    );
};

export default NetworkVisibilityCard;
