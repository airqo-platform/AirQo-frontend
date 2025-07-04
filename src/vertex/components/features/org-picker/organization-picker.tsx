"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/core/redux/hooks";
import { setActiveGroup } from "@/core/redux/slices/userSlice";
import type { Group } from "@/app/types/users";
import OrganizationModal from "./organization-modal";

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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOrganizationChange = (group: Group) => {
    dispatch(setActiveGroup(group));
    localStorage.setItem("activeGroup", JSON.stringify(group));
    setIsModalOpen(false); // Close modal on selection
  };

  return (
    <>
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={() => setIsModalOpen(true)}
      >
        <Building2 size={16} className="text-muted-foreground" />
        <span className="truncate">
          {formatTitle(activeGroup?.grp_title || "") || "Select Organization"}
        </span>
      </Button>

      <OrganizationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userGroups={userGroups}
        activeGroup={activeGroup}
        onOrganizationChange={handleOrganizationChange}
      />
    </>
  );
};

export default OrganizationPicker; 