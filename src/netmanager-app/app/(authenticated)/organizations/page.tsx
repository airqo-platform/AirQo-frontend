"use client";

import { OrganizationList } from "@/components/Organization/List";
import { RouteGuard } from "@/components/route-guard";

const OrganizationSettingsPage = () => {
  return (
    <RouteGuard permission="CREATE_UPDATE_AND_DELETE_NETWORK_USERS">
      <div className="mx-auto">
        <OrganizationList />
      </div>
    </RouteGuard>
  );
};

export default OrganizationSettingsPage;
