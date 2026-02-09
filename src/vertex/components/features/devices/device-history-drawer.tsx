import React from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { formatDistanceToNow, parseISO } from "date-fns";
import { useDeviceActivities } from "@/core/hooks/useDevices";
import { ScrollArea } from "@/components/ui/scroll-area";
import DeviceActivityItem from "@/components/features/devices/device-activity-item";

interface DeviceHistoryDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    deviceName: string;
}

const DeviceHistoryDrawer: React.FC<DeviceHistoryDrawerProps> = ({
    isOpen,
    onClose,
    deviceName,
}) => {
    const {
        data: activitiesResponse,
        isLoading,
        error,
    } = useDeviceActivities(deviceName);

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col h-full bg-white">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-xl font-medium text-gray-900">
                        Device Activity
                    </SheetTitle>
                </SheetHeader>

                <ScrollArea className="flex-1 pr-4 -mr-4">
                    {isLoading ? (
                        <div className="flex justify-center py-8 text-muted-foreground">
                            Loading activities...
                        </div>
                    ) : error ? (
                        <div className="flex justify-center py-8 text-red-500">
                            Failed to load activity history.
                        </div>
                    ) : (activitiesResponse?.site_activities?.length || 0) === 0 ? (
                        <div className="flex justify-center py-8 text-muted-foreground">
                            No activity history found.
                        </div>
                    ) : (
                        <div className="space-y-6 pl-2 pt-2">
                            {activitiesResponse!.site_activities.map((activity, index) => (
                                <DeviceActivityItem
                                    key={activity._id}
                                    activity={activity}
                                    isLast={index === activitiesResponse!.site_activities.length - 1}
                                />
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
};

export default DeviceHistoryDrawer;
