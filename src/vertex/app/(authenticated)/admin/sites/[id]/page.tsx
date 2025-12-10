"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AqArrowLeft, AqEdit01 } from "@airqo/icons-react";
import ReusableButton from "@/components/shared/button/ReusableButton";
import { useSiteDetails } from "@/core/hooks/useSites";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { useParams } from "next/navigation";
import { SiteInformationCard } from "@/components/features/sites/site-information-card";
import { SiteMobileAppCard } from "@/components/features/sites/site-mobile-app-card";
import { EditSiteDetailsDialog } from "@/components/features/sites/edit-site-details-dialog";
import ClientPaginatedDevicesTable from "@/components/features/devices/client-paginated-devices-table";

const ActionButtonsSkeleton = () => (
  <div className="flex gap-1">
    <div className="h-9 w-24 bg-gray-200 rounded animate-pulse" />
    <div className="h-9 w-32 bg-gray-200 rounded animate-pulse" />
    <div className="h-9 w-36 bg-gray-200 rounded animate-pulse" />
  </div>
);

const ContentGridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 items-start">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
    ))}
  </div>
);

export default function SiteDetailsPage() {
  const params = useParams();
  const siteId = params.id as string;
  const { data: site, isLoading, error } = useSiteDetails(siteId);
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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
    <div>
      <div className="mb-6 flex justify-between items-center">
        <ReusableButton variant="text" onClick={() => router.back()} Icon={AqArrowLeft}>
          Back
        </ReusableButton>
        {isLoading ? (
          <ActionButtonsSkeleton />
        ) : !site ? null : (<ReusableButton onClick={() => setIsEditDialogOpen(true)} Icon={AqEdit01}>
          Edit Site
        </ReusableButton>
        )}
      </div>

      {isLoading ? (
        <ContentGridSkeleton />
      ) : !site ? (
        <div className="mt-8 text-center text-sm text-muted-foreground">
          Site not found.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2">
              <SiteInformationCard site={site} />
            </div>
            <div className="lg:col-span-1">
              <SiteMobileAppCard site={site} />
            </div>
          </div>
          <div className="mt-6">
            <ClientPaginatedDevicesTable
              devices={site.devices || []}
              isLoading={isLoading}
              error={error}
              hiddenColumns={["site", "groups"]}
            />
          </div>
          <EditSiteDetailsDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} site={site} />
        </>
      )}

    </div>
  );
}
