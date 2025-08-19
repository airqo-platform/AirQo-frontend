"use client";

import { GroupList } from "@/components/features/organization/List";
import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import { PERMISSIONS } from "@/core/permissions/constants";

const OrganizationSettingsPage = () => {
  return (
    <RouteGuard 
      permission={PERMISSIONS.USER.MANAGEMENT}
      allowedContexts={['airqo-internal']}
    >
      <div className="mx-auto">
        <GroupList />
      </div>
    </RouteGuard>
  );
};

export default OrganizationSettingsPage;
