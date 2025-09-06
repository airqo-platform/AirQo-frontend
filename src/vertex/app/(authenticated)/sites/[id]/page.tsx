"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AqArrowLeft, AqEdit01 } from "@airqo/icons-react";
import ReusableButton from "@/components/shared/button/ReusableButton";
import { SiteDevices } from "./devices";
import { useSiteDetails } from "@/core/hooks/useSites";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { useParams } from "next/navigation";
import { SiteInformationCard } from "@/components/features/sites/site-information-card";
import { SiteMobileAppCard } from "@/components/features/sites/site-mobile-app-card";
import { EditSiteDetailsDialog } from "@/components/features/sites/edit-site-details-dialog";
import { Device } from "@/app/types/sites";

export default function SiteDetailsPage() {
  const params = useParams();
  const siteId = params.id as string;
  const { data: site, isLoading, error } = useSiteDetails(siteId);
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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
        <ReusableButton variant="text" onClick={() => router.back()} Icon={AqArrowLeft}>
          Back to Sites
        </ReusableButton>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Site Details</h1>
          <ReusableButton onClick={() => setIsEditDialogOpen(true)} Icon={AqEdit01}>
            Edit Site
          </ReusableButton>
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
      <div className="mt-6">
      <SiteDevices devices={transformedDevices} />
      </div>

      <EditSiteDetailsDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} site={site} />
    </div>
  );
}
