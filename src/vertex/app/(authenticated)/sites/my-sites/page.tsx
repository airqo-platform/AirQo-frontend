"use client";

import { useRouter } from "next/navigation";
import { useMySites } from "@/core/hooks/useSites";
import { useAppSelector } from "@/core/redux/hooks";
import { useUserContext } from "@/core/hooks/useUserContext";
import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import { PERMISSIONS } from "@/core/permissions/constants";
import ClientPaginatedSitesTable from "@/components/features/sites/client-paginated-sites-table";

const MySitesPage = () => {
  const router = useRouter();
  const { userContext } = useUserContext();
  const { userDetails, activeGroup } = useAppSelector((state) => state.user);
  const { data: mySitesData, isLoading, error } = useMySites(
    userDetails?._id || "",
    activeGroup?._id,
    { enabled: userContext === 'personal' }
  );

  const sites = mySitesData?.sites || [];

  return (
    <RouteGuard permission={PERMISSIONS.SITE.VIEW} allowedContexts={['personal']} redirectTo="/home" showError={false}>
      <div>
        <div className="mb-3">
          <div>
            <h1 className="text-2xl font-semibold">My Sites</h1>
            <p className="text-sm text-muted-foreground">
              Manage your personal monitoring sites
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <ClientPaginatedSitesTable
            sites={sites}
            isLoading={isLoading}
            error={error}
            onSiteClick={(site) => router.push(`/sites/${site._id}`)}
          />
        </div>
      </div>
    </RouteGuard>
  );
};

export default MySitesPage;
