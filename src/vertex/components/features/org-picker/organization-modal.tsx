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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Check, MoreVertical } from "lucide-react";
import type { Group } from "@/app/types/users";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface OrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userGroups: Group[];
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
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [recentGroups, setRecentGroups] = useState<Group[]>([]);

  useEffect(() => {
    const storedRecents = localStorage.getItem("recentOrganizations");
    let recentIds: string[] = storedRecents ? JSON.parse(storedRecents) : [];

    if (activeGroup) {
      recentIds = recentIds.filter(id => id !== activeGroup._id);
      recentIds.unshift(activeGroup._id);
    }

    const groupMap = new Map(userGroups.map(g => [g._id, g]));
    
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
    return userGroups.filter((group) =>
        group.grp_title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [userGroups, searchTerm]);

  const handleCreateNew = () => {
    router.push('/organizations/create');
    onClose();
  }

  const OrganizationItem = ({ group }: { group: Group }) => (
    <div
      onClick={() => handleSelection(group)}
      className="flex items-center justify-between p-3 hover:bg-accent rounded-md cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold">{formatTitle(group.grp_title).charAt(0)}</span>
        </div>
        <div>
          <p className="font-medium">{formatTitle(group.grp_title)}</p>
          <p className="text-sm text-muted-foreground">ID: {group._id}</p>
        </div>
      </div>
      {activeGroup?._id === group._id && <Check size={16} className="text-primary" />}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <CustomDialogContent className="max-w-3xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0 flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <span>Organizations</span>
            <div className="flex items-center gap-2">
              <Button onClick={handleCreateNew}>New Organization</Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push('/organizations')}>
                    Manage Organizations
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/access-control')}>
                    Roles/Permissions
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 pb-2 border-b flex-shrink-0">
            <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search organizations by name" 
                    className="pl-10" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
        <Tabs defaultValue="recent" className="flex-grow flex flex-col min-h-0">
            <TabsList className="mx-6 justify-start flex-shrink-0">
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            <div className="flex-grow overflow-hidden">
                <TabsContent value="recent" className="h-full overflow-y-auto px-6">
                    <div className="space-y-1 py-2">
                        {recentGroups.length > 0 ? (
                            recentGroups.map((group) => <OrganizationItem key={group._id} group={group} />)
                        ) : (
                            <p className="text-muted-foreground text-center py-8">No recent organizations.</p>
                        )}
                    </div>
                </TabsContent>
                <TabsContent value="all" className="h-full overflow-y-auto px-6">
                    <div className="space-y-1 py-2">
                        {filteredGroups.length > 0 ? (
                            filteredGroups.map((group) => <OrganizationItem key={group._id} group={group} />)
                        ) : (
                            <p className="text-muted-foreground text-center py-8">No organizations found.</p>
                        )}
                    </div>
                </TabsContent>
            </div>
        </Tabs>
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