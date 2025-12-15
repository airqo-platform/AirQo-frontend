"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { CustomDialogContent } from "@/components/ui/custom-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AqPlus, AqSearchMd } from '@airqo/icons-react';
import type { Group } from "@/app/types/users";

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

  const handleCreateNew = () => {
    const baseUrl = process.env.NEXT_PUBLIC_ANALYTICS_URL || 'https://analytics.airqo.net';
    const url = `${baseUrl.replace(/\/$/, '')}/request-organization`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  }


  const OrganizationItem = ({ group }: { group: Group }) => {
    const isActive = activeGroup?._id === group._id;

    return (
      <div
        onClick={() => handleSelection(group)}
        className={`flex items-center justify-between p-3 hover:bg-accent rounded-xl cursor-pointer ${isActive && "border border-blue-200 bg-blue-50/50"}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center uppercase text-sm">
            {group.grp_title.charAt(0)}
          </div>
          <div>
            <p className="font-medium uppercase text-sm">{formatTitle(group.grp_title)}</p>
          </div>
        </div>
        {isActive && <div className="bg-blue-600 h-2 w-2 rounded-full" />}
      </div>
    );
  };

  const renderOrganizationList = (groups: Group[]) => {
    return (
      <div className="space-y-1 py-2">
        {groups.length > 0 && (
          <div className="px-1 mb-2 mt-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              Available Organizations
            </h3>
          </div>
        )}
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <CustomDialogContent className="max-w-3xl h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-2 flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <span>Organizations</span>

            <div className="flex items-center gap-2">
              <Button onClick={handleCreateNew} className="text-xs"><AqPlus size={48} /> Request New Organization</Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 pb-2 border-b flex-shrink-0">
          <div className="relative w-full">
            <AqSearchMd className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search organizations by name"
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-grow flex flex-col min-h-0 px-6 max-h-[450px] overflow-y-auto">
          {renderOrganizationList(filteredGroups)}
        </div>
        <DialogFooter className="p-4 border-t flex-shrink-0">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </CustomDialogContent>
    </Dialog>
  );
};

export default OrganizationModal;