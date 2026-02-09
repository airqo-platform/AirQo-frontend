import { Card } from "@/components/ui/card";
import React from "react";
import { useDeviceActivities } from "@/core/hooks/useDevices";
import DeviceActivityItem from "@/components/features/devices/device-activity-item";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DeviceHistoryCardProps {
    deviceName: string;
}

const DeviceHistoryCard: React.FC<DeviceHistoryCardProps> = ({
    deviceName,
}) => {
    const {
        data: activitiesResponse,
        isLoading,
        error,
    } = useDeviceActivities(deviceName);

    return (
        <Card className="w-full rounded-lg">
            <div className="flex items-center justify-between px-3 py-2 border-b">
                <h2 className="text-lg font-semibold">Device Activity</h2>
            </div>

            <div className="px-3 py-0">
                {isLoading ? (
                    <div className="text-sm text-muted-foreground p-3">Loading history...</div>
                ) : error ? (
                    <div className="text-sm text-red-500 p-3">Failed to load history.</div>
                ) : (activitiesResponse?.site_activities?.length || 0) === 0 ? (
                    <div className="text-sm text-muted-foreground p-3">No recent activity.</div>
                ) : (
                    <ScrollArea className="h-[300px] pr-4">
                        <div className="space-y-0 pt-3">
                            {activitiesResponse!.site_activities.map((activity, index) => (
                                <DeviceActivityItem
                                    key={activity._id}
                                    activity={activity}
                                    isLast={index === activitiesResponse!.site_activities.length - 1}
                                />
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </div>
        </Card>
    );
};

export default DeviceHistoryCard;
