"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Search, 
  MapPin, 
  Calendar, 
  Wifi, 
  WifiOff,
  Building2,
  User,
  Settings,
  Rocket,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMyDevices, useUnassignDeviceFromOrganization } from "@/core/hooks/useDevices";
import { useAppSelector } from "@/core/redux/hooks";
import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import { Device } from "@/app/types/devices";
import { DeviceAssignmentModal } from "@/components/features/devices/device-assignment-modal";

type DeviceFilter = "all" | "my-devices" | "shared-devices";
type DeviceStatus = "all" | "claimed" | "deployed" | "maintenance";

const MyDevicesPage = () => {
  const router = useRouter();
  const { userDetails, activeGroup } = useAppSelector((state) => state.user);
  const [searchQuery, setSearchQuery] = useState("");
  const [ownershipFilter, setOwnershipFilter] = useState<DeviceFilter>("all");
  const [statusFilter, setStatusFilter] = useState<DeviceStatus>("all");
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  const { data: devicesData, isLoading, error } = useMyDevices(
    userDetails?._id || "",
    activeGroup?._id
  );

  const unassignDevice = useUnassignDeviceFromOrganization();

  const filteredDevices = useMemo(() => {
    if (!devicesData?.devices) return [];

    return devicesData.devices.filter((device) => {
      // Search filter
      const matchesSearch = 
        device.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.long_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Ownership filter
      const isMyDevice = device.owner_id === userDetails?._id;
      const isSharedDevice = Boolean(device.assigned_organization_id && !isMyDevice);
      
      let matchesOwnership = true;
      if (ownershipFilter === "my-devices") {
        matchesOwnership = isMyDevice;
      } else if (ownershipFilter === "shared-devices") {
        matchesOwnership = isSharedDevice;
      }

      // Status filter
      let matchesStatus = true;
      if (statusFilter !== "all") {
        matchesStatus = device.claim_status === statusFilter;
      }

      return matchesSearch && matchesOwnership && matchesStatus;
    });
  }, [devicesData?.devices, searchQuery, ownershipFilter, statusFilter, userDetails?._id]);

  const handleDeployDevice = (device: Device) => {
    router.push(`/devices/deploy?device=${device.name}`);
  };

  const handleAssignDevice = (device: Device) => {
    setSelectedDevice(device);
    setShowAssignmentModal(true);
  };

  const handleUnassignDevice = async (device: Device) => {
    if (!userDetails?._id) return;
    
    await unassignDevice.mutateAsync({
      deviceName: device.name,
      userId: userDetails._id,
    });
  };

  const getDeviceStatusIcon = (device: Device) => {
    if (device.isOnline) {
      return <Wifi className="h-4 w-4 text-green-500" />;
    }
    return <WifiOff className="h-4 w-4 text-red-500" />;
  };

  const getDeviceStatusBadge = (device: Device) => {
    if (device.claim_status === "deployed") {
      return <Badge variant="default">Deployed</Badge>;
    } else if (device.claim_status === "claimed") {
      return <Badge variant="secondary">Claimed</Badge>;
    }
    return <Badge variant="outline">Unknown</Badge>;
  };

  const getOwnershipBadge = (device: Device) => {
    if (device.owner_id === userDetails?._id) {
      return <Badge variant="default" className="flex items-center gap-1">
        <User className="h-3 w-3" />
        You
      </Badge>;
    }
    return <Badge variant="outline" className="flex items-center gap-1">
      <Building2 className="h-3 w-3" />
      Shared
    </Badge>;
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive">Error loading devices: {error.message}</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <RouteGuard permission="CREATE_UPDATE_AND_DELETE_NETWORK_DEVICES">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold">My Devices</h1>
            <p className="text-muted-foreground">
              Manage your personal and shared devices
              {activeGroup && (
                <span className="ml-2 text-sm">
                  • Viewing in {activeGroup.grp_title}
                </span>
              )}
            </p>
          </div>
          <Button onClick={() => router.push("/devices/claim")}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Device
          </Button>
        </div>

        {/* Stats Cards */}
        {devicesData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Devices</p>
                    <p className="text-2xl font-bold">{devicesData.total_devices}</p>
                  </div>
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Deployed</p>
                    <p className="text-2xl font-bold">{devicesData.deployed_devices}</p>
                  </div>
                  <Rocket className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Online</p>
                    <p className="text-2xl font-bold">
                      {filteredDevices.filter(d => d.isOnline).length}
                    </p>
                  </div>
                  <Wifi className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">My Devices</p>
                    <p className="text-2xl font-bold">
                      {filteredDevices.filter(d => d.owner_id === userDetails?._id).length}
                    </p>
                  </div>
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search devices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={ownershipFilter} onValueChange={(value) => setOwnershipFilter(value as DeviceFilter)}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by ownership" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Devices</SelectItem>
                  <SelectItem value="my-devices">My Devices</SelectItem>
                  <SelectItem value="shared-devices">Shared Devices</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as DeviceStatus)}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="claimed">Claimed</SelectItem>
                  <SelectItem value="deployed">Deployed</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Devices Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredDevices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDevices.map((device) => (
              <Card key={device._id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{device.long_name}</CardTitle>
                      <CardDescription className="font-mono text-sm">
                        {device.name}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      {getDeviceStatusIcon(device)}
                      {getOwnershipBadge(device)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    {getDeviceStatusBadge(device)}
                    {device.claim_status === "deployed" && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {device.latitude?.toFixed(4)}, {device.longitude?.toFixed(4)}
                      </div>
                    )}
                  </div>
                  
                  {device.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {device.description}
                    </p>
                  )}

                  {device.claimed_at && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Claimed {new Date(device.claimed_at).toLocaleDateString()}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    {device.owner_id === userDetails?._id && device.claim_status === "claimed" && (
                      <Button 
                        size="sm" 
                        onClick={() => handleDeployDevice(device)}
                        className="flex-1"
                      >
                        <Rocket className="mr-1 h-3 w-3" />
                        Deploy
                      </Button>
                    )}
                    
                    {device.owner_id === userDetails?._id && !device.assigned_organization_id && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleAssignDevice(device)}
                        className="flex-1"
                      >
                        <Share2 className="mr-1 h-3 w-3" />
                        Share
                      </Button>
                    )}

                    {device.assigned_organization_id && device.owner_id === userDetails?._id && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleUnassignDevice(device)}
                        disabled={unassignDevice.isPending}
                        className="flex-1"
                      >
                        <Settings className="mr-1 h-3 w-3" />
                        Unshare
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No devices found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || ownershipFilter !== "all" || statusFilter !== "all"
                    ? "Try adjusting your search or filters."
                    : "Get started by claiming your first device."}
                </p>
                <Button onClick={() => router.push("/devices/claim")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Claim Your First Device
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Device Assignment Modal */}
        {selectedDevice && (
          <DeviceAssignmentModal
            device={selectedDevice}
            isOpen={showAssignmentModal}
            onClose={() => {
              setShowAssignmentModal(false);
              setSelectedDevice(null);
            }}
            onSuccess={() => {
              setShowAssignmentModal(false);
              setSelectedDevice(null);
            }}
          />
        )}
      </div>
    </RouteGuard>
  );
};

export default MyDevicesPage; 