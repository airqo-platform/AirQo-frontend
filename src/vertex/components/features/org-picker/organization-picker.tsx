"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Building2, User } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/core/redux/hooks";
import { setActiveGroup, setUserContext } from "@/core/redux/slices/userSlice";
import type { Group } from "@/app/types/users";
import OrganizationModal from "./organization-modal";
import { useUserContext } from "@/core/hooks/useUserContext";
import { UserContext } from "@/core/redux/slices/userSlice";

const formatTitle = (title: string) => {
  if (!title) return "";
  return title
    .replace(/[_-]/g, " ")
    .toUpperCase();
};

const OrganizationPicker: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeGroup = useAppSelector((state) => state.user.activeGroup);
  const userGroups = useAppSelector((state) => state.user.userGroups);
  const userContext = useAppSelector((state) => state.user.userContext);
  const isAirQoStaff = useAppSelector((state) => state.user.isAirQoStaff);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isPersonalContext } = useUserContext();

  const handleOrganizationChange = (group: Group | 'private') => {
    // Validate context change before allowing it
    let newContext: UserContext;
    if (group === 'private') {
      newContext = 'personal';
    } else {
      newContext = group.grp_title.toLowerCase() === 'airqo' ? 'airqo-internal' : 'external-org';
    }
    
    // Validate context change
    if (newContext === 'airqo-internal' && !isAirQoStaff) {
      // Non-staff users cannot access AirQo internal context
      console.error('Unauthorized context change attempt: non-staff user trying to access airqo-internal');
      return;
    }
    
    if (group === 'private') {
      // Set to private mode - keep AirQo as active group but set context to personal
      const airqoGroup = userGroups.find(g => g.grp_title.toLowerCase() === 'airqo');
      if (airqoGroup) {
        dispatch(setActiveGroup(airqoGroup));
        dispatch(setUserContext('personal'));
        localStorage.setItem("activeGroup", JSON.stringify(airqoGroup));
        localStorage.setItem("userContext", 'personal');
      } else {
        // If no AirQo group found, still set context to personal
        dispatch(setUserContext('personal'));
        localStorage.setItem("userContext", 'personal');
      }
    } else {
      // Set to organization mode
      dispatch(setActiveGroup(group));
      // Determine context based on organization
      if (group.grp_title.toLowerCase() === 'airqo') {
        dispatch(setUserContext('airqo-internal'));
        localStorage.setItem("userContext", 'airqo-internal');
      } else {
        dispatch(setUserContext('external-org'));
        localStorage.setItem("userContext", 'external-org');
      }
      localStorage.setItem("activeGroup", JSON.stringify(group));
    }
    setIsModalOpen(false);
  };

  const getDisplayTitle = () => {
    if (isPersonalContext) {
      return "Private Mode";
    }
    return formatTitle(activeGroup?.grp_title || "") || "Select Organization";
  };

  const getDisplayIcon = () => {
    if (isPersonalContext) {
      return <User size={16} className="text-blue-600" />;
    }
    return <Building2 size={16} className="text-muted-foreground" />;
  };

  return (
    <>
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={() => setIsModalOpen(true)}
      >
        {getDisplayIcon()}
        <span className="truncate">
          {getDisplayTitle()}
        </span>
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