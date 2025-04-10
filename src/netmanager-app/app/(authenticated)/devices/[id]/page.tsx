"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

export default function DeviceDetailsPage() {
  const params = useParams();
  const deviceId = params.id as string;

  // TODO: Add device details hook
  const isLoading = false;
  const error = null;
  const device = {
    name: "airqo_g5483",
    channelId: "2874910",
    description: "",
    dataAccess: "Private",
    isp: "Internet Service Provider",
    isPrimaryInLocation: false,
    network: "airqo",
    generationVersion: "",
    generationCount: "",
    category: "Lowcost"
  };

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
                <h3 className="font-semibold">Channel ID</h3>
                <p>{device.channelId}</p>
              </div>
              <div>
                <h3 className="font-semibold">Description</h3>
                <p>{device.description || "N/A"}</p>
              </div>
              <div>
                <h3 className="font-semibold">Data Access</h3>
                <p>{device.dataAccess}</p>
              </div>
              <div>
                <h3 className="font-semibold">Internet Service Provider</h3>
                <p>{device.isp}</p>
              </div>
              <div>
                <h3 className="font-semibold">Primary Device In Location</h3>
                <p>{device.isPrimaryInLocation ? "Yes" : "No"}</p>
              </div>
              <div>
                <h3 className="font-semibold">Network</h3>
                <p>{device.network}</p>
              </div>
              <div>
                <h3 className="font-semibold">Generation Version</h3>
                <p>{device.generationVersion || "N/A"}</p>
              </div>
              <div>
                <h3 className="font-semibold">Generation Count</h3>
                <p>{device.generationCount || "N/A"}</p>
              </div>
              <div>
                <h3 className="font-semibold">Category</h3>
                <p>{device.category}</p>
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