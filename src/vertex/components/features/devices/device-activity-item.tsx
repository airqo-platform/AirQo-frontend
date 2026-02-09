import React from "react";
import { format, parseISO } from "date-fns";
import { AqMonitor } from "@airqo/icons-react";
import { DeviceActivity } from "@/core/apis/devices";

interface DeviceActivityItemProps {
    activity: DeviceActivity;
    isLast: boolean;
    showDeviceName?: boolean;
}

const DeviceActivityItem: React.FC<DeviceActivityItemProps> = ({
    activity,
    isLast,
    showDeviceName = false,
}) => {
    return (
        <div className="relative pl-14 pb-2">
            {/* Vertical Line */}
            {!isLast && (
                <div
                    className="absolute left-[19px] top-10 bottom-[-16px] w-[1px] bg-gray-100"
                    aria-hidden="true"
                />
            )}

            {/* Icon Container */}
            <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center z-10">
                <AqMonitor className="w-5 h-5 text-gray-500" />
            </div>

            {/* Content */}
            <div className="flex justify-between items-start gap-4 pt-1">
                <div className="flex-1 space-y-1">
                    <div className="text-xs text-gray-500">
                        <span>{format(parseISO(activity.date), "MMM d, yyyy h:mm a")}</span>
                    </div>
                    <h4 className="text-base font-medium text-gray-900 leading-none">
                        {activity.description.charAt(0).toUpperCase() + activity.description.slice(1)}
                    </h4>
                    {activity.activity_by && (
                        <div className="text-sm text-gray-500">
                            By {activity.activity_by.name || activity.activity_by.email}
                        </div>
                    )}

                    {/* Extra details (Placeholders for now, based on image "Added a file" etc) */}
                    {activity.deployment_type && activity.activityType === "deployment" && (
                        <div className="text-sm text-blue-600 mt-1">
                            Deployment Type: {activity.deployment_type}
                        </div>
                    )}
                    {showDeviceName && activity.device && (
                        <div className="text-sm text-blue-600 mt-1">
                            Device: {activity.device}
                        </div>
                    )}
                    {/* If we had file attachments in the activity object, we would render them here */}
                </div>
            </div>
        </div>
    );
};

export default DeviceActivityItem;
