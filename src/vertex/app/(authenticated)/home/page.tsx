"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { PlusSquare, Loader2, AlertTriangle } from "lucide-react";
import { useAppSelector } from "@/core/redux/hooks";
import { PERMISSIONS } from "@/core/permissions/constants";
import PermissionTooltip from "@/components/ui/permission-tooltip";
import { DashboardStatsCards } from "@/components/features/dashboard/stats-cards";
import DashboardWelcomeBanner from "@/components/features/dashboard/DashboardWelcomeBanner";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/core/hooks/useUserContext";
import { usePermissions } from "@/core/hooks/usePermissions";

const WelcomePage = () => {
  const activeGroup = useAppSelector((state) => state.user.activeGroup);
  const router = useRouter();
  const { userContext, isLoading, hasError, error } = useUserContext();

  const allActions = [
    {
      href: "/devices/claim",
      label: "Claim a Device",
      permission: PERMISSIONS.DEVICE.UPDATE,
      showInPersonal: true,
      showInAirQoInternal: true,
      showInExternalOrg: true,
    },
    {
      href: "/devices/deploy",
      label: "Deploy a Device",
      permission: PERMISSIONS.DEVICE.DEPLOY,
      showInPersonal: true,
      showInAirQoInternal: true,
      showInExternalOrg: true,
    },
    {
      href: "/sites",
      label: "Create a Site",
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

  // NOW WE CAN HAVE CONDITIONAL RETURNS
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-lg text-primary">Loading dashboard...</span>
      </div>
    );
  }

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
      <div className="mb-8 relative overflow-hidden md:px-16 md:py-10 rounded-lg mx-auto bg-[#E9F7EF] border-0 bg-gradient-to-r from-primary to-primary/80 text-white p-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-white">
            You&apos;re in{" "}
            <span className="capitalize">{getContextTitle()}! 👋</span>
          </h1>
        </div>
        <p className="mt-2 text-lg text-white/90 max-w-2xl">
          {getContextDescription()}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-10">
        <DashboardStatsCards />
      </div>

      {/* Quick Access Buttons */}
      {actions.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {actions.map((action) => {
              const hasPermission = permissionsMap[action.permission];
              const button = (
                <Button
                  key={action.href}
                  variant="outline"
                  className="w-full gap-2 p-3 border-primary text-primary text-sm font-semibold hover:bg-primary/10 hover:text-primary focus:ring-primary"
                  disabled={!hasPermission}
                  onClick={() => {
                    if (hasPermission) router.push(action.href);
                  }}
                >
                  <PlusSquare className="h-7 w-7 text-primary" />
                  <span>{action.label}</span>
                </Button>
              );
              if (hasPermission) {
                return button;
              } else {
                return (
                  <PermissionTooltip
                    key={action.href}
                    permission={action.permission}
                  >
                    <span className="inline-block w-auto" tabIndex={0}>
                      {button}
                    </span>
                  </PermissionTooltip>
                );
              }
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomePage;
