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
import ContextHeader from "@/components/features/home/context-header";
import NetworkVisibilityCard from "@/components/features/home/network-visibility-card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import OnboardingChecklist from "@/components/features/home/onboarding-checklist";

// ─── Checklist localStorage helpers ──────────────────────────────────────────
// Keyed per org/user so state is independent across workspace switches.

function getChecklistKey(orgId: string) {
  return `vertex_onboarding_${orgId}`;
}

function getChecklistState(orgId: string): {
  completedSteps: string[];
  dismissed: boolean;
} {
  if (typeof window === "undefined") return { completedSteps: [], dismissed: false };
  try {
    const raw = window.localStorage.getItem(getChecklistKey(orgId));
    return raw ? JSON.parse(raw) : { completedSteps: [], dismissed: false };
  } catch {
    return { completedSteps: [], dismissed: false };
  }
}

function saveChecklistState(
  orgId: string,
  state: { completedSteps: string[]; dismissed: boolean }
) {
  try {
    window.localStorage.setItem(getChecklistKey(orgId), JSON.stringify(state));
  } catch {
    // localStorage unavailable — fail silently
  }
}

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
  const [isAddDeviceChoiceOpen, setIsAddDeviceChoiceOpen] = React.useState(false);
  const [isAssignCohortModalOpen, setIsAssignCohortModalOpen] = React.useState(false);
  const [newlyClaimedDevice, setNewlyClaimedDevice] = React.useState<any[] | undefined>();

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

  // ── Checklist state (frontend-only, localStorage-backed) ──────────────────
  const [checklistState, setChecklistState] = React.useState(() =>
    getChecklistState(orgId ?? "")
  );

  // Re-sync when the active workspace changes
  React.useEffect(() => {
    if (orgId) {
      setChecklistState(getChecklistState(orgId));
    }
  }, [orgId]);

  const updateChecklist = React.useCallback(
    (patch: Partial<{ completedSteps: string[]; dismissed: boolean }>) => {
      setChecklistState((prev) => {
        const next = { ...prev, ...patch };
        if (orgId) saveChecklistState(orgId, next);
        return next;
      });
    },
    [orgId]
  );

  const openAddDeviceChoice = React.useCallback(() => {
    setIsAddDeviceChoiceOpen(true);
  }, []);

  const openClaimModal = React.useCallback(() => {
    setIsAddDeviceChoiceOpen(false);
    setIsClaimModalOpen(true);
  }, []);

  const openImportModal = React.useCallback(() => {
    setIsAddDeviceChoiceOpen(false);
    setIsImportModalOpen(true);
  }, []);

  const handleDeviceAdded = React.useCallback(
    (deviceInfo?: { deviceId: string; deviceName: string; cohortId: string; isCohortImport?: boolean }) => {
      if (deviceInfo?.isCohortImport) {
        updateChecklist({
          completedSteps: Array.from(
            new Set([...(checklistState.completedSteps || []), "add-device", "assign-cohort"]),
          ),
        });
      } else {
        if (deviceInfo?.deviceId) {
          setNewlyClaimedDevice([{ _id: deviceInfo.deviceId, name: deviceInfo.deviceName, long_name: deviceInfo.deviceName }]);
        }
        updateChecklist({
          completedSteps: Array.from(
            new Set([...(checklistState.completedSteps || []), "add-device"]),
          ),
        });
      }
    },
    [checklistState.completedSteps, updateChecklist]
  );

  const handleCohortAssigned = React.useCallback(() => {
    updateChecklist({
      completedSteps: Array.from(
        new Set([...(checklistState.completedSteps || []), "assign-cohort"]),
      ),
    });
  }, [checklistState.completedSteps, updateChecklist]);

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

  // ── Auto-sync step completion from real data ─────────────────────────────
  // This ensures that if an org already has devices/cohorts when a user first
  // logs in, steps 1 and 2 are immediately shown as complete.
  React.useEffect(() => {
    if (!orgId) return;

    const hasDevices =
      userScope === "personal"
        ? (myDevicesData?.devices ?? []).length > 0
        : groupDevices.length > 0;

    const hasCohorts =
      userScope === "personal"
        ? (personalCohortIds ?? []).length > 0
        : (groupCohortIds ?? []).length > 0;

    const autoSteps: string[] = [];
    if (hasDevices) autoSteps.push("add-device");
    if (hasCohorts) autoSteps.push("assign-cohort");

    if (autoSteps.length === 0) return;

    setChecklistState((prev) => {
      const merged = Array.from(new Set([...(prev.completedSteps || []), ...autoSteps]));
      // Only save/re-render if something actually changed
      if (merged.length === (prev.completedSteps || []).length) return prev;
      const next = { ...prev, completedSteps: merged };
      saveChecklistState(orgId, next);
      return next;
    });
  }, [orgId, userScope, myDevicesData, groupDevices, personalCohortIds, groupCohortIds]);

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

  const isLoading =
    (userScope === "personal" && isLoadingMyDevices) ||
    (userScope === "organisation" && isLoadingGroupDevices) ||
    isLoadingUserContext;

  if (isLoading) {
    return (
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
    );
  }

  // ── Derived state ──────────────────────────────────────────────────────────

  const hasNoDevices =
    userScope === "personal"
      ? (myDevicesData?.devices ?? []).length === 0
      : groupDevices.length === 0;

  const TOTAL_STEPS = 3; // add-device, assign-cohort, set-visibility

  // The checklist stays visible as long as:
  //   1. Not all steps are complete, AND
  //   2. The user hasn't explicitly dismissed it
  const allStepsComplete = checklistState.completedSteps.length >= TOTAL_STEPS;
  const showChecklist = !allStepsComplete && !checklistState.dismissed;

  const showClaimDevice = (() => {
    switch (userContext) {
      case "personal":
      case "external-org":
      default:
        return true;
    }
  })();

  const sharedModals = (
    <>
      {showChecklist && (
        <AssignCohortDevicesDialog
          open={isAssignCohortModalOpen}
          onOpenChange={setIsAssignCohortModalOpen}
          selectedDevices={newlyClaimedDevice}
          onSuccess={handleCohortAssigned}
          title="Group your devices"
        />
      )}

      <ClaimDeviceModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        onSuccess={handleDeviceAdded}
        mode="guided"
      />
      <ImportDeviceModal
        open={isImportModalOpen}
        onOpenChange={open => setIsImportModalOpen(open)}
        onSuccess={handleDeviceAdded}
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
                Claim AirQo Device
              </span>
              <span className="block text-sm text-gray-500 dark:text-gray-400">
                Claim an existing AirQo device by entering its unique code.
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

  // ── Empty state (no devices) ───────────────────────────────────────────────

  if (hasNoDevices) {
    return (
      <div>
        <ContextHeader />

        {showChecklist && (
          <OnboardingChecklist
            completedSteps={checklistState.completedSteps}
            onDismiss={() => updateChecklist({ dismissed: true })}
            onAddDevice={openAddDeviceChoice}
            onGoToCohorts={() => setIsAssignCohortModalOpen(true)}
            onMarkAsDone={() => updateChecklist({ dismissed: true })}
          />
        )}

        {sharedModals}
      </div>
    );
  }

  // ── Main dashboard (has devices) ───────────────────────────────────────────

  return (
    <div>
      <ContextHeader />

      {showChecklist && (
        <OnboardingChecklist
          completedSteps={checklistState.completedSteps}
          onDismiss={() => updateChecklist({ dismissed: true })}
          onAddDevice={openAddDeviceChoice}
          onGoToCohorts={() => setIsAssignCohortModalOpen(true)}
        />
      )}

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
              Import External Device
            </ReusableButton>
          </div>
        </div>
      )}

      <div className="mb-3">
        <Accordion
          type="multiple"
          defaultValue={["stats", "visibility"]}
          className="space-y-4"
        >
          <AccordionItem
            value="stats"
            className="bg-white dark:bg-transparent border border-gray-200 dark:border-gray-600 rounded-lg px-6"
          >
            <AccordionTrigger className="hover:no-underline py-4">
              <h2 className="text-xl">Device Health</h2>
            </AccordionTrigger>
            <AccordionContent className="pb-6 pt-2">
              <DashboardStatsCards />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="visibility"
            className="bg-white dark:bg-transparent border border-gray-200 dark:border-gray-600 rounded-lg px-6"
          >
            <AccordionTrigger className="hover:no-underline py-4">
              <h2 className="text-xl">Device Visibility</h2>
            </AccordionTrigger>
            <AccordionContent className="pt-2">
              <NetworkVisibilityCard />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {sharedModals}

      {userId && (user?.email || user?.userName) && (
        <LoginFeedbackToast
          userId={userId}
          email={(user?.email || user?.userName) as string}
        />
      )}
    </div>
  );
};

export default WelcomePage;