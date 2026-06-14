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
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useDevices, useMyDevices } from "@/core/hooks/useDevices";
import { useGroupCohorts, usePersonalUserCohorts } from "@/core/hooks/useCohorts";
import { useQueryClient } from "@tanstack/react-query";
import ContextHeader from "@/components/features/home/context-header";
import NetworkVisibilityCard from "@/components/features/home/network-visibility-card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import OnboardingChecklistWrapper from "@/components/onboarding-checklist";
import { cn } from "@/lib/utils";
import { Device } from "@/app/types/devices";
import { useGroupDetails } from "@/core/hooks/useGroups";
import { useOnboarding } from "@/core/hooks/useOnboarding";
import ReusableToast from "@/components/shared/toast/ReusableToast";

// ─── Removed Checklist localStorage helpers ──────────────────────────────────

// ─── Skeletons ────────────────────────────────────────────────────────────────

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

// ─── Lazy-loaded heavy components ─────────────────────────────────────────────

const DashboardStatsCards = dynamic(
  () => import("@/components/features/dashboard/stats-cards").then((mod) => ({
    default: mod.DashboardStatsCards,
  })),
  { ssr: false, loading: () => <StatsSkeleton /> }
);

const ClaimDeviceModal = dynamic(
  () => import("@/components/features/claim/claim-device-modal"),
  { ssr: false }
);

const ImportDeviceModal = dynamic(
  () => import("@/components/features/devices/import-device-modal"),
  { ssr: false }
);

const AssignCohortDevicesDialog = dynamic(
  () => import("@/components/features/cohorts/assign-cohort-devices").then(mod => ({ default: mod.AssignCohortDevicesDialog })),
  { ssr: false }
);

const LoginFeedbackToast = dynamic(
  () => import("@/components/features/feedback/login-feedback-toast"),
  { ssr: false }
);

// ─── Page component ───────────────────────────────────────────────────────────

const WelcomePage = () => {
  const { data: session } = useSession();
  const {
    userContext,
    userScope,
    hasError,
    error,
    isLoading: isLoadingUserContext,
  } = useUserContext();

  const [isClaimModalOpen, setIsClaimModalOpen] = React.useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
  const [justCompletedClaim, setJustCompletedClaim] = React.useState(false);
  const [isAddDeviceChoiceOpen, setIsAddDeviceChoiceOpen] = React.useState(false);
  const [isAssignCohortModalOpen, setIsAssignCohortModalOpen] = React.useState(false);
  const [newlyClaimedDevice, setNewlyClaimedDevice] = React.useState<Pick<Device, "_id" | "name" | "long_name">[] | undefined
  >();
  const [accordionItems, setAccordionItems] = React.useState<string[]>(["stats", "visibility"]);
  const [highlightVisibility, setHighlightVisibility] = React.useState(false);
  const visibilityRef = React.useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const isMounted = React.useRef(true);

  React.useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const user = useAppSelector((state) => state.user.userDetails);
  const userId = (session?.user as { id?: string })?.id || user?._id;

  // Stable key per workspace — personal users get their own key, org users get their
  // actual group ID so switching Kampala ↔ Wakiso gives independent checklist state.
  const activeGroup = useAppSelector((state) => state.user.activeGroup);
  const orgId = userContext === "personal"
    ? `personal_${userId}`
    : activeGroup?._id
    ? `org_${activeGroup._id}`
    : null;

  const { isLoading: isLoadingGroupDetails } = useGroupDetails(activeGroup?._id as string, {
    enabled: userScope === "organisation" && !!activeGroup?._id,
    staleTime: 5 * 60 * 1000,
  });

  const { activeChecklistState, updateChecklist } = useOnboarding();

  // ── Permissions ────────────────────────────────────────────────────────────
  const permissionsToCheck = [PERMISSIONS.DEVICE.UPDATE];
  const permissionsMap = usePermissions(permissionsToCheck);
  const canClaimDevice = permissionsMap[PERMISSIONS.DEVICE.UPDATE];

  // ── Device data ────────────────────────────────────────────────────────────
  const { devices: groupDevices, isLoading: isLoadingGroupDevices } = useDevices({
    limit: 1,
    enabled: userScope === "organisation",
  });

  const { data: myDevicesData, isLoading: isLoadingMyDevices } = useMyDevices(
    userId || "",
    undefined,
    { enabled: !!userId && userScope === "personal" }
  );

  // Cohort data — used to auto-detect step 2 completion
  const { data: groupCohortIds } = useGroupCohorts(activeGroup?._id, {
    enabled: userScope === "organisation" && !!activeGroup?._id,
  });
  const { data: personalCohortIds } = usePersonalUserCohorts(userId, {
    enabled: !!userId && userScope === "personal",
  });

  const autoSteps = React.useMemo(() => {
    if (!orgId) return [];
    
    const hasDevices =
      userScope === "personal"
        ? (myDevicesData?.devices ?? []).length > 0
        : groupDevices.length > 0;

    const hasCohorts =
      userScope === "personal"
        ? (personalCohortIds ?? []).length > 0
        : (groupCohortIds ?? []).length > 0;

    const steps: string[] = [];
    if (hasDevices) {
      steps.push("add-device", "assign-cohort");
    } else if (hasCohorts) {
      steps.push("assign-cohort");
    }
    return steps;
  }, [orgId, userScope, myDevicesData?.devices, groupDevices.length, personalCohortIds, groupCohortIds]);

  const visuallyCompletedSteps = React.useMemo(() => {
    return Array.from(new Set([...(activeChecklistState.completedSteps || []), ...autoSteps]));
  }, [activeChecklistState.completedSteps, autoSteps]);

  const TOTAL_STEPS = 3;
  const allStepsComplete = visuallyCompletedSteps.length >= TOTAL_STEPS;
  const isLoadingGroupDetailsSafe = userScope === "organisation" && isLoadingGroupDetails;
  const showChecklist = !allStepsComplete && !activeChecklistState.dismissed && !isLoadingGroupDetailsSafe && !activeChecklistState.isMissing;

  const openAddDeviceChoice = React.useCallback(() => {
    setIsAddDeviceChoiceOpen(true);
  }, []);

  const handleGoToVisibility = React.useCallback(() => {
    setAccordionItems(prev =>
      prev.includes("visibility") ? prev : [...prev, "visibility"]
    );

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        visibilityRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        setHighlightVisibility(true);
        setTimeout(() => setHighlightVisibility(false), 4000); // longer — matches coach mark
      });
    });
  }, []);

  const openClaimModal = React.useCallback(() => {
    if (justCompletedClaim) return;
    setIsAddDeviceChoiceOpen(false);
    setIsClaimModalOpen(true);
  }, [justCompletedClaim]);

  const openImportModal = React.useCallback(() => {
    setIsAddDeviceChoiceOpen(false);
    setIsImportModalOpen(true);
  }, []);

  const refreshHomeData = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["devices"] });
    queryClient.invalidateQueries({ queryKey: ["myDevices"] });
    queryClient.invalidateQueries({ queryKey: ["groupCohorts"] });
    queryClient.invalidateQueries({ queryKey: ["personalUserCohorts"] });
    queryClient.invalidateQueries({ queryKey: ["cohorts"] });
    queryClient.invalidateQueries({ queryKey: ["deviceCount"] });
  }, [queryClient]);

  const handleDeviceAdded = React.useCallback(
    (deviceInfo?: { deviceId?: string; deviceName?: string; cohortId?: string; isCohortImport?: boolean }) => {
      setJustCompletedClaim(true);
      setTimeout(() => setJustCompletedClaim(false), 1000);
      refreshHomeData();

      if (deviceInfo?.isCohortImport || deviceInfo?.cohortId) {
        setNewlyClaimedDevice(undefined);
        updateChecklist({
          action: 'mark_step_complete',
          step_id: 'add-device',
        });
      } else {
        if (deviceInfo?.deviceId) {
          setNewlyClaimedDevice([{ _id: deviceInfo.deviceId, name: deviceInfo.deviceName || "", long_name: deviceInfo.deviceName || "" }]);
        }
        updateChecklist({
          action: 'mark_step_complete',
          step_id: 'add-device',
        });
      }
    },
    [refreshHomeData, updateChecklist]
  );

  const handleCohortAssigned = React.useCallback(() => {
    updateChecklist({
      action: 'mark_step_complete',
      step_id: 'assign-cohort',
    });
    setNewlyClaimedDevice(undefined);
  }, [updateChecklist]);




  // ── Early returns ──────────────────────────────────────────────────────────

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

  // ── Derived state ──────────────────────────────────────────────────────────

  const hasNoDevices =
    userScope === "personal"
      ? (myDevicesData?.devices ?? []).length === 0
      : groupDevices.length === 0;



  const showClaimDevice = (() => {
    switch (userContext) {
      case "personal":
      case "external-org":
      default:
        return true;
    }
  })();

  const renderSharedModals = () => (
    <>
      <AssignCohortDevicesDialog
        open={isAssignCohortModalOpen && showChecklist}
        onOpenChange={(open) => {
          setIsAssignCohortModalOpen(open);
          if (!open) setNewlyClaimedDevice(undefined);
        }}
        selectedDevices={newlyClaimedDevice as Device[]}
        onSuccess={handleCohortAssigned}
        title="Group your devices"
      />

      <ClaimDeviceModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        onSuccess={handleDeviceAdded}
        mode={showChecklist ? "guided" : "fast"}
      />
      <ImportDeviceModal
        open={isImportModalOpen}
        onOpenChange={open => setIsImportModalOpen(open)}
        onSuccess={handleDeviceAdded}
        mode={showChecklist ? "guided" : "fast"}
      />
      <ReusableDialog
        isOpen={isAddDeviceChoiceOpen}
        onClose={() => setIsAddDeviceChoiceOpen(false)}
        title="Add a device"
        showFooter={false}
        size="xl"
      >
        <div className="flex flex-col gap-4 py-4">
          <button
            onClick={openClaimModal}
            className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-medium text-gray-900 dark:text-white">
                Add AirQo Device
              </span>
              <span className="block text-sm text-gray-500 dark:text-gray-400">
                Have an AirQo sensor? Easily add it to your workspace
              </span>
            </div>
          </button>

          <button
            onClick={openImportModal}
            className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-medium text-gray-900 dark:text-white">
                Import Different Sensor Manufacturer
              </span>
              <span className="block text-sm text-gray-500 dark:text-gray-400">
                Import a device from a different manufacturer using a CSV
                template.
              </span>
            </div>
          </button>
        </div>
      </ReusableDialog>
    </>
  );

  const isLoading =
    (userScope === "personal" && isLoadingMyDevices) ||
    (userScope === "organisation" && isLoadingGroupDevices) ||
    isLoadingUserContext;

  if (isLoading) {
    return (
      <>
        <div>
          <div className="mb-8 relative overflow-hidden md:px-16 md:py-10 rounded-lg mx-auto bg-white dark:bg-gray-800 border p-8">
            <div className="space-y-3">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          </div>
          <div className="mb-10">
            <StatsSkeleton />
          </div>
          <div className="mb-10">
            <Skeleton className="h-7 w-32 mb-4" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </div>
        {renderSharedModals()}
      </>
    );
  }

  const renderMainContent = () => {
    if (hasNoDevices) {
      return (
        <div className="flex-1">
          <ContextHeader />
          <OnboardingChecklistWrapper
            autoCompletedSteps={autoSteps}
            onAddDevice={openAddDeviceChoice}
            onGoToCohorts={() => setIsAssignCohortModalOpen(true)}
            onGoToVisibility={handleGoToVisibility}
            canClaimDevice={canClaimDevice}
            isLoadingGroupDetailsSafe={isLoadingGroupDetailsSafe}
          />
        </div>
      );
    }

    return (
      <div className="mb-6 flex-1">
        <ContextHeader />

        <OnboardingChecklistWrapper
          autoCompletedSteps={autoSteps}
          onAddDevice={openAddDeviceChoice}
          onGoToCohorts={() => setIsAssignCohortModalOpen(true)}
          onGoToVisibility={handleGoToVisibility}
          canClaimDevice={canClaimDevice}
          isLoadingGroupDetailsSafe={isLoadingGroupDetailsSafe}
        />

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
                Add AirQo Device
              </ReusableButton>
              <ReusableButton
                variant="outlined"
                onClick={() => setIsImportModalOpen(true)}
                Icon={Upload}
              >
                Import External Device
              </ReusableButton>
            </div>
          </div>
        )}

        <div className="pb-6">
          <Accordion
            type="multiple"
            value={accordionItems}
            onValueChange={setAccordionItems}
            className="flex flex-col gap-6"
          >
            <AccordionItem
              value="stats"
              className="bg-white dark:bg-transparent border border-gray-200 dark:border-gray-600 rounded-lg px-6 overflow-visible"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <h2 className="text-xl">Device Health</h2>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-6 border-t border-gray-100 dark:border-gray-700 mt-2">
                <DashboardStatsCards />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="visibility"
              ref={visibilityRef}
              className={cn(
                "bg-white dark:bg-transparent border border-gray-200 dark:border-gray-600 rounded-lg px-6 overflow-visible",
                highlightVisibility
                  ? "border-blue-400 dark:border-blue-500 ring-2 ring-blue-300 dark:ring-blue-600 ring-offset-2"
                  : "border-gray-200 dark:border-gray-600"
              )}
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <h2 className="text-xl">Device Visibility</h2>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-6 border-t border-gray-100 dark:border-gray-700 mt-2">
                <NetworkVisibilityCard
                  showCoachMark={highlightVisibility}
                  onVisibilityChanged={() => {
                    const nextCompletedSteps = Array.from(
                      new Set([...visuallyCompletedSteps, "set-visibility"])
                    );
                    const justCompletedSetup =
                      !visuallyCompletedSteps.includes("set-visibility") &&
                      nextCompletedSteps.length >= TOTAL_STEPS;

                    updateChecklist({
                      action: 'mark_step_complete',
                      step_id: 'set-visibility',
                    });

                    if (justCompletedSetup) {
                      ReusableToast({
                        message: "Workspace setup complete. You're ready to monitor and manage your devices.",
                        type: "SUCCESS",
                      });
                      setTimeout(() => {
                        if (isMounted.current) {
                          updateChecklist({ action: 'dismiss_checklist' });
                        }
                      }, 2000);
                    }
                  }}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {userId && (user?.email || user?.userName) && (
          <LoginFeedbackToast
            userId={userId}
            email={(user?.email || user?.userName) as string}
          />
        )}
      </div>
    );
  };

  return (
    <>
      {renderMainContent()}
      {renderSharedModals()}
    </>
  );
};

export default WelcomePage;
