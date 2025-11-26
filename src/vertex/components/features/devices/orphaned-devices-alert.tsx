import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import ReusableButton from '@/components/shared/button/ReusableButton';
import { useAssignDevicesToCohort } from '@/core/hooks/useCohorts';
import { useQueryClient } from '@tanstack/react-query';
import ReusableToast from '@/components/shared/toast/ReusableToast';
import { useAppSelector } from '@/core/redux/hooks';
import { useOrphanedDevices } from '@/core/hooks/useDevices';

interface OrphanedDevicesAlertProps {
    userId: string;
}

export const OrphanedDevicesAlert: React.FC<OrphanedDevicesAlertProps> = ({ userId }) => {
    const { data, isLoading } = useOrphanedDevices(userId);
    const { userDetails } = useAppSelector((state) => state.user);
    const { mutate: assignDevices, isPending: isAssigning } = useAssignDevicesToCohort();
    const queryClient = useQueryClient();

    if (isLoading || !data || !data.devices || data.devices.length === 0) {
        return null;
    }

    const handleAssign = () => {
        const cohortId = userDetails?.cohort_ids?.[0];

        if (!cohortId) {
            ReusableToast({
                message: "An issue occurred while setting up your device. Contact support.",
                type: "ERROR"
            });
            return;
        }

        const deviceIds = data.devices.map(d => d.name);

        assignDevices(
            { cohortId, deviceIds },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['orphanedDevices'] });
                    queryClient.invalidateQueries({ queryKey: ['myDevices'] });
                }
            }
        );
    };

    return (
        <Alert className="mb-6 bg-yellow-50 border-yellow-200 text-yellow-900">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-900 font-semibold mb-2 ml-2">
                Complete Device Setup
            </AlertTitle>
            <AlertDescription className="text-yellow-800 ml-2 flex flex-col justify-between">
                <p className="mb-2">
                    We found {data.devices.length} device{data.devices.length > 1 ? 's' : ''} linked to your account that require a final setup step to appear in your dashboard.
                </p>
                <ReusableButton
                    variant="outlined"
                    onClick={handleAssign}
                    loading={isAssigning}
                    disabled={isAssigning}
                >
                    Complete Setup
                </ReusableButton>
            </AlertDescription>
        </Alert>
    );
};
