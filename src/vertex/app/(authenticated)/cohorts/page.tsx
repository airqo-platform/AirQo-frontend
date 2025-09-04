"use client";

import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { CreateCohortDialog } from "@/components/features/cohorts/create-cohort";
import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import ReusableTable, { TableColumn } from "@/components/shared/table/ReusableTable";
import { useCohorts } from "@/core/hooks/useCohorts";
import { Cohort } from "@/app/types/cohorts";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import moment from "moment";
import { useQueryClient } from "@tanstack/react-query";
import { useAppSelector } from "@/core/redux/hooks";
import { devices as devicesApi } from "@/core/apis/devices";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCohortFromCohorts } from "@/core/hooks/useCohorts";

type CohortRow = {
  id: string;
  name: string;
  numberOfDevices: number;
  visibility: boolean;
  dateCreated?: string;
}

export default function CohortsPage() {
  const router = useRouter();
  const { cohorts, isLoading, error } = useCohorts();

  const [showCreateCohortModal, setShowCreateCohortModal] = useState(false);
  const [showCreateFromCohorts, setShowCreateFromCohorts] = useState(false);
  const [selectedCohortIds, setSelectedCohortIds] = useState<string[]>([]);
  const [newCohortName, setNewCohortName] = useState("");
  const [newCohortDescription, setNewCohortDescription] = useState("");
  const queryClient = useQueryClient();
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);
  const activeGroup = useAppSelector((state) => state.user.activeGroup);
  const { mutate: createFromCohorts, isPending: isCreatingFromCohorts } = useCreateCohortFromCohorts();

  const prefetchDevices = useCallback(() => {
    const net = activeNetwork?.net_name || "";
    const grp = activeGroup?.grp_title === "airqo" ? "" : (activeGroup?.grp_title || "");
    if (!net || !activeGroup?.grp_title) return;
    return queryClient.prefetchQuery({
      queryKey: ["devices", net, activeGroup?.grp_title],
      queryFn: () => devicesApi.getDevicesSummaryApi(net, grp),
      staleTime: 120_000,
    });
  }, [queryClient, activeNetwork?.net_name, activeGroup?.grp_title]);

  useEffect(() => {
    prefetchDevices();
  }, [prefetchDevices]);

  const rows: CohortRow[] = (cohorts || []).map((c: Cohort) => ({
    id: c._id,
    name: c.name,
    numberOfDevices: c.numberOfDevices ?? 0,
    visibility: c.visibility,
    dateCreated: c.createdAt
  }));

  const columns: TableColumn<CohortRow>[] = [
    {
      key: "name",
      label: "Cohort Name",
      sortable: true,
      render: (v) => v ?? "-"
    },
    {
      key: "numberOfDevices",
      label: "Number of devices",
      sortable: true,
      render: (v) => (v ?? 0)
    },
    {
      key: "visibility",
      label: "Visibility",
      sortable: true,
      render: (v) => (
        <Badge variant={v ? "default" : "secondary"}>{v ? "Public" : "Private"}</Badge>
      )
    },
    {
      key: "dateCreated",
      label: "Date created",
      sortable: true,
      render: (value) => {
        const date = new Date(value as string);
        return moment(date).format("MMM D YYYY, H:mm A");
      }
    }
  ]

  return (
    <RouteGuard permission="DEVICE_VIEW">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Cohort Registry</h1>
            <p className="text-sm text-muted-foreground">
              Manage and organize your device cohorts
            </p>
          </div>
          <Button
            onMouseEnter={prefetchDevices}
            onFocus={prefetchDevices}
            onClick={() => {
              prefetchDevices();
              setShowCreateCohortModal(true);
            }}
          >
            Create Cohort
          </Button>
        </div>

        <ReusableTable
          title="Cohorts"
          data={rows}
          columns={columns}
          searchable
          filterable={false}
          sortable
          loading={isLoading}
          searchableColumns={["name"]}
          multiSelect
          onSelectedItemsChange={(ids) => setSelectedCohortIds(ids as string[])}
          actions={[
            {
              label: "Create cohort from selection",
              value: "create-from-cohorts",
              handler: (ids) => {
                setSelectedCohortIds(ids as string[]);
                setShowCreateFromCohorts(true);
              },
            },
          ]}
          onRowClick={(item: unknown) => {
            const row = item as CohortRow;
            if (row?.id) router.push(`/cohorts/${row.id}`)
          }}
          emptyState={error ? (error.message || "unable to load cohorts") : "No cohorts available"}
        />
        <CreateCohortDialog open={showCreateCohortModal} onOpenChange={setShowCreateCohortModal} />

        {/* Create From Cohorts Dialog */}
        <Dialog open={showCreateFromCohorts} onOpenChange={(open) => {
          setShowCreateFromCohorts(open);
          if (!open) {
            setNewCohortName("");
            setNewCohortDescription("");
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Cohort from Selected Cohorts</DialogTitle>
              <DialogDescription>
                Provide a name and optional description for the new cohort. {selectedCohortIds.length} cohort(s) selected.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Name</label>
                <Input
                  placeholder="Enter new cohort name"
                  value={newCohortName}
                  onChange={(e) => setNewCohortName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Description</label>
                <Textarea
                  placeholder="Describe this combined cohort (optional)"
                  value={newCohortDescription}
                  onChange={(e) => setNewCohortDescription(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateFromCohorts(false)}
                  disabled={isCreatingFromCohorts}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={isCreatingFromCohorts || newCohortName.trim().length < 2 || selectedCohortIds.length === 0}
                  onClick={() => {
                    if (newCohortName.trim() && selectedCohortIds.length > 0) {
                      createFromCohorts(
                        { name: newCohortName.trim(), description: newCohortDescription.trim() || undefined, cohort_ids: selectedCohortIds },
                        {
                          onSuccess: () => {
                            setShowCreateFromCohorts(false);
                            setNewCohortName("");
                            setNewCohortDescription("");
                            setSelectedCohortIds([]);
                          },
                        }
                      );
                    }
                  }}
                >
                  {isCreatingFromCohorts ? "Creating…" : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </RouteGuard>
  );
}
