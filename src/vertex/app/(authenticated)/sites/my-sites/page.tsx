"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { AqMarkerPin01 } from "@airqo/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { useMySites } from "@/core/hooks/useSites";
import { useAppSelector } from "@/core/redux/hooks";
import { useUserContext } from "@/core/hooks/useUserContext";
import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import { PERMISSIONS } from "@/core/permissions/constants";
import ClientPaginatedSitesTable from "@/components/features/sites/client-paginated-sites-table";
import ReusableButton from "@/components/shared/button/ReusableButton";
import dynamic from "next/dynamic";

const CreateSiteForm = dynamic(
  () =>
    import("@/components/features/sites/create-site-form").then(
      (mod) => mod.CreateSiteForm
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-36 h-10 rounded-lg bg-gray-200 animate-pulse" />
    ),
  }
);

const MySitesPage = () => {
  const { userDetails, activeGroup } = useAppSelector((state) => state.user);
  const { userScope } = useUserContext();

  const {
    data: mySitesData,
    isLoading,
    error,
  } = useMySites(userDetails?._id || "", activeGroup?._id, {
    enabled: userScope === "personal",
  });

  const sites = mySitesData?.sites || [];

  const searchParams = useSearchParams();
  const rawStatus = searchParams.get("status");
  const statusFilter = [
    "operational",
    "transmitting",
    "not_transmitting",
    "data_available",
  ].includes(rawStatus || "")
    ? rawStatus
    : null;

  const filteredSites = React.useMemo(() => {
    if (!statusFilter) return sites;
    return sites.filter((site) => {
      if (statusFilter === "operational")
        return site.rawOnlineStatus === true && site.isOnline === true;
      if (statusFilter === "transmitting")
        return site.rawOnlineStatus === true && site.isOnline === false;
      if (statusFilter === "not_transmitting")
        return site.rawOnlineStatus === false && site.isOnline === false;
      if (statusFilter === "data_available")
        return site.rawOnlineStatus === false && site.isOnline === true;
      return true;
    });
  }, [sites, statusFilter]);

  if (error) {
    return (
      <RouteGuard permission={PERMISSIONS.SITE.VIEW}>
        <div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-semibold">My Sites</h1>
              <p className="text-muted-foreground">
                Manage your personal monitoring sites
              </p>
            </div>
          </div>
          <Card>
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <AqMarkerPin01 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Unable to load sites
                </h3>
                <p className="text-muted-foreground mb-4">
                  There was an error loading your sites. Please try again or
                  contact support if the problem persists.
                </p>
                <ReusableButton onClick={() => window.location.reload()}>
                  Retry
                </ReusableButton>
              </div>
            </CardContent>
          </Card>
        </div>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard permission={PERMISSIONS.SITE.VIEW}>
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold">My Sites</h1>
              {statusFilter && (
                <span className="text-sm px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  Filtered: {statusFilter.replace(/_/g, " ")}
                </span>
              )}
            </div>
            <p className="text-muted-foreground">
              Manage your personal monitoring sites
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <CreateSiteForm basePath="/sites" />
          </div>
        </div>

        <ClientPaginatedSitesTable
          sites={filteredSites}
          isLoading={isLoading}
          error={error}
          multiSelect
        />
      </div>
    </RouteGuard>
  );
};

export default MySitesPage;
