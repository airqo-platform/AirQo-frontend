"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { PlusSquare, AlertTriangle } from "lucide-react";
import { useAppSelector } from "@/core/redux/hooks";
import { PERMISSIONS } from "@/core/permissions/constants";
import DashboardWelcomeBanner from "@/components/features/dashboard/DashboardWelcomeBanner";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/core/hooks/useUserContext";
import { usePermissions } from "@/core/hooks/usePermissions";
import ReusableButton from "@/components/shared/button/ReusableButton";
import { Skeleton } from "@/components/ui/skeleton";
import HomeEmptyState from "@/components/features/home/HomeEmptyState";
import { useDevices, useMyDevices } from "@/core/hooks/useDevices";

const StatsSkeleton = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="md:col-span-1 lg:col-span-1">
          <div className="rounded-lg bg-white dark:bg-gray-800 border p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="h-10 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Lazy load stats cards
const DashboardStatsCards = dynamic(
  () => import("@/components/features/dashboard/stats-cards").then(mod => ({ default: mod.DashboardStatsCards })),
  {
    ssr: false,
    loading: () => <StatsSkeleton />,
  }
);

const WelcomePage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { userContext, userScope, hasError, error } = useUserContext();

  const activeGroup = useAppSelector((state) => state.user.activeGroup);
  const user = useAppSelector((state) => state.user.userDetails);

  const allActions = [
    {
      href: "/devices/claim",
      label: "Claim Device",
      permission: PERMISSIONS.DEVICE.UPDATE,
      showInPersonal: true,
      showInAirQoInternal: true,
      showInExternalOrg: true,
    }
  ];

  const permissionsToCheck = allActions.map((action) => action.permission);
  const permissionsMap = usePermissions(permissionsToCheck);

  const userId = (session?.user as { id?: string })?.id || user?._id;

  const { devices: groupDevices, isLoading: isLoadingGroupDevices } = useDevices({
    limit: 1,
    enabled: userScope === 'organisation',
  });

  const { data: myDevicesData, isLoading: isLoadingMyDevices } = useMyDevices(
    userId || "",
    undefined,
    {
      enabled: !!userId && userScope === 'personal',
    }
  );

  // ============================================================
  // EARLY RETURNS - All checks happen BEFORE any UI is rendered
  // ============================================================

  // 1. Error state - check first
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

  // 2. Loading state - show loading UI while data is being fetched
  const isLoading =
    (userScope === 'personal' && isLoadingMyDevices) ||
    (userScope === 'organisation' && isLoadingGroupDevices);

  if (isLoading) {
    return (
      <div>
        {/* Context Header Skeleton */}
        <div className="mb-8 relative overflow-hidden md:px-16 md:py-10 rounded-lg mx-auto bg-white dark:bg-gray-800 border p-8">
          <div className="space-y-3">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        </div>
        {/* Stats Cards Skeleton */}
        <div className="mb-10">
          <StatsSkeleton />
        </div>
        {/* Quick Access Skeleton */}
        <div className="mb-10">
          <Skeleton className="h-7 w-32 mb-4" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 3. Empty state - check AFTER loading is complete but BEFORE main UI
  const hasNoDevices = userScope === 'personal'
    ? (myDevicesData?.devices || []).length === 0
    : groupDevices.length === 0;

  if (hasNoDevices) {
    return <HomeEmptyState />;
  }

  // ============================================================
  // MAIN UI - Only renders when we have data to show
  // ============================================================

  const getContextTitle = () => {
    switch (userContext) {
      case "personal":
        return "your space";
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5">
            {actions.map((action) => {
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