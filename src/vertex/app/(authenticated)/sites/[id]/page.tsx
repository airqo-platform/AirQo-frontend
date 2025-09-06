"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AqArrowLeft, AqEdit01 } from "@airqo/icons-react";
import ReusableButton from "@/components/shared/button/ReusableButton";
import { useSiteDetails } from "@/core/hooks/useSites";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { useParams } from "next/navigation";
import { SiteInformationCard } from "@/components/features/sites/site-information-card";
import { SiteMobileAppCard } from "@/components/features/sites/site-mobile-app-card";
import { EditSiteDetailsDialog } from "@/components/features/sites/edit-site-details-dialog";
import DevicesTable from "@/components/features/devices/device-list-table";

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

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <ReusableButton variant="text" onClick={() => router.back()} Icon={AqArrowLeft}>
          Back
        </ReusableButton>
        <ReusableButton onClick={() => setIsEditDialogOpen(true)} Icon={AqEdit01}>
            Edit Site
          </ReusableButton>
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
        <DevicesTable
          devices={site.devices?.map(device => ({
            ...device,
            status: device.status as "not deployed" | "deployed" | "recalled" | "online" | "offline" | undefined
          })) || []}
          isLoading={isLoading}
          error={error}
          multiSelect={true}
        />
      </div>

      <EditSiteDetailsDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} site={site} />
    </div>
  );
}
