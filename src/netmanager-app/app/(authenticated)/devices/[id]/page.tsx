"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { useDeviceDetails } from "@/core/hooks/useDevices";

export default function DeviceDetailsPage() {
  const params = useParams();
  const deviceId = params.id as string;
  const { data: response, isLoading, error } = useDeviceDetails(deviceId);
  const device = response?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Device not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/devices/overview">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Devices
          </Link>
        </Button>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Device Details &gt; {device.name}</h1>
        </div>
      </div>

      <div className="space-y-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance Logs</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="border rounded-lg p-6 mt-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Name</h3>
                <p>{device.name}</p>
              </div>
              <div>
                <h3 className="font-semibold">Serial Number</h3>
                <p>{device.serial_number}</p>
              </div>
              <div>
                <h3 className="font-semibold">Device Number</h3>
                <p>{device.device_number}</p>
              </div>
              <div>
                <h3 className="font-semibold">Status</h3>
                <p className="capitalize">{device.status}</p>
              </div>
              <div>
                <h3 className="font-semibold">Network</h3>
                <p>{device.network}</p>
              </div>
              <div>
                <h3 className="font-semibold">Category</h3>
                <p className="capitalize">{device.category}</p>
              </div>
              <div>
                <h3 className="font-semibold">Primary Device In Location</h3>
                <p>{device.isPrimaryInLocation ? "Yes" : "No"}</p>
              </div>
              <div>
                <h3 className="font-semibold">Online Status</h3>
                <p>{device.isOnline ? "Online" : "Offline"}</p>
              </div>
              <div>
                <h3 className="font-semibold">Active Status</h3>
                <p>{device.isActive ? "Active" : "Inactive"}</p>
              </div>
              <div>
                <h3 className="font-semibold">Next Maintenance</h3>
                <p>{new Date(device.nextMaintenance).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="font-semibold">Created At</h3>
                <p>{new Date(device.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="font-semibold">Height</h3>
                <p>{device.height} m</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="edit" className="border rounded-lg p-6 mt-6">
            {/* TODO: Add device edit form */}
            <p>Edit form will go here</p>
          </TabsContent>

          <TabsContent value="maintenance" className="border rounded-lg p-6 mt-6">
            {/* TODO: Add maintenance logs table */}
            <p>Maintenance logs will go here</p>
          </TabsContent>

          <TabsContent value="photos" className="border rounded-lg p-6 mt-6">
            {/* TODO: Add photos grid */}
            <p>Photos will go here</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 