"use client";

import { GroupList } from "@/components/Organization/List";
import { RouteGuard } from "@/components/layout/accessConfig/route-guard";

const OrganizationSettingsPage = () => {
  return (
    <RouteGuard permission="CREATE_UPDATE_AND_DELETE_NETWORK_USERS">
      <div className="mx-auto">
        <GroupList />
      </div>
    </RouteGuard>
  );
};

export default OrganizationSettingsPage;
