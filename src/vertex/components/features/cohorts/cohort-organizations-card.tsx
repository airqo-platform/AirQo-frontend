"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Group } from "@/app/types/groups";
import { UnassignCohortFromGroupDialog } from "./unassign-cohort-from-group";

interface CohortOrganizationsCardProps {
  organizations: Group[];
  cohortId: string;
  cohortName: string;
  loading?: boolean;
  canUnassign?: boolean;
  onUnassignSuccess: () => void;
}

export function CohortOrganizationsCard({
  organizations,
  cohortId,
  cohortName,
  loading = false,
  canUnassign = false,
  onUnassignSuccess,
}: CohortOrganizationsCardProps) {
  const [selectedOrg, setSelectedOrg] = useState<Group | null>(null);
  const [showUnassignDialog, setShowUnassignDialog] = useState(false);

  const handleUnassignClick = (org: Group) => {
    setSelectedOrg(org);
    setShowUnassignDialog(true);
  };

  const handleUnassignSuccess = () => {
    setShowUnassignDialog(false);
    setSelectedOrg(null);
    onUnassignSuccess();
  };

  if (loading) {
    return (
      <Card className="w-full rounded-lg flex flex-col justify-between items-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full rounded-lg flex flex-col justify-between h-full">
        <div className="px-3 py-2 flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Assigned Organizations</h2>

          {organizations.length === 0 ? (
            <div className="text-base font-normal text-muted-foreground">
              No organizations assigned to this cohort.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {organizations.map((org) => (
                <div key={org._id}>
                  <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">
                    Organization Name
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-base font-normal">
                      {org.grp_title}
                    </div>
                    <Switch
                      checked={true}
                      onCheckedChange={() => handleUnassignClick(org)}
                      disabled={!canUnassign}
                      className="data-[state=checked]:bg-red-600"
                    />
                  </div>
                  <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1 mt-3">
                    Country
                  </div>
                  <div className="text-base font-normal text-muted-foreground">
                    {org.grp_country || "-"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <UnassignCohortFromGroupDialog
        open={showUnassignDialog}
        onOpenChange={setShowUnassignDialog}
        organization={selectedOrg}
        cohortId={cohortId}
        cohortName={cohortName}
        onSuccess={handleUnassignSuccess}
      />
    </>
  );
}