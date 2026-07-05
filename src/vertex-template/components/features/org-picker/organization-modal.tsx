"use client";

import React, { useState, useMemo, useEffect } from "react";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import { Input } from "@/components/ui/input";
import { AqSearchRefraction } from '@airqo/icons-react';
import type { Group } from "@/app/types/users";
import ReusableButton from "@/components/shared/button/ReusableButton";
import { vertexConfig } from '@/vertex.config';

interface OrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userGroups?: Group[];
  activeGroup: Group | null;
  onOrganizationChange: (group: Group) => void;
}

const formatTitle = (title: string) => {
  if (!title) return "";
  return title
    .replace(/[_-]/g, " ")
    .toUpperCase();
};

const OrganizationModal: React.FC<OrganizationModalProps> = ({
  isOpen,
  onClose,
  userGroups,
  activeGroup,
  onOrganizationChange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [recentGroups, setRecentGroups] = useState<Group[]>([]);

  useEffect(() => {
    const storedRecents = localStorage.getItem("recentOrganizations");
    let recentIds: string[] = storedRecents ? JSON.parse(storedRecents) : [];

    const allUserGroups = userGroups || [];

    if (activeGroup) {
      recentIds = recentIds.filter(id => id !== activeGroup._id);
      recentIds.unshift(activeGroup._id);
    }

    const groupMap = new Map(allUserGroups.map(g => [g._id, g]));

    const recents = recentIds
      .map(id => groupMap.get(id))
      .filter((g): g is Group => g !== undefined);

    setRecentGroups(recents);
  }, [userGroups, isOpen, activeGroup]);

  const updateRecents = (group: Group) => {
    const updatedRecents = [group._id, ...recentGroups.map(g => g._id).filter(id => id !== group._id)].slice(0, 5);
    localStorage.setItem("recentOrganizations", JSON.stringify(updatedRecents));
  }

  const handleSelection = (group: Group) => {
    updateRecents(group);
    onOrganizationChange(group);
  }

  const filteredGroups = useMemo(() => {
    if (!Array.isArray(userGroups)) {
      return [];
    }

    const groups = userGroups.filter((group) =>
      group.grp_title &&
      group.grp_title.toLowerCase().includes(searchTerm?.toLowerCase() || '')
    );

    return groups;
  }, [userGroups, searchTerm]);

  // The "request organization" flow lives on the external analytics platform;
  // without a configured URL there is nowhere to send the user.
  const requestOrgUrl = vertexConfig.links.analyticsUrl
    ? `${vertexConfig.links.analyticsUrl.replace(/\/$/, '')}/request-organization`
    : null;

  const handleCreateNew = () => {
    if (!requestOrgUrl) return;
    window.open(requestOrgUrl, '_blank', 'noopener,noreferrer');
    onClose();
  }


  const OrganizationItem = ({ group }: { group: Group }) => {
    const isActive = activeGroup?._id === group._id;

    return (
      <div
        onClick={() => handleSelection(group)}
        className={`flex items-center justify-between p-2 hover:bg-accent dark:hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors duration-200 ${isActive && "border border-primary/30 bg-primary/5 dark:bg-primary/20 dark:border-primary/50"}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center uppercase text-sm font-medium text-primary dark:text-primary">
            {group.grp_title.charAt(0)}
          </div>
          <div>
            <p className="font-medium uppercase text-sm text-foreground">{formatTitle(group.grp_title)}</p>
          </div>
        </div>
        {isActive && <div className="bg-primary dark:bg-primary h-2 w-2 rounded-full shadow-sm" />}
      </div>
    );
  };

  const renderOrganizationList = (groups: Group[]) => {
    return (
      <div className="space-y-1 py-2">
        {groups.length > 0 ? (
          groups.map((group) => <OrganizationItem key={group._id} group={group} />)
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No organizations found.
          </p>
        )}
      </div>
    );
  };

  return (
    <ReusableDialog
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      zIndex={2000}
      title="Organizations"
      subtitle={`${filteredGroups.length} of ${userGroups?.length || 0} available`}
      maxHeight="max-h-[55vh]"
      contentClassName="flex flex-col"
      contentAreaClassName="p-0 flex flex-col flex-1 min-h-0"
      customFooter={
        <div className="flex items-center justify-end gap-3 w-full px-4 py-4 border-t border-gray-200 dark:border-gray-700">
          <ReusableButton onClick={onClose} variant="outlined">
            Close
          </ReusableButton>
          {requestOrgUrl && (
            <ReusableButton onClick={handleCreateNew}>
              Request New Organization
            </ReusableButton>
          )}
        </div>
      }
    >
      <div className="px-4 py-4 flex-shrink-0">
        <div className="relative w-full">
          <AqSearchRefraction className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search organizations..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="px-4 flex-1 min-h-0 overflow-y-auto">
        {renderOrganizationList(filteredGroups)}
      </div>
    </ReusableDialog>
  );
};

export default OrganizationModal;