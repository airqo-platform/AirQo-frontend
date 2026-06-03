import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Group } from "@/app/types/groups";
import { useGroupsByCohort } from "@/core/hooks/useGroups";
import { UnassignCohortFromGroupDialog } from "./unassign-cohort-from-group";
import ReusableButton from "@/components/shared/button/ReusableButton";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import ReusableTable, { TableColumn, TableItem } from "@/components/shared/table/ReusableTable";
import ReusableToast from "@/components/shared/toast/ReusableToast";
import { AqCopy01 } from "@airqo/icons-react";

interface CohortOrganizationsCardProps {
  cohortId: string;
  cohortName: string;
  canUnassign?: boolean;
}

export function CohortOrganizationsCard({
  cohortId,
  cohortName,
  canUnassign = false,
}: CohortOrganizationsCardProps) {
  const { groups: organizations, isLoading, refetch } = useGroupsByCohort(cohortId);
  
  const [selectedOrg, setSelectedOrg] = useState<Group | null>(null);
  const [showUnassignDialog, setShowUnassignDialog] = useState(false);
  const [showAllDialog, setShowAllDialog] = useState(false);

  const handleUnassignClick = (org: Group) => {
    setSelectedOrg(org);
    setShowUnassignDialog(true);
  };

  const handleUnassignSuccess = () => {
    setShowUnassignDialog(false);
    setSelectedOrg(null);
    refetch(); // Refetch the organizations assigned to the cohort
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    ReusableToast({ message: "Group ID copied to clipboard!", type: "SUCCESS" });
  };

  const tableData = useMemo(() => {
    return organizations.map((org) => ({ ...org, id: org._id }));
  }, [organizations]);

  const tableColumns: TableColumn<Group & { id: string }>[] = [
    {
      key: "grp_title",
      title: "Organization Name",
      render: (value, item) => <span className="font-medium">{item.grp_title}</span>,
      sortable: true,
    },
    {
      key: "_id",
      title: "Group ID",
      render: (value, item) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-muted-foreground">{item._id}</span>
          <ReusableButton
            variant="text"
            className="p-1 h-auto text-muted-foreground hover:text-primary"
            onClick={(e) => {
              e.stopPropagation();
              handleCopyId(item._id);
            }}
            Icon={AqCopy01}
            aria-label="Copy Group ID"
          />
        </div>
      ),
    },
    {
      key: "grp_country",
      title: "Country",
      render: (value, item) => item.grp_country || "-",
      sortable: true,
    },
    {
      key: "actions" as keyof (Group & { id: string }),
      title: "Unassign",
      render: (value, item) => (
        <Switch
          checked={true}
          onCheckedChange={() => handleUnassignClick(item)}
          disabled={!canUnassign}
          className="data-[state=checked]:bg-red-600"
          aria-label="Unassign from cohort"
        />
      ),
    },
  ];

  if (isLoading) {
    return (
      <Card className="w-full rounded-lg flex flex-col justify-between items-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </Card>
    );
  }

  const displayOrganizations = organizations.slice(0, 3);
  const hasMore = organizations.length > 3;

  return (
    <>
      <Card className="w-full rounded-lg flex flex-col justify-between h-full">
        <div className="px-3 py-2 flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Assigned Organizations</h2>

          {organizations.length === 0 ? (
            <div className="text-base font-normal text-muted-foreground pb-4">
              No organizations assigned to this cohort.
            </div>
          ) : (
            <div className="flex flex-col">
              {displayOrganizations.map((org) => (
                <div key={org._id} className="relative py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-2">
                      <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 leading-none">
                        {org.grp_title}
                      </h4>
                      
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">
                          Organization ID
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="font-mono select-all overflow-x-auto whitespace-nowrap scrollbar-hide max-w-[200px] text-gray-700 dark:text-gray-300">
                            {org._id}
                          </span>
                          <ReusableButton
                            variant="text"
                            onClick={() => handleCopyId(org._id)}
                            className="p-1 h-auto text-muted-foreground hover:text-primary"
                            Icon={AqCopy01}
                            aria-label="Copy Organization ID"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <ReusableButton
                        variant="outlined"
                        onClick={() => handleUnassignClick(org)}
                        disabled={!canUnassign}
                        className="text-xs px-2 py-1 text-red-600 border-red-200 hover:bg-red-500 dark:hover:bg-red-950 dark:border-red-900"
                      >
                        Unassign
                      </ReusableButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {hasMore && (
          <div className="border-t px-2 flex justify-end mt-2">
            <ReusableButton 
              variant="text" 
              className="p-1 text-xs m-1" 
              onClick={() => setShowAllDialog(true)}
            >
              View more organizations ({organizations.length - 3})
            </ReusableButton>
          </div>
        )}
      </Card>

      {/* Dialog for "View More" table */}
      <ReusableDialog
        isOpen={showAllDialog}
        onClose={() => setShowAllDialog(false)}
        title={`All Assigned Organizations (${organizations.length})`}
        size="3xl"
      >
        <div className="py-4">
          <ReusableTable
            title="Organizations"
            data={tableData as unknown as TableItem[]}
            columns={tableColumns as unknown as TableColumn<TableItem>[]}
            searchable={true}
            searchableColumns={["grp_title", "grp_country", "_id"]}
            filterable={false}
            showPagination={true}
            pageSize={5}
            pageSizeOptions={[5, 10, 20]}
            exportable={false}
            tableId={`cohort-orgs-${cohortId}`}
          />
        </div>
      </ReusableDialog>

      {/* Unassign Confirmation Dialog */}
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