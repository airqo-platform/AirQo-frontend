"use client";

import React from "react";
import { PlusSquare, AlertTriangle } from "lucide-react";
import { useAppSelector } from "@/core/redux/hooks";
import { PERMISSIONS } from "@/core/permissions/constants";
import { DashboardStatsCards } from "@/components/features/dashboard/stats-cards";
import DashboardWelcomeBanner from "@/components/features/dashboard/DashboardWelcomeBanner";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/core/hooks/useUserContext";
import { usePermissions } from "@/core/hooks/usePermissions";
import ReusableButton from "@/components/shared/button/ReusableButton";
import { Skeleton } from "@/components/ui/skeleton";

const WelcomePage = () => {
  const activeGroup = useAppSelector((state) => state.user.activeGroup);
  const router = useRouter();
  const { userContext, hasError, error } = useUserContext();
  const isContextLoading = useAppSelector((state) => state.user.isContextLoading);

  const allActions = [
    {
      href: "/devices/claim",
      label: "Claim Device",
      permission: PERMISSIONS.DEVICE.UPDATE,
      showInPersonal: true,
      showInAirQoInternal: true,
      showInExternalOrg: true,
    },
    {
      href: "/devices/deploy",
      label: "Deploy Device",
      permission: PERMISSIONS.DEVICE.DEPLOY,
      showInPersonal: true,
      showInAirQoInternal: true,
      showInExternalOrg: true,
    },
    {
      href: "/sites",
      label: "Create Site",
      permission: PERMISSIONS.SITE.CREATE,
      showInPersonal: false,
      showInAirQoInternal: true,
      showInExternalOrg: false,
    },
    {
      href: "/sites",
      label: "Manage Sites",
      permission: PERMISSIONS.SITE.VIEW,
      showInPersonal: false,
      showInAirQoInternal: true,
      showInExternalOrg: false,
    },
  ];

  // Get all permissions at once - THIS HOOK MUST BE CALLED BEFORE CONDITIONAL RETURNS
  const permissionsToCheck = allActions.map((action) => action.permission);
  const permissionsMap = usePermissions(permissionsToCheck);

  // Error state
  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
        <span className="text-lg text-red-600 font-semibold">
          {error || "Failed to load dashboard context."}
        </span>
      </div>
    );
  }

  const getContextTitle = () => {
    switch (userContext) {
      case "personal":
        return "your space";
      case "airqo-internal":
        return "AirQo Organization";
      case "external-org":
        return activeGroup?.grp_title.split("_").join(" ") || "Organization";
      default:
        return "Dashboard";
    }
  };

  const getContextDescription = () => {
    switch (userContext) {
      case "personal":
        return "Manage and monitor your personal devices. You can switch to an organisation view anytime";
      case "airqo-internal":
        return "Full access to AirQo device management features";
      case "external-org":
        return `View and manage all devices linked to your organisation`;
      default:
        return "Welcome to your dashboard";
    }
  };

  // Filter actions based on context
  const getContextActions = () => {
    return allActions.filter((action) => {
      switch (userContext) {
        case "personal":
          return action.showInPersonal;
        case "airqo-internal":
          return action.showInAirQoInternal;
        case "external-org":
          return action.showInExternalOrg;
        default:
          return true;
      }
    });
  };

  const actions = getContextActions();

  return (
    <div>
      <DashboardWelcomeBanner />

      {/* Context Header */}
      <div className="mb-8 relative overflow-hidden md:px-16 md:py-10 rounded-lg mx-auto bg-gradient-to-r from-primary to-primary/80 text-white p-8">
        {isContextLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-3/4 bg-white/20" />
            <Skeleton className="h-6 w-1/2 bg-white/20" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-white">
                You&apos;re in{" "}
                <span className="capitalize">{getContextTitle()}! 👋</span>
              </h1>
            </div>
            <p className="mt-2 text-lg text-white/90 max-w-2xl">
              {getContextDescription()}
            </p>
          </>
        )}
      </div>

      {/* Stats Cards */}
      <div className="mb-10">
        <DashboardStatsCards />
      </div>

      {/* Quick Access Buttons */}
      {(isContextLoading || actions.length > 0) && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5">
            {isContextLoading
              ? getContextActions().map((action) => (
                  <Skeleton key={action.href} className="h-12 w-full" />
                ))
              : actions.map((action) => {
                  const hasPermission = permissionsMap[action.permission];
                  return (
                    <ReusableButton
                      key={action.href}
                      variant="outlined"
                      className="w-full"
                      padding="p-3"
                      disabled={!hasPermission}
                      permission={action.permission}
                      onClick={() => router.push(action.href)}
                      Icon={PlusSquare}
                    >
                      {action.label}
                    </ReusableButton>
                  );
                })}
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomePage;
