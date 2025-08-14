"use client";

import { useDeviceStatus } from "@/core/hooks/useDevices";
import { Activity, Clock, AlertTriangle, Sun, Power, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Card from "@/components/shared/card/CardWrapper";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description?: string;
}

const StatCard = ({ title, value, icon, description }: StatCardProps) => (
  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors">
    <div className="p-2 bg-primary/10 rounded-lg shrink-0">{icon}</div>
    <div className="min-w-0">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-xl font-semibold">{value}</p>
      {description && (
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      )}
    </div>
  </div>
);

const StatCardSkeleton = () => (
  <div className="flex items-center gap-3 p-3 rounded-lg">
    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
      <Skeleton className="h-5 w-5" />
    </div>
    <div className="min-w-0 flex-1">
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-6 w-16" />
    </div>
  </div>
);

export function StatusSummary() {
  const { stats, isLoading } = useDeviceStatus();

  return (
    <Card
      className="relative w-full h-full text-left"
      rounded={false}
      padding="p-0"
      overflow
    >
      <div className="h-full flex flex-col">
        <div className="p-4">
          <h2 className="font-semibold mb-3">Device Status</h2>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              title="Total Devices"
              value={stats.total}
              icon={<Activity className="h-5 w-5" />}
              description={`${stats.online} online, ${stats.offline} offline`}
            />
          )}
        </div>

        <div className="p-4">
          <h2 className="font-semibold mb-3">Maintenance</h2>
          <div>
            {isLoading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <StatCard
                  title="Due Maintenance"
                  value={stats.maintenance.due}
                  icon={<Clock className="h-5 w-5" />}
                />
                <StatCard
                  title="Overdue"
                  value={stats.maintenance.overdue}
                  icon={<AlertTriangle className="h-5 w-5" />}
                />
              </>
            )}
          </div>
        </div>

        <div className="p-4">
          <h2 className="font-semibold mb-3">Power Source</h2>
          <div>
            {isLoading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <StatCard
                  title="Solar Powered"
                  value={stats.powerSource.solar}
                  icon={<Sun className="h-5 w-5" />}
                />
                <StatCard
                  title="Alternator"
                  value={stats.powerSource.alternator}
                  icon={<Power className="h-5 w-5" />}
                />
                <StatCard
                  title="Mains Powered"
                  value={stats.powerSource.mains}
                  icon={<Zap className="h-5 w-5" />}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
