"use client";

import { ChevronLeft, Edit2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteForm } from "../site-form";
import { SiteDevices } from "./devices";
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
import { SiteInformationCard } from "@/components/features/sites/site-information-card";
import { SiteMobileAppCard } from "@/components/features/sites/site-mobile-app-card";

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
    mobileAppName: site.search_name,
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
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">
              <DialogHeader className="bg-background pb-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <SiteInformationCard site={site} />
        </div>
        <div className="lg:col-span-1">
          <SiteMobileAppCard site={site} />
        </div>
      </div>

      <SiteDevices devices={transformedDevices} />
    </div>
  );
}
