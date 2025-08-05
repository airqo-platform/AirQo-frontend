"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAppSelector, useAppDispatch } from "@/core/redux/hooks";
import { setActiveGroup, setUserContext } from "@/core/redux/slices/userSlice";
import type { Group } from "@/app/types/users";
import OrganizationModal from "./organization-modal";
import { useUserContext } from "@/core/hooks/useUserContext";
import { UserContext } from "@/core/redux/slices/userSlice";
import { AqGrid01 } from "@airqo/icons-react";

const formatTitle = (title: string) => {
  if (!title) return "";
  return title.replace(/[_-]/g, " ").toUpperCase();
};

const OrganizationPicker: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeGroup = useAppSelector((state) => state.user.activeGroup);
  const userGroups = useAppSelector((state) => state.user.userGroups);
  const userContext = useAppSelector((state) => state.user.userContext);
  const isAirQoStaff = useAppSelector((state) => state.user.isAirQoStaff);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isPersonalContext } = useUserContext();

  const handleOrganizationChange = (group: Group | "private") => {
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
      // Non-staff users cannot access AirQo internal context
      console.error(
        "Unauthorized context change attempt: non-staff user trying to access airqo-internal"
      );
      return;
    }

    if (group === "private") {
      // Set to private mode - keep AirQo as active group but set context to personal
      const airqoGroup = userGroups.find(
        (g) => g.grp_title.toLowerCase() === "airqo"
      );
      if (airqoGroup) {
        dispatch(setActiveGroup(airqoGroup));
        dispatch(setUserContext("personal"));
        localStorage.setItem("activeGroup", JSON.stringify(airqoGroup));
        localStorage.setItem("userContext", "personal");
      } else {
        // If no AirQo group found, still set context to personal
        dispatch(setUserContext("personal"));
        localStorage.setItem("userContext", "personal");
      }
    } else {
      // Set to organization mode
      dispatch(setActiveGroup(group));
      // Determine context based on organization
      if (group.grp_title.toLowerCase() === "airqo") {
        dispatch(setUserContext("airqo-internal"));
        localStorage.setItem("userContext", "airqo-internal");
      } else {
        dispatch(setUserContext("external-org"));
        localStorage.setItem("userContext", "external-org");
      }
      localStorage.setItem("activeGroup", JSON.stringify(group));
    }
    setIsModalOpen(false);
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
