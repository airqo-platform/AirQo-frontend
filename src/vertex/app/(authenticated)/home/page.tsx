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
import { useDevices, useMyDevices } from "@/core/hooks/useDevices";
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

  const user = useAppSelector((state) => state.user.userDetails);
  const userId = (session?.user as { id?: string })?.id || user?._id;

  // Stable key per workspace — personal users get their own key, org users get org key.
  const orgId = userContext === "personal" ? `personal_${userId}` : userContext;

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

  // Checklist is only relevant when the workspace has no devices yet.
  // Once devices exist the user has completed step 1 — no need to show the guide.
  const showChecklist = hasNoDevices && !checklistState.dismissed;

  const showClaimDevice = (() => {
    switch (userContext) {
      case "personal":
      case "external-org":
      default:
        return true;
    }
  })();

  // ── Empty state (no devices) ───────────────────────────────────────────────
  // Checklist IS the empty state guidance — replaces the old HomeEmptyState.

  if (hasNoDevices) {
    return (
      <div>
        <ContextHeader />

        {showChecklist && (
          <OnboardingChecklist
            completedSteps={checklistState.completedSteps}
            onDismiss={() => updateChecklist({ dismissed: true })}
            onClaimDevice={() => setIsClaimModalOpen(true)}
            onImportDevice={() => setIsImportModalOpen(true)}
            onGoToCohorts={() => {
              window.location.href = "/cohorts";
            }}
          />
        )}

        <ClaimDeviceModal
          isOpen={isClaimModalOpen}
          onClose={() => setIsClaimModalOpen(false)}
        />
        <ImportDeviceModal
          open={isImportModalOpen}
          onOpenChange={(open) => setIsImportModalOpen(open)}
        />
      </div>
    );
  }

  // ── Main dashboard (has devices) ───────────────────────────────────────────
  // Checklist never renders here — showChecklist is false when hasNoDevices is false.

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

      <ClaimDeviceModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
      />
      <ImportDeviceModal
        open={isImportModalOpen}
        onOpenChange={(open) => setIsImportModalOpen(open)}
      />
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