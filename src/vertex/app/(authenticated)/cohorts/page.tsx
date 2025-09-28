"use client";

import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { CreateCohortDialog } from "@/components/features/cohorts/create-cohort";
import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import ReusableTable, { TableColumn } from "@/components/shared/table/ReusableTable";
import { useCohorts } from "@/core/hooks/useCohorts";
import { Cohort } from "@/app/types/cohorts";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import moment from "moment";
import { useQueryClient } from "@tanstack/react-query";
import { useAppSelector } from "@/core/redux/hooks";
import { GetDevicesSummaryParams, devices as devicesApi } from "@/core/apis/devices";
import ReusableButton from "@/components/shared/button/ReusableButton";
import { AqPlus } from "@airqo/icons-react";
import { CreateCohortFromSelectionDialog } from "@/components/features/cohorts/create-cohort-from-cohorts";
import { AssignCohortsToGroupDialog } from "@/components/features/cohorts/assign-cohorts-to-group";
import { useServerSideTableState } from "@/core/hooks/useServerSideTableState";

type CohortRow = {
  id: string;
  name: string;
  numberOfDevices: number;
  visibility: boolean;
  dateCreated?: string;
}

export default function CohortsPage() {
  const router = useRouter();
  const tableRef = useRef<HTMLDivElement>(null);
  const {
    pagination, setPagination,
    searchTerm, setSearchTerm,
    sorting, setSorting
  } = useServerSideTableState({ initialPageSize: 25 });

  const { cohorts, meta, isFetching, error } = useCohorts({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: searchTerm,
    sortBy: sorting[0]?.id,
    order: sorting.length ? (sorting[0]?.desc ? "desc" : "asc") : undefined,
  });

  const pageCount = meta?.totalPages ?? 0;
  
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
    if (!net) return;

    const params: GetDevicesSummaryParams = { network: net, group: grp };

    return queryClient.prefetchQuery({
      queryKey: ["devices", net, grp, { page: 1, limit: 100, search: '', sortBy: undefined, order: undefined }],
      queryFn: () => devicesApi.getDevicesSummaryApi(params),
      staleTime: 300_000,
    });
  }, [queryClient, activeNetwork?.net_name, activeGroup?.grp_title]);

  useEffect(() => {
    prefetchDevices();
  }, [prefetchDevices]);

  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [pagination.pageIndex]);

  const rows: CohortRow[] = useMemo(() => (cohorts || []).map((c: Cohort) => ({
    ...c,
    id: c._id,
    dateCreated: c.createdAt,
  })), [cohorts]);

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
      label: "Assign to Organization",
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

        <div ref={tableRef}>
          <ReusableTable
            title="Cohorts"
            data={rows}
            columns={columns}
            loading={isFetching}
            onRowClick={(item: unknown) => {
              const row = item as CohortRow;
              if (row?.id) router.push(`/cohorts/${row.id}`)
            }}
            emptyState={error ? (error.message || "unable to load cohorts") : "No cohorts available"}
            multiSelect
            onSelectedIdsChange={(ids: (string | number)[]) => setSelectedCohortIds(ids.map(String))}
            actions={tableActions}
            serverSidePagination
            pageCount={pageCount}
            pagination={pagination}
            onPaginationChange={setPagination}
            onSearchChange={setSearchTerm}
            searchTerm={searchTerm}
            sorting={sorting}
            onSortingChange={setSorting}
            searchable
          />
        </div>

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
