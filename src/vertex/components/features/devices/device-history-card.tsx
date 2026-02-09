import { Card } from "@/components/ui/card";
import React from "react";
import { format, parseISO } from 'date-fns';
import { useDeviceActivities } from "@/core/hooks/useDevices";
import ReusableButton from "@/components/shared/button/ReusableButton";
import DeviceActivityItem from "@/components/features/devices/device-activity-item";

interface DeviceHistoryCardProps {
    deviceName: string;
    onViewAllLogs?: () => void;
}

const DeviceHistoryCard: React.FC<DeviceHistoryCardProps> = ({
    deviceName,
    onViewAllLogs,
}) => {
    const {
        data: activitiesResponse,
        isLoading,
        error,
    } = useDeviceActivities(deviceName);

    return (
        <Card className="w-full rounded-lg">
            <div className="flex items-center justify-between px-3 py-2">
                <h2 className="text-lg font-semibold">Device Activity</h2>
            </div>

            <div className="px-3 pb-3">
                {isLoading ? (
                    <div className="text-sm text-muted-foreground">Loading history...</div>
                ) : error ? (
                    <div className="text-sm text-red-500">Failed to load history.</div>
                ) : (activitiesResponse?.site_activities?.length || 0) === 0 ? (
                    <div className="text-sm text-muted-foreground">No recent activity.</div>
                ) : (
                    <div className="space-y-0">
                        {activitiesResponse!.site_activities.slice(0, 3).map((activity, index) => (
                            <DeviceActivityItem
                                key={activity._id}
                                activity={activity}
                                isLast={index === 2 || index === activitiesResponse!.site_activities.length - 1}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="border-t px-2 flex justify-end">
                <ReusableButton
                    variant="text"
                    onClick={onViewAllLogs}
                    disabled={!onViewAllLogs}
                    className="p-1 text-xs m-1"
                >
                    View all logs
                </ReusableButton>
            </div>
        </Card>
    );
};

export default DeviceHistoryCard;
