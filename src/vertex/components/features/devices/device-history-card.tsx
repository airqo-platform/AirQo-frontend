import { Card } from "@/components/ui/card";
import React, { useEffect, useMemo, useRef } from "react";
import { useDeviceActivities } from "@/core/hooks/useDevices";
import DeviceActivityItem from "@/components/features/devices/device-activity-item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import type { DevicePreviousSite, DeviceSite } from "@/app/types/devices";
import type { DeviceActivity } from "@/core/apis/devices";

const shortId = (id: string) =>
    id.length > 12 ? `${id.slice(0, 6)}…${id.slice(-4)}` : id;

const getSiteName = (site: {
    _id: string;
    location_name?: string;
    name?: string;
    search_name?: string;
}) => {
    return (
        (typeof site.name === "string" && site.name.trim()) ||
        (typeof site.location_name === "string" && site.location_name.trim()) ||
        (typeof site.search_name === "string" && site.search_name.trim()) ||
        shortId(site._id)
    );
};

interface DeviceHistoryCardProps {
    deviceName: string;
    previousSites?: Array<DevicePreviousSite | string>;
    currentSite?: DeviceSite[] | { _id: string; name: string };
}

const DeviceHistoryCard: React.FC<DeviceHistoryCardProps> = ({
    deviceName,
    previousSites,
    currentSite,
}) => {
    const {
        data,
        isLoading,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useDeviceActivities(deviceName);

    const observerTarget = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 1.0 }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [hasNextPage, fetchNextPage]);

    const activities = data?.pages.flatMap((page) => page.site_activities) || [];

    const siteInfoById = useMemo(() => {
        const map = new Map<string, { name?: string; label: string }>();

        if (currentSite) {
            if (Array.isArray(currentSite)) {
                currentSite.forEach((s) => {
                    if (!s?._id) return;
                    const label = getSiteName(s);
                    map.set(s._id, { name: s.name, label });
                });
            } else if (currentSite?._id) {
                const label =
                    (typeof currentSite.name === "string" && currentSite.name.trim()) ||
                    shortId(currentSite._id);
                map.set(currentSite._id, { name: currentSite.name, label });
            }
        }

        if (previousSites && previousSites.length > 0) {
            previousSites.forEach((s) => {
                if (typeof s === "string") {
                    if (s.trim()) map.set(s, { label: shortId(s) });
                    return;
                }
                if (!s?._id) return;
                const label = getSiteName(s);
                map.set(s._id, { name: s.name, label });
            });
        }

        return map;
    }, [currentSite, previousSites]);

    const isRecallActivity = (activity: Pick<DeviceActivity, "activityType" | "description">) => {
        if (activity.activityType === "recall") return true;
        return typeof activity.description === "string" && /recalled/i.test(activity.description);
    };

    const isDeploymentActivity = (activity: Pick<DeviceActivity, "activityType" | "description">) => {
        if (activity.activityType === "deployment") return true;
        return typeof activity.description === "string" && /deployed/i.test(activity.description);
    };

    const resolvePreviousSiteLabel = (activity: DeviceActivity, index: number) => {
        if (!isRecallActivity(activity)) return undefined;

        const directSiteId =
            typeof activity.site_id === "string" && activity.site_id.trim()
                ? activity.site_id
                : undefined;

        let inferredSiteId: string | undefined = directSiteId;
        if (!inferredSiteId) {
            for (let j = index + 1; j < activities.length; j += 1) {
                const next = activities[j];
                const siteId =
                    typeof next.site_id === "string" && next.site_id.trim()
                        ? next.site_id
                        : undefined;
                if (siteId && isDeploymentActivity(next)) {
                    inferredSiteId = siteId;
                    break;
                }
            }
        }

        if (!inferredSiteId) return undefined;

        const info = siteInfoById.get(inferredSiteId);
        return {
            id: inferredSiteId,
            name: (typeof info?.name === "string" && info.name.trim()) ? info.name : (info?.label || shortId(inferredSiteId)),
        };
    };

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
                ) : activities.length === 0 ? (
                    <div className="text-sm text-muted-foreground p-3">No recent activity.</div>
                ) : (
                    <ScrollArea className="h-[300px] pr-4">
                        <div className="space-y-0 pt-3">
                            {activities.map((activity, index) => {
                                const previousSite = resolvePreviousSiteLabel(activity, index);
                                return (
                                    <DeviceActivityItem
                                        key={`${activity._id}-${index}`}
                                        activity={activity}
                                        isLast={index === activities.length - 1 && !hasNextPage}
                                        previousSiteId={previousSite?.id}
                                        previousSiteName={previousSite?.name}
                                    />
                                );
                            })}
                            {/* Loading spinner for infinite scroll */}
                            <div ref={observerTarget} className="py-2 flex justify-center h-4">
                                {isFetchingNextPage && (
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                )}
                            </div>
                        </div>
                    </ScrollArea>
                )}
            </div>
        </Card>
    );
};

export default DeviceHistoryCard;
