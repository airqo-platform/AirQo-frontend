'use client';

import { useDeviceStatus, useDevices } from '@/core/hooks/useDevices';
import { useMyDevices } from '@/core/hooks/useDevices';
import { useAppSelector } from '@/core/redux/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Wifi, 
  Clock, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo, useCallback, useState } from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  isLoading?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

const StatCard = ({ title, value, subtitle, icon, isLoading, variant = 'default' }: StatCardProps) => {
  const getVariantStyles = useCallback(() => {
    switch (variant) {
      case 'success':
        return 'border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800';
      case 'destructive':
        return 'border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800';
      default:
        return 'border-border bg-card';
    }
  }, [variant]);

  const getIconColor = useCallback(() => {
    switch (variant) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'destructive':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-primary';
    }
  }, [variant]);

  if (isLoading) {
    return (
      <Card className={getVariantStyles()}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              {subtitle && <Skeleton className="h-3 w-32" />}
            </div>
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={getVariantStyles()}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className={`w-8 h-8 flex justify-center items-center rounded-full bg-primary/10 ${getIconColor()}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const DashboardStatsCards = () => {
  const { userDetails, activeGroup } = useAppSelector((state) => state.user);
  const { stats: deviceStats, isLoading: isLoadingDeviceStatus } = useDeviceStatus();
  const { devices, isLoading: isLoadingDevices } = useDevices();
  const { data: myDevicesData, isLoading: isLoadingMyDevices, refetch: refetchMyDevices } = useMyDevices(
    userDetails?._id || "",
    activeGroup?._id
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Memoize metrics calculations with stable references
  const metrics = useMemo(() => {
    const totalMonitors = myDevicesData?.total_devices || 0;
    const activeMonitors = deviceStats.online || 0;
    const pendingDeployments = myDevicesData?.devices?.filter(device => 
      device.claim_status === 'claimed'
    ).length || 0;

    // Calculate recent alerts (offline devices, low battery, sensor failures)
    const offlineDevices = deviceStats.offline || 0;
    const devicesNeedingMaintenance = (deviceStats.maintenance?.due || 0) + (deviceStats.maintenance?.overdue || 0);
    const recentAlerts = offlineDevices + devicesNeedingMaintenance;

    return {
      totalMonitors,
      activeMonitors,
      pendingDeployments,
      recentAlerts
    };
  }, [
    myDevicesData?.total_devices, 
    myDevicesData?.devices?.length, // Use length instead of full array
    deviceStats.online, 
    deviceStats.offline, 
    deviceStats.maintenance?.due, 
    deviceStats.maintenance?.overdue
  ]);

  // Only show loading on initial load
  const isLoading = useMemo(() => {
    return isLoadingDeviceStatus && !deviceStats.total && !myDevicesData;
  }, [isLoadingDeviceStatus, deviceStats.total, myDevicesData]);

  // Manual refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetchMyDevices();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchMyDevices]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Device Statistics</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      <StatCard
        title="Total Devices"
        value={metrics.totalMonitors}
        icon={<Activity className="w-4 h-4" />}
        isLoading={isLoading}
      />
      <StatCard
        title="Active Devices"
        value={metrics.activeMonitors}
        icon={<Wifi className="w-4 h-4" />}
        isLoading={isLoading}
        variant={metrics.activeMonitors > 0 ? 'success' : 'default'}
      />
      <StatCard
        title="Pending Deployments"
        value={metrics.pendingDeployments}
        icon={<Clock className="w-4 h-4" />}
        isLoading={isLoading}
        variant={metrics.pendingDeployments > 0 ? 'warning' : 'default'}
      />
      <StatCard
        title="Recent Alerts"
        value={metrics.recentAlerts}
        icon={<AlertTriangle className="w-4 h-4" />}
        isLoading={isLoading}
        variant={metrics.recentAlerts > 0 ? 'destructive' : 'default'}
      />
      </div>
    </div>
  );
};
 