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
import { FolderIcon, Activity } from "lucide-react"; // Fallback icons

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
                        <div className="space-y-8 pl-2">
                            {activitiesResponse!.site_activities.map((activity, index) => {
                                const isLast = index === activitiesResponse!.site_activities.length - 1;

                                return (
                                    <div key={activity._id} className="relative pl-8 pb-1">
                                        {/* Vertical Line */}
                                        {!isLast && (
                                            <div
                                                className="absolute left-[11px] top-8 bottom-[-32px] w-[1px] bg-gray-200"
                                                aria-hidden="true"
                                            />
                                        )}

                                        {/* Icon Container */}
                                        <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center">
                                            {/* Placeholder Icon - could be dynamic based on activity type */}
                                            <Activity className="w-3 h-3 text-gray-500" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1 space-y-1">
                                                <div className="text-xs text-gray-500">
                                                    {formatDistanceToNow(parseISO(activity.date), {
                                                        addSuffix: true,
                                                    })}
                                                </div>
                                                <h4 className="text-sm font-medium text-gray-900">
                                                    {activity.description}
                                                </h4>
                                                {activity.activity_by && (
                                                    <div className="text-sm text-gray-500">
                                                        By {activity.activity_by.name || activity.activity_by.email}
                                                    </div>
                                                )}

                                                {/* 
                           If there are extra details like tags or ID changes, 
                           we can render them here similar to the 'Ready key' or 'Site type' links 
                           in the reference image.
                        */}
                                                {/* Example fallback for extra fields */}
                                                {activity.deployment_type && (
                                                    <div className="text-sm text-blue-600 mt-1">
                                                        Deployment Type: {activity.deployment_type}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Status Indicator (Green Dot) */}
                                            <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
};

export default DeviceHistoryDrawer;
