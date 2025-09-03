"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAppSelector, useAppDispatch } from "@/core/redux/hooks";
import { setActiveGroup, setUserContext, setOrganizationSwitching } from "@/core/redux/slices/userSlice";
import type { Group } from "@/app/types/users";
import OrganizationModal from "./organization-modal";
import { useUserContext } from "@/core/hooks/useUserContext";
import { UserContext } from "@/core/redux/slices/userSlice";
import { AqGrid01 } from "@airqo/icons-react";
import { useRouter } from "next/navigation";

const formatTitle = (title: string) => {
  if (!title) return "";
  return title.replace(/[_-]/g, " ").toUpperCase();
};

const OrganizationPicker: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const activeGroup = useAppSelector((state) => state.user.activeGroup);
  const userGroups = useAppSelector((state) => state.user.userGroups);
  const userContext = useAppSelector((state) => state.user.userContext);
  const isAirQoStaff = useAppSelector((state) => state.user.isAirQoStaff);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isPersonalContext } = useUserContext();

  const handleOrganizationChange = async (group: Group | "private") => {
    // Dispatch global loading state to Redux
    dispatch(setOrganizationSwitching({ 
      isSwitching: true, 
      switchingTo: group === "private" ? "Private Mode" : group.grp_title 
    }));

    // Validate context change before allowing it
    let newContext: UserContext;
    if (group === "private") {
      newContext = "personal";
    } else {
      newContext =
        group.grp_title.toLowerCase() === "airqo"
          ? "airqo-internal"
          : "external-org";
    }

    // Validate context change
    if (newContext === "airqo-internal" && !isAirQoStaff) {
      console.error("Unauthorized context change attempt");
      dispatch(setOrganizationSwitching({ isSwitching: false, switchingTo: "" }));
      return;
    }

    try {
      // Update Redux state immediately
      if (group === "private") {
        const airqoGroup = userGroups.find(
          (g) => g.grp_title.toLowerCase() === "airqo"
        );
        if (airqoGroup) {
          dispatch(setActiveGroup(airqoGroup));
          dispatch(setUserContext("personal"));
          localStorage.setItem("activeGroup", JSON.stringify(airqoGroup));
          localStorage.setItem("userContext", "personal");
        } else {
          dispatch(setUserContext("personal"));
          localStorage.setItem("userContext", "personal");
        }
      } else {
        dispatch(setActiveGroup(group));
        if (group.grp_title.toLowerCase() === "airqo") {
          dispatch(setUserContext("airqo-internal"));
          localStorage.setItem("userContext", "airqo-internal");
        } else {
          dispatch(setUserContext("external-org"));
          localStorage.setItem("userContext", "external-org");
        }
        localStorage.setItem("activeGroup", JSON.stringify(group));
      }

      router.replace("/");
      
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error switching organization:", error);
    } finally {
      // Clear loading state after a brief delay to ensure smooth transition
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
        userGroups={userGroups}
        activeGroup={activeGroup}
        userContext={userContext}
        isAirQoStaff={isAirQoStaff}
        onOrganizationChange={handleOrganizationChange}
      />
    </>
  );
};

export default OrganizationPicker;
