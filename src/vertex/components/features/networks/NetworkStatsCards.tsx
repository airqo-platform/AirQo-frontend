"use client";

import { useDeviceCount } from "@/core/hooks/useDevices";
import { useRouter, useSearchParams } from "next/navigation";
import {
    AqMonitor,
    AqCollocation,
    AqWifiOff,
    AqData,
} from "@airqo/icons-react";
import { useMemo } from "react";
import { StatCard } from "@/components/features/dashboard/StatCard";
import { getStatusExplanation } from "@/core/utils/status";

interface NetworkStatsCardsProps {
    networkId: string;
    networkName: string;
}

export const NetworkStatsCards = ({ networkName }: NetworkStatsCardsProps) => {
    // Pass network name to useDeviceCount for filtering
    const deviceCountQuery = useDeviceCount({
        enabled: !!networkName,
        network: networkName,
    });

    const isLoading = deviceCountQuery.isLoading;

    const metrics = useMemo(() => {
        const summary = deviceCountQuery.data?.summary;
        if (summary) {
            return {
                total: summary.total_monitors,
                operational: summary.operational,
                transmitting: summary.transmitting,
                notTransmitting: summary.not_transmitting,
                dataAvailable: summary.data_available,
            };
        }

        return {
            total: 0,
            operational: 0,
            transmitting: 0,
            notTransmitting: 0,
            dataAvailable: 0,
        };
    }, [deviceCountQuery.data]);

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
                    title="Total Devices"
                    value={metrics.total}
                    icon={<AqCollocation className="w-5 h-5" />}
                    description={`All devices assigned to ${networkName} network.`}
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
                    value={metrics.transmitting ?? "N/A"}
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
                    onClick={() => handleFilter('not_transmitting')}
                    variant="default"
                    size="sm"
                    isActive={currentStatus === 'not_transmitting'}
                />

                <StatCard
                    title="Data Available"
                    value={metrics.dataAvailable}
                    icon={<AqData className="w-5 h-5" />}
                    description={getStatusExplanation("Data Available")}
                    isLoading={isLoading}
                    onClick={() => handleFilter('data_available')}
                    variant="warning"
                    size="sm"
                    isActive={currentStatus === 'data_available'}
                />
            </div>
        </div>
    );
};
