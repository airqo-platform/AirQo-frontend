import { Card } from "@/components/ui/card";
import React, { useEffect, useRef } from "react";
import { useSiteActivitiesInfinite } from "@/core/hooks/useSites";
import DeviceActivityItem from "@/components/features/devices/device-activity-item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

interface SiteActivityCardProps {
    siteId: string;
}

const SiteActivityCard: React.FC<SiteActivityCardProps> = ({
    siteId,
}) => {
    const {
        data,
        isLoading,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useSiteActivitiesInfinite(siteId);

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

    return (
        <Card className="w-full rounded-lg">
            <div className="flex items-center justify-between px-3 py-2 border-b">
                <h2 className="text-lg font-semibold">Site Activity</h2>
            </div>

            <div className="px-3 py-0">
                {isLoading ? (
                    <div className="text-sm text-muted-foreground p-3">Loading history...</div>
                ) : error ? (
                    <div className="text-sm text-red-500 p-3">Failed to load history.</div>
                ) : activities.length === 0 ? (
                    <div className="text-sm text-muted-foreground p-3">No recent activity.</div>
                ) : (
                    <ScrollArea className="h-[200px] pr-4">
                        <div className="space-y-0 pt-3">
                            {activities.map((activity, index) => (
                                <DeviceActivityItem
                                    key={`${activity._id}-${index}`}
                                    activity={activity}
                                    isLast={index === activities.length - 1 && !hasNextPage}
                                    showDeviceName={true}
                                />
                            ))}
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

export default SiteActivityCard;
