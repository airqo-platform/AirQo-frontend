"use client";

import { ChevronLeft, Edit2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteForm } from "../site-form";
import { SiteDevices } from "./devices";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSiteDetails } from "@/core/hooks/useSites";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { useParams } from "next/navigation";
import { Device } from "@/app/types/sites";

export default function SiteDetailsPage() {
  const params = useParams();
  const siteId = params.id as string;
  const { data: site, isLoading, error } = useSiteDetails(siteId);

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

  if (!site) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Site not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  const siteFormData = {
    name: site.name,
    description: site.description,
    organization: site.network,
    latitude: site.latitude.toString(),
    longitude: site.longitude.toString(),
    network: site.network,
    parish: site.parish,
    subCounty: site.sub_county,
    district: site.district,
    region: site.region,
    altitude: site.altitude.toString(),
    greenness: "",
    nearestRoad: site.distance_to_nearest_road?.toString(),
    mobileAppName: site.generated_name,
    mobileAppDescription: site.location_name,
  };

  // Transform devices data for SiteDevices
  const transformedDevices: Device[] = site.devices?.map(device => ({
    name: device.name,
    description: "",
    site: site.name,
    isPrimary: device.isPrimaryInLocation,
    isCoLocated: false,
    registrationDate: new Date(device.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    deploymentStatus: device.isActive ? "Deployed" : "Removed",
  })) || [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/sites">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Sites
          </Link>
        </Button>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Site Details</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Site
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit Site</DialogTitle>
                <DialogDescription>
                  Make changes to the site details here. Click save when you&apos;re
                  done.
                </DialogDescription>
              </DialogHeader>
              <SiteForm initialData={siteFormData} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Site Information</CardTitle>
            <CardDescription>Details about the monitoring site</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Name</h3>
              <p>{site.name}</p>
            </div>
            <div>
              <h3 className="font-semibold">Description</h3>
              <p>{site.description}</p>
            </div>
            <div>
              <h3 className="font-semibold">Network</h3>
              <p>{site.network}</p>
            </div>
            <div>
              <h3 className="font-semibold">Latitude</h3>
              <p>{site.latitude}</p>
            </div>
            <div>
              <h3 className="font-semibold">Longitude</h3>
              <p>{site.longitude}</p>
            </div>
            <div>
              <h3 className="font-semibold">Parish</h3>
              <p>{site.parish}</p>
            </div>
            <div>
              <h3 className="font-semibold">Sub County</h3>
              <p>{site.sub_county}</p>
            </div>
            <div>
              <h3 className="font-semibold">District</h3>
              <p>{site.district}</p>
            </div>
            <div>
              <h3 className="font-semibold">Region</h3>
              <p>{site.region}</p>
            </div>
            <div>
              <h3 className="font-semibold">Altitude</h3>
              <p>{site.altitude} m</p>
            </div>
            <div>
              <h3 className="font-semibold">Nearest Road</h3>
              <p>
                {site.distance_to_nearest_road ? `${site.distance_to_nearest_road} m` : "N/A"}
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Status</h3>
              <p>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    site.isOnline
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {site.isOnline ? "Online" : "Offline"}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location Details</CardTitle>
            <CardDescription>
              Information about the site location
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Formatted Name</h3>
              <p>{site.formatted_name}</p>
            </div>
            <div>
              <h3 className="font-semibold">Location Name</h3>
              <p>{site.location_name}</p>
            </div>
            <div>
              <h3 className="font-semibold">City</h3>
              <p>{site.city}</p>
            </div>
            <div>
              <h3 className="font-semibold">Country</h3>
              <p>{site.country}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Site Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <SiteDevices devices={transformedDevices} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
