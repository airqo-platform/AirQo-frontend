"use client";

import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { CreateCohortDialog } from "@/components/features/cohorts/create-cohort";
import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import ReusableTable, { TableColumn } from "@/components/shared/table/ReusableTable";
import { useCohorts } from "@/core/hooks/useCohorts";
import { Cohort } from "@/app/types/cohorts";
import { useState, useEffect, useCallback } from "react";
import moment from "moment";
import { useQueryClient } from "@tanstack/react-query";
import { useAppSelector } from "@/core/redux/hooks";
import { devices as devicesApi } from "@/core/apis/devices";
import ReusableButton from "@/components/shared/button/ReusableButton";
import { AqPlus } from "@airqo/icons-react";
import { CreateCohortFromSelectionDialog } from "@/components/features/cohorts/create-cohort-from-cohorts";
import { AssignCohortsToGroupDialog } from "@/components/features/cohorts/assign-cohorts-to-group";

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
  const [showAssignToGroup, setShowAssignToGroup] = useState(false);
  const [selectedCohortIds, setSelectedCohortIds] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);
  const activeGroup = useAppSelector((state) => state.user.activeGroup);

  const prefetchDevices = useCallback(() => {
    const net = activeNetwork?.net_name || "";
    const grp = activeGroup?.grp_title === "airqo" ? "" : (activeGroup?.grp_title || "");
    if (!net || !activeGroup?.grp_title) return;
    return queryClient.prefetchQuery({
      queryKey: ["devices", net, activeGroup?.grp_title],
      queryFn: () => devicesApi.getDevicesSummaryApi(net, grp),
      staleTime: 300_000,
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

  const tableActions = [
    {
      label: "Create cohort from selection",
      value: "create-from-cohorts",
      handler: (ids: (string | number)[]) => {
        setSelectedCohortIds(ids.map(String));
        setShowCreateFromCohorts(true);
      },
    },
    {
      label: "Assign to group",
      value: "assign-to-group",
      handler: (ids: (string | number)[]) => {
        setSelectedCohortIds(ids.map(String));
        setShowAssignToGroup(true);
      },
    },
  ];

  return (
    <RouteGuard permission="DEVICE_VIEW">
      <div>
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Cohorts</h1>
            <p className="text-sm text-muted-foreground">
              Manage and organize your device cohorts
            </p>
          </div>
          <ReusableButton
            variant="filled"
            onMouseEnter={prefetchDevices}
            onFocus={prefetchDevices}
            onClick={() => {
              prefetchDevices();
              setShowCreateCohortModal(true);
            }}
            Icon={AqPlus}
          >
            Create Cohort
          </ReusableButton>
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
          onSelectedItemsChange={(ids: (string | number)[]) => setSelectedCohortIds(ids.map(String))}
          actions={tableActions}
          onRowClick={(item: unknown) => {
            const row = item as CohortRow;
            if (row?.id) router.push(`/cohorts/${row.id}`)
          }}
          emptyState={error ? (error.message || "unable to load cohorts") : "No cohorts available"}
        />

        <CreateCohortDialog open={showCreateCohortModal} onOpenChange={setShowCreateCohortModal} />
        <CreateCohortFromSelectionDialog open={showCreateFromCohorts} onOpenChange={setShowCreateFromCohorts} selectedCohortIds={selectedCohortIds} />
        <AssignCohortsToGroupDialog
          open={showAssignToGroup}
          onOpenChange={setShowAssignToGroup}
          initialSelectedCohortIds={selectedCohortIds}
        />

      </div>
    </RouteGuard>
  );
}
