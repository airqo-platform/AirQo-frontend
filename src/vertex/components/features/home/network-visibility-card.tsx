import React, { useState } from 'react';
import { Globe, Lock, Shield } from 'lucide-react';
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
import { Cohort } from '@/app/types/cohorts';

const NetworkVisibilityCard = () => {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [targetVisibility, setTargetVisibility] = useState<boolean>(false);
    const [pendingCohort, setPendingCohort] = useState<Cohort | null>(null);
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

    const allPublic = cohorts.length > 0 && cohorts.every((c) => c.visibility === true);
    const allPrivate = cohorts.length > 0 && cohorts.every((c) => c.visibility === false);

    const handleRunningUpdate = async () => {
        if (!pendingCohort) return;
        
        setIsUpdating(true);
        try {
            await cohortsApi.updateCohortDetailsApi(pendingCohort._id, { visibility: targetVisibility });

            ReusableToast({
                message: `Successfully set ${pendingCohort.name} to ${targetVisibility ? 'Public' : 'Private'}`,
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
            setPendingCohort(null);
        }
    };

    if (isLoading) {
        return null;
    }

    return (
        <>
            <div className="pt-2">
                <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                    <div className="flex gap-4">
                        <div className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300",
                            allPublic ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : 
                            allPrivate ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" :
                            "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                        )}>
                            {allPublic ? <Globe className="w-6 h-6" /> : 
                             allPrivate ? <Lock className="w-6 h-6" /> : 
                             <Shield className="w-6 h-6" />}
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 transition-all">
                                {allPublic ? "Your devices are Public" : 
                                 allPrivate ? "Your devices are Private" : 
                                 "Custom Visibility Settings"}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xl">
                                {allPublic ? "Your devices are visible to anyone on the AirQo Map. You are contributing to open data." :
                                 allPrivate ? "Your devices are hidden from the public. Data is visible only in your account." :
                                 "Visibility settings are customized per cohort. Manage each cohort below."}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 space-y-3">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-3 px-1">Manage Cohorts Visibility</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {cohorts.map((cohort) => (
                            <div key={cohort._id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20 hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200 group">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full transition-all duration-300",
                                        cohort.visibility ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-gray-300"
                                    )} />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{cohort.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={cn(
                                        "text-[10px] font-bold uppercase tracking-wider transition-colors",
                                        cohort.visibility ? "text-green-600 dark:text-green-400" : "text-gray-400"
                                    )}>
                                        {cohort.visibility ? 'Public' : 'Private'}
                                    </span>
                                    <Switch
                                        checked={cohort.visibility}
                                        onCheckedChange={(checked) => {
                                            setPendingCohort(cohort);
                                            setTargetVisibility(checked);
                                            setIsDialogOpen(true);
                                        }}
                                        className="data-[state=checked]:bg-green-500"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border-t border-t-gray-100 dark:border-t-gray-800 mt-8 flex justify-start -mx-6 px-6 pt-2">
                    <ReusableButton
                        variant="text"
                        onClick={() => router.push('/cohorts')}
                        className="text-primary hover:bg-primary/5"
                    >
                        View All Cohorts Details
                    </ReusableButton>
                </div>
            </div>

            <ReusableDialog
                isOpen={isDialogOpen}
                onClose={() => !isUpdating && setIsDialogOpen(false)}
                title={targetVisibility ? `Make "${pendingCohort?.name}" public?` : `Make "${pendingCohort?.name}" private?`}
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
                            ? `You are about to make the devices in "${pendingCohort?.name}" visible on the public AirQo Map. This means anyone can see the air quality readings for these devices.`
                            : `You are about to make "${pendingCohort?.name}" private. Data from these devices will only be visible to your organization and will not appear on the public map.`
                        }
                    </p>
                </div>
            </ReusableDialog>
        </>
    );
};

export default NetworkVisibilityCard;


