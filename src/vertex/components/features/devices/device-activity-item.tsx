import React, { useState } from "react";
import { format, parseISO, isValid } from "date-fns";
import { AqCopy01, AqChevronDown, AqChevronUp, AqMonitor } from "@airqo/icons-react";
import { DeviceActivity } from "@/core/apis/devices";
import ReusableToast from "@/components/shared/toast/ReusableToast";
import ReusableButton from "@/components/shared/button/ReusableButton";

interface DeviceActivityItemProps {
    activity: DeviceActivity;
    isLast: boolean;
    showDeviceName?: boolean;
    previousSiteId?: string;
    previousSiteName?: string;
}

const DeviceActivityItem: React.FC<DeviceActivityItemProps> = ({
    activity,
    isLast,
    showDeviceName = false,
    previousSiteId,
    previousSiteName,
}) => {
    const parsedDate =
        typeof activity.date === "string" ? parseISO(activity.date) : null;
    const hasValidDate = parsedDate !== null && isValid(parsedDate);
    const isRecall =
        activity.activityType === "recall" ||
        (typeof activity.description === "string" && /recalled/i.test(activity.description));

    const [isPreviousSiteOpen, setIsPreviousSiteOpen] = useState(false);

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
                        <span>
                            {hasValidDate
                                ? format(parsedDate, "MMM d, yyyy h:mm a")
                                : (typeof activity.date === "string" && activity.date.trim()
                                    ? activity.date
                                    : "Unknown date")}
                        </span>
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
                    {isRecall && previousSiteId && previousSiteName && (
                        <div className="mt-1 space-y-1">
                            <div className="text-xs text-muted-foreground">
                                Previous site
                            </div>
                            <div className="inline-flex items-center gap-1">
                                <button
                                    type="button"
                                    className="text-sm text-blue-600 hover:underline font-medium"
                                    onClick={() => setIsPreviousSiteOpen((v) => !v)}
                                >
                                    {previousSiteName}
                                </button>
                                {isPreviousSiteOpen ? (
                                    <AqChevronUp className="w-4 h-4 text-blue-600" aria-hidden="true" />
                                ) : (
                                    <AqChevronDown className="w-4 h-4 text-blue-600" aria-hidden="true" />
                                )}
                            </div>

                            {isPreviousSiteOpen && (
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground">
                                        Site ID
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span className="font-mono select-all overflow-x-auto whitespace-nowrap scrollbar-hide max-w-full text-gray-700 dark:text-gray-300">
                                            {previousSiteId}
                                        </span>
                                        <ReusableButton
                                            variant="text"
                                            onClick={async () => {
                                                try {
                                                    await navigator.clipboard.writeText(previousSiteId);
                                                    ReusableToast({ message: "Copied", type: "SUCCESS" });
                                                } catch {
                                                    ReusableToast({ message: "Failed to copy", type: "ERROR" });
                                                }
                                            }}
                                            className="p-1"
                                            Icon={AqCopy01}
                                            aria-label="Copy site ID"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {/* If we had file attachments in the activity object, we would render them here */}
                </div>
            </div>
        </div>
    );
};

export default DeviceActivityItem;
