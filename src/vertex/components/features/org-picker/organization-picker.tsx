"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAppSelector, useAppDispatch } from "@/core/redux/hooks";
import { setActiveGroup, setUserContext, setOrganizationSwitching } from "@/core/redux/slices/userSlice";
import type { Group } from "@/app/types/users";
import OrganizationModal from "./organization-modal";
import { useUserContext } from "@/core/hooks/useUserContext";
import { UserContext } from "@/core/redux/slices/userSlice";
import { AqGrid01 } from "@airqo/icons-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter, usePathname } from "next/navigation";
import ReusableToast from "@/components/shared/toast/ReusableToast";

const formatTitle = (title: string) => {
  if (!title) return "";
  return title.replace(/[_-]/g, " ").toUpperCase();
};

const OrganizationPicker: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();
  const activeGroup = useAppSelector((state) => state.user.activeGroup);
  const userGroups = useAppSelector((state) => state.user.userGroups);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isLoading } = useUserContext();
  const { isSwitching } = useAppSelector((state) => state.user.organizationSwitching);
  const pathname = usePathname();
  const lastPathname = useRef(pathname);

  // Clear isSwitching when navigation completes (pathname changes)
  useEffect(() => {
    if (isSwitching && pathname !== lastPathname.current) {
      dispatch(setOrganizationSwitching({ isSwitching: false, switchingTo: "" }));
    }
    lastPathname.current = pathname;
  }, [pathname, isSwitching, dispatch]);

  const validUserGroups = useMemo(() => {
    if (!Array.isArray(userGroups)) return [];

    return userGroups.filter(
      (group): group is Group => !!(group && group._id && group.grp_title)
    );
  }, [userGroups]);

  const handleOrganizationChange = async (group: Group) => {
    // 1. Instant UI Feedback
    setIsModalOpen(false);

    // 2. Start Background Transition
    dispatch(setOrganizationSwitching({
      isSwitching: true,
      switchingTo: group.grp_title
    }));

    const newContext: UserContext =
      group.grp_title.toLowerCase() === "airqo"
        ? "personal"
        : "external-org";

    try {
      // 3. Optimized Background Cleanup (Non-blocking)
      // We don't await these to prevent UI blocking
      const orgScopedQueryKeys = [
        ["devices"],
        ["myDevices"],
        ["sites"],
        ["site-details"],
        ["cohorts"],
        ["user-cohorts"],
        ["cohort-details"],
        ["claimedDevices"],
        ["deviceActivities"],
        ["deviceCount"],
        ["network-devices"],
        ["groupCohorts"],
        ["network-requests"],
      ] as const;

      orgScopedQueryKeys.forEach((queryKey) => {
        void queryClient.cancelQueries({ queryKey });
        queryClient.removeQueries({ queryKey });
      });

      // 4. Update Redux State
      dispatch(setActiveGroup(group));
      dispatch(setUserContext(newContext));

      // 5. Trigger Navigation
      if (pathname === "/home") {
        // If already on home, we must clear immediately as pathname won't change
        dispatch(setOrganizationSwitching({ isSwitching: false, switchingTo: "" }));
        router.refresh();
      } else {
        router.push("/home");
      }
    } catch {
      ReusableToast({ message: "Failed to switch organization", type: "ERROR" });
      dispatch(setOrganizationSwitching({ isSwitching: false, switchingTo: "" }));
    }
  };

  const getDisplayTitle = () => {
    return formatTitle(activeGroup?.grp_title || "") || "Select Organization";
  };

  if (isLoading) {
    return <Skeleton className="h-10 w-48 rounded-lg" />;
  }

  return (
    <>
      <Button
        variant="outline"
        className={`flex items-center gap-0.5 space-x-2 rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-primary/30 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-primary/10 dark:focus:ring-primary/70 dark:focus:ring-offset-gray-800 transition-colors duration-200`}
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary dark:bg-primary/20 dark:text-primary">
          {getDisplayTitle()?.charAt(0)?.toUpperCase() || "O"}
        </div>
        <span className="max-w-32 truncate">{getDisplayTitle()}</span>
        <AqGrid01 className="h-4 w-4" />
      </Button>

      <OrganizationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userGroups={validUserGroups}
        activeGroup={activeGroup}
        onOrganizationChange={handleOrganizationChange}
      />
    </>
  );
};

export default OrganizationPicker;
