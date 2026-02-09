import { Card } from "@/components/ui/card";
import React from "react";
import { format, parseISO } from 'date-fns';
import { useDeviceActivities } from "@/core/hooks/useDevices";
import ReusableButton from "@/components/shared/button/ReusableButton";

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
                    <ul className="space-y-4">
                        {activitiesResponse!.site_activities.slice(0, 3).map((activity) => (
                            <li key={activity._id} className="flex gap-3">
                                <div className="flex flex-col items-center mt-1">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    <div className="w-0.5 h-full bg-gray-100 mt-1 min-h-[20px]" />
                                </div>
                                <div className="flex-1 min-w-0 pb-1">
                                    <div className="text-sm font-medium break-words">
                                        {activity.description}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-0.5">
                                        {format(parseISO(activity.date), "MMM d, yyyy h:mm a")}
                                    </div>
                                    {activity.activity_by && (
                                        <div className="text-xs text-muted-foreground mt-0.5">
                                            By {activity.activity_by.name || activity.activity_by.email}
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
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
