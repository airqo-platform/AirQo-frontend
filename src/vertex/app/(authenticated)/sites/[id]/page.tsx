"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AqArrowLeft } from "@airqo/icons-react";
import ReusableButton from "@/components/shared/button/ReusableButton";
import { useSiteDetails, useRefreshSiteMetadata } from "@/core/hooks/useSites";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { useParams } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { SiteInformationCard } from "@/components/features/sites/site-information-card";
import { SiteMobileAppCard } from "@/components/features/sites/site-mobile-app-card";
import { EditSiteDetailsDialog } from "@/components/features/sites/edit-site-details-dialog";
import ClientPaginatedDevicesTable from "@/components/features/devices/client-paginated-devices-table";
import SiteMeasurementsApiCard from "@/components/features/sites/site-measurements-api-card";
import SiteActivityCard from "@/components/features/sites/site-activity-card";
import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import { PERMISSIONS } from "@/core/permissions/constants";

const ContentGridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 items-start">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
    ))}
  </div>
);

export default function UserSiteDetailsPage() {
  const params = useParams();
  const siteId = params.id as string;
  const { data: site, isLoading, error } = useSiteDetails(siteId);
  const { mutate: refreshMetadata, isPending: isRefreshing } = useRefreshSiteMetadata();
  const router = useRouter();
  const [editSection, setEditSection] = useState<"general" | "mobile" | null>(
    null
  );

  return (
    <RouteGuard permission={PERMISSIONS.SITE.VIEW}>
      <div>
        <div className="mb-6 flex justify-between items-center">
          <ReusableButton
            variant="text"
            onClick={() => router.back()}
            Icon={AqArrowLeft}
          >
            Back
          </ReusableButton>

          <ReusableButton
            variant="outlined"
            onClick={() => refreshMetadata(siteId)}
            disabled={isRefreshing || isLoading || !site}
            loading={isRefreshing}
            Icon={RefreshCw}
            className="text-xs font-medium"
          >
            Refresh Metadata
          </ReusableButton>
        </div>

        {error ? (
          <div className="flex items-center justify-center min-h-[50vh] p-4">
            <Alert variant="destructive" className="max-w-md">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Unable to load site details. Please try again.
              </AlertDescription>
            </Alert>
          </div>
        ) : isLoading ? (
          <ContentGridSkeleton />
        ) : !site ? (
          <div className="mt-8 text-center text-sm text-muted-foreground">
            Site not found.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              <div className="flex flex-col gap-6">
                <SiteInformationCard
                  site={site}
                  onEdit={() => setEditSection("general")}
                />
              </div>

              <div className="flex flex-col gap-6">
                <SiteMobileAppCard
                  site={site}
                  onEdit={() => setEditSection("mobile")}
                />
                <SiteMeasurementsApiCard siteId={siteId} />
              </div>

              <div className="flex flex-col gap-6">
                <SiteActivityCard siteId={siteId} />
              </div>
            </div>
            <div className="mt-6">
              <ClientPaginatedDevicesTable
                devices={site.devices || []}
                isLoading={isLoading}
                error={error}
                hiddenColumns={["site", "groups"]}
                onDeviceClick={(device) => {
                  router.push(`/devices/overview/${device._id}`);
                }}
              />
            </div>
            <EditSiteDetailsDialog
              open={!!editSection}
              onOpenChange={(open) => !open && setEditSection(null)}
              site={site}
              section={editSection || "general"}
            />
          </>
        )}
      </div>
    </RouteGuard>
  );
}
