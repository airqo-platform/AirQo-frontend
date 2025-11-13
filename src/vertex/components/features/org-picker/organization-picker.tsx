"use client";

import React, { useState, useMemo } from "react";
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
import { useRouter } from "next/navigation";

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
  const userContext = useAppSelector((state) => state.user.userContext);
  const isContextLoading = useAppSelector((state) => state.user.isContextLoading);
  const isAirQoStaff = useAppSelector((state) => state.user.isAirQoStaff);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isPersonalContext } = useUserContext();

  const validUserGroups = useMemo(() => {
    if (!Array.isArray(userGroups)) return [];

    const filteredGroups = userGroups.filter(
      (group): group is Group => !!(group && group._id && group.grp_title)
    );

    if (!isAirQoStaff) {
      return filteredGroups.filter(
        (group) => group.grp_title.toLowerCase() !== "airqo"
      );
    }
    return filteredGroups;
  }, [userGroups, isAirQoStaff]);

  const handleOrganizationChange = async (group: Group | "private") => {
    dispatch(setOrganizationSwitching({ 
      isSwitching: true, 
      switchingTo: group === "private" ? "Private Mode" : group.grp_title 
    }));

    let newContext: UserContext;
    if (group === "private") {
      newContext = "personal";
    } else {
      newContext =
        group.grp_title.toLowerCase() === "airqo"
          ? "airqo-internal"
          : "external-org";
    }

    if (newContext === "airqo-internal" && !isAirQoStaff) {
      dispatch(setOrganizationSwitching({ isSwitching: false, switchingTo: "" }));
      return;
    }

    try {
      await queryClient.cancelQueries();
      await queryClient.invalidateQueries();

      if (group === "private") {
        dispatch(setActiveGroup(null));
        dispatch(setUserContext("personal"));
      } else {
        if (group.grp_title.toLowerCase() === "airqo") {
          dispatch(setActiveGroup(group));
          dispatch(setUserContext("airqo-internal"));
        } else {
          dispatch(setActiveGroup(group));
          dispatch(setUserContext("external-org"));
        }
      }

      setIsModalOpen(false);
      
      // Navigate to home after state is set
      router.push("/home");
    } catch (error) {
      console.error("Error switching organization:", error);
    } finally {
      setTimeout(() => {
        dispatch(setOrganizationSwitching({ isSwitching: false, switchingTo: "" }));
      }, 3000);
    }
  };

  const getDisplayTitle = () => {
    if (isPersonalContext) {
      return "PRIVATE MODE";
    }
    return formatTitle(activeGroup?.grp_title || "") || "Select Organization";
  };

  if (isContextLoading) {
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
        userContext={userContext}
        isAirQoStaff={isAirQoStaff}
        onOrganizationChange={handleOrganizationChange}
      />
    </>
  );
};

export default OrganizationPicker;
