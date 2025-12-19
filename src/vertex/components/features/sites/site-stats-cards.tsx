"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
    AqMonitor,
    AqCollocation,
    AqWifiOff,
    AqData,
} from "@airqo/icons-react";
import { StatCard } from "@/components/features/dashboard/stat-card";
import { getStatusExplanation } from "@/core/utils/status";
import { useSiteStatistics } from "@/core/hooks/useSites";

interface SiteStatsCardsProps {
    network?: string;
}

export const SiteStatsCards = ({ network }: SiteStatsCardsProps) => {
    const { metrics, isLoading } = useSiteStatistics(network);

    const router = useRouter();
    const searchParams = useSearchParams();
    const currentStatus = searchParams.get("status");

    const handleFilter = (status?: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (status) {
            params.set("status", status);
        } else {
            params.delete("status");
        }
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
                <StatCard
                    title="Total Sites"
                    value={metrics.total}
                    icon={<AqCollocation className="w-5 h-5" />}
                    description={`All sites${network ? ` in ${network}` : ''}.`}
                    isLoading={isLoading}
                    onClick={() => handleFilter()}
                    variant="primary"
                    size="sm"
                    isActive={!currentStatus}
                />

                <StatCard
                    title="Operational"
                    value={metrics.operational}
                    icon={<AqMonitor className="w-5 h-5" />}
                    description={getStatusExplanation("Operational")}
                    isLoading={isLoading}
                    onClick={() => handleFilter('operational')}
                    variant="success"
                    size="sm"
                    isActive={currentStatus === 'operational'}
                />

                <StatCard
                    title="Transmitting"
                    value={metrics.transmitting}
                    icon={<AqMonitor className="w-5 h-5" />}
                    description={getStatusExplanation("Transmitting")}
                    isLoading={isLoading}
                    onClick={() => handleFilter('transmitting')}
                    variant="info"
                    size="sm"
                    isActive={currentStatus === 'transmitting'}
                />

                <StatCard
                    title="Not Transmitting"
                    value={metrics.notTransmitting}
                    icon={<AqWifiOff className="w-5 h-5" />}
                    description={getStatusExplanation("Not Transmitting")}
                    isLoading={isLoading}
                    onClick={() => handleFilter('not-transmitting')}
                    variant="default" // Using default (gray) for inactive/issue
                    size="sm"
                    isActive={currentStatus === 'not-transmitting'}
                />

                <StatCard
                    title="Data Available"
                    value={metrics.dataAvailable}
                    icon={<AqData className="w-5 h-5" />}
                    description={getStatusExplanation("Data Available")}
                    isLoading={isLoading}
                    onClick={() => handleFilter('data-available')}
                    variant="warning"
                    size="sm"
                    isActive={currentStatus === 'data-available'}
                />
            </div>
        </div>
    );
};
