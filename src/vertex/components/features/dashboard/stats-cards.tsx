'use client';

import { useDevices, useMyDevices } from '@/core/hooks/useDevices';
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
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { useMemo, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  description?: string;
  icon: React.ReactNode;
  isLoading?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

const StatCard = ({ title, value, subtitle, description, icon, isLoading, variant = 'default' }: StatCardProps) => {
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

  const cardContent = (
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

  if (description) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {cardContent}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-3" side="top">
          <div className="space-y-2">
            <p className="font-semibold text-sm">{title}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return cardContent;
};

export const DashboardStatsCards = () => {
  const { userDetails, activeGroup, userContext, activeNetwork } = useAppSelector((state) => state.user);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  // Context-aware hook selection
  const isPersonalContext = userContext === 'personal';
  
  // Use useMyDevices for personal context
  const myDevicesQuery = useMyDevices(
    userDetails?._id || "",
    activeGroup?._id
  );
  
  // Use useDevices for airqo-internal and external-org contexts
  const organizationDevicesQuery = useDevices();
  
  // Select appropriate data based on context
  const currentDevicesData = isPersonalContext ? myDevicesQuery.data : null;
  const currentOrganizationDevices = !isPersonalContext ? organizationDevicesQuery.devices : [];
  const isLoading = isPersonalContext ? myDevicesQuery.isLoading : organizationDevicesQuery.isLoading;

  // Helper function to calculate device stats from device array
  const calculateDeviceStats = useCallback((devices: any[]) => {
    const online = devices.filter(device => device.isOnline || device.status === 'online').length;
    const offline = devices.filter(device => !device.isOnline || device.status === 'offline').length;
    
    return {
      total: devices.length,
      online,
      offline,
      maintenance: {
        due: devices.filter(device => device.maintenance_status === 'due').length,
        overdue: devices.filter(device => device.maintenance_status === 'overdue').length,
      }
    };
  }, []);

  // Memoize metrics calculations with stable references
  const metrics = useMemo(() => {
    let totalMonitors = 0;
    let activeMonitors = 0;
    let pendingDeployments = 0;
    let recentAlerts = 0;

    if (isPersonalContext && currentDevicesData) {
      // Personal context: use myDevicesData
      totalMonitors = currentDevicesData.total_devices || 0;
      
      const deviceStats = calculateDeviceStats(currentDevicesData.devices || []);
      activeMonitors = deviceStats.online;
      
      pendingDeployments = currentDevicesData.devices?.filter(device => 
        device.claim_status === 'claimed' && device.status !== 'deployed'
      ).length || 0;
      
      recentAlerts = deviceStats.offline + deviceStats.maintenance.due + deviceStats.maintenance.overdue;
    } else if (!isPersonalContext && currentOrganizationDevices.length > 0) {
      // Organization context: use organization devices
      const deviceStats = calculateDeviceStats(currentOrganizationDevices);
      totalMonitors = deviceStats.total;
      activeMonitors = deviceStats.online;
      
      pendingDeployments = currentOrganizationDevices.filter(device => 
        device.status === 'not deployed' || (device.claim_status === 'claimed' && device.status !== 'deployed')
      ).length;
      
      recentAlerts = deviceStats.offline + deviceStats.maintenance.due + deviceStats.maintenance.overdue;
    }

    return {
      totalMonitors,
      activeMonitors,
      pendingDeployments,
      recentAlerts
    };
  }, [
    isPersonalContext,
    currentDevicesData?.total_devices,
    currentDevicesData?.devices?.length,
    currentOrganizationDevices.length,
    calculateDeviceStats
  ]);

  // Manual refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      if (isPersonalContext) {
        await myDevicesQuery.refetch();
      } else {
        // For organization context, invalidate the devices query
        await queryClient.invalidateQueries({ 
          queryKey: ["devices", activeNetwork?.net_name, activeGroup?.grp_title] 
        });
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [isPersonalContext, myDevicesQuery, queryClient, activeNetwork?.net_name, activeGroup?.grp_title]);

  return (
    <TooltipProvider>
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
            description={`The total number of ${isPersonalContext ? 'your personal' : 'organization'} devices. This includes all devices regardless of their current status - online, offline, deployed, or undeployed.`}
            icon={<Activity className="w-4 h-4" />}
            isLoading={isLoading}
          />
          <StatCard
            title="Active Devices"
            value={metrics.activeMonitors}
            description="The number of devices currently online and actively transmitting data. These devices are connected to the network and reporting sensor measurements."
            icon={<Wifi className="w-4 h-4" />}
            isLoading={isLoading}
          />
          <StatCard
            title="Pending Deployments"
            value={metrics.pendingDeployments}
            description="The number of devices that have been claimed but are not yet deployed in the field. These devices are ready for deployment but haven't been installed at monitoring locations."
            icon={<Clock className="w-4 h-4" />}
            isLoading={isLoading}
          />
          <StatCard
            title="Recent Alerts"
            value={metrics.recentAlerts}
            description="The total number of devices requiring attention. This includes offline devices, devices due for maintenance, and devices that are overdue for maintenance."
            icon={<AlertTriangle className="w-4 h-4" />}
            isLoading={isLoading}
          />
        </div>
      </div>
    </TooltipProvider>
  );
};
 