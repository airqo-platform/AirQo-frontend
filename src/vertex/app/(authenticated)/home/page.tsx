"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { Plus, Upload, AlertTriangle } from "lucide-react";
import { useAppSelector } from "@/core/redux/hooks";
import { PERMISSIONS } from "@/core/permissions/constants";
import { useUserContext } from "@/core/hooks/useUserContext";
import { usePermissions } from "@/core/hooks/usePermissions";
import ReusableButton from "@/components/shared/button/ReusableButton";
import { Skeleton } from "@/components/ui/skeleton";
import HomeEmptyState from "@/components/features/home/HomeEmptyState";
import { useDevices, useMyDevices } from "@/core/hooks/useDevices";
import ContextHeader from "@/components/features/home/context-header";
import NetworkVisibilityCard from "@/components/features/home/network-visibility-card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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

const ClaimDeviceModal = dynamic(
  () => import("@/components/features/claim/claim-device-modal"),
  { ssr: false }
);

const ImportDeviceModal = dynamic(
  () => import("@/components/features/devices/import-device-modal"),
  { ssr: false }
);

const WelcomePage = () => {
  const { data: session } = useSession();
  const { userContext, userScope, hasError, error, isLoading: isLoadingUserContext } = useUserContext();
  const [isClaimModalOpen, setIsClaimModalOpen] = React.useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);

  const user = useAppSelector((state) => state.user.userDetails);

  const permissionsToCheck = [PERMISSIONS.DEVICE.UPDATE];
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
    (userScope === 'organisation' && isLoadingGroupDevices) || isLoadingUserContext;

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

  // Filter actions based on context
  const canClaimDevice = permissionsMap[PERMISSIONS.DEVICE.UPDATE];

  // Determine if action is visible in current context
  const showClaimDevice = (() => {
    switch (userContext) {
      case "personal":
        return true;
      case "external-org":
        return true;
      default:
        return true;
    }
  })();

  return (
    <div>
      <ContextHeader />

      {showClaimDevice && (
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl">Home</h1>
          <div className="flex gap-3">
            <ReusableButton
              variant="filled"
              disabled={!canClaimDevice}
              permission={PERMISSIONS.DEVICE.UPDATE}
              onClick={() => setIsClaimModalOpen(true)}
              Icon={Plus}
            >
              Claim AirQo Device
            </ReusableButton>
            <ReusableButton
              variant="outlined"
              onClick={() => setIsImportModalOpen(true)}
              Icon={Upload}
            >
              Import Existing Device
            </ReusableButton>
          </div>
        </div>
      )}

      <div className="mb-3">
        <Accordion type="multiple" defaultValue={['stats', 'visibility']} className="space-y-4">
          <AccordionItem value="stats" className="bg-white dark:bg-transparent border border-gray-200 dark:border-gray-600 rounded-lg px-6">
            <AccordionTrigger className="hover:no-underline py-4">
              <h2 className="text-xl">Device Health</h2>
            </AccordionTrigger>
            <AccordionContent className="pb-6 pt-2">
              <DashboardStatsCards />
            </AccordionContent>
          </AccordionItem>

          {userContext === 'external-org' && (
            <AccordionItem value="visibility" className="bg-white dark:bg-transparent border border-gray-200 dark:border-gray-600 rounded-lg px-6">
              <AccordionTrigger className="hover:no-underline py-4">
                <h2 className="text-xl">Device Visibility</h2>
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                <NetworkVisibilityCard />
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>

      <ClaimDeviceModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
      />
      <ImportDeviceModal
        open={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
      />
    </div>
  );
};

export default WelcomePage;