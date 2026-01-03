"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { CreateCohortDialog } from "@/components/features/cohorts/create-cohort";
import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import ReusableTable, { TableColumn } from "@/components/shared/table/ReusableTable";
import { useCohorts, useUserCohorts } from "@/core/hooks/useCohorts";
import { Cohort } from "@/app/types/cohorts";
import { useState, useMemo } from "react";
import { format } from 'date-fns';
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
  const {
    pagination, setPagination,
    searchTerm, setSearchTerm,
    sorting, setSorting
  } = useServerSideTableState({ initialPageSize: 25 });

  const [view, setView] = useState<'organization' | 'user'>('organization');

  // Count Queries (Stable, always enabled, minimal payload, no search/sort)
  const { meta: orgCountMeta, isFetching: isFetchingOrgCount } = useCohorts({
    page: 1,
    limit: 1,
  });

  const { meta: userCountMeta, isFetching: isFetchingUserCount } = useUserCohorts({
    page: 1,
    limit: 1,
  });

  // Table Queries (Dynamic, enabled only when active)
  const { cohorts: orgCohorts, meta: orgMeta, isFetching: isFetchingOrg, error: orgError } = useCohorts({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: searchTerm,
    sortBy: sorting[0]?.id,
    order: sorting.length ? (sorting[0]?.desc ? "desc" : "asc") : undefined,
    enabled: view === 'organization'
  });

  const { cohorts: userCohorts, meta: userMeta, isFetching: isFetchingUser, error: userError } = useUserCohorts({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: searchTerm,
    sortBy: sorting[0]?.id,
    order: sorting.length ? (sorting[0]?.desc ? "desc" : "asc") : undefined,
    enabled: view === 'user'
  });

  const cohorts = view === 'organization' ? orgCohorts : userCohorts;
  const meta = view === 'organization' ? orgMeta : userMeta;
  const isFetching = view === 'organization' ? isFetchingOrg : isFetchingUser;
  const error = view === 'organization' ? orgError : userError;

  const pageCount = meta?.totalPages ?? 0;

  const [showCreateCohortModal, setShowCreateCohortModal] = useState(false);
  const [showCreateFromCohorts, setShowCreateFromCohorts] = useState(false);
  const [showAssignToGroup, setShowAssignToGroup] = useState(false);
  const [selectedCohortIds, setSelectedCohortIds] = useState<string[]>([]);

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
        return format(date, "MMM d yyyy, h:mm a");
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
        <div className="flex justify-between items-center mb-3">
          <div>
            <h1 className="text-2xl font-semibold">Cohorts</h1>
            <p className="text-sm text-muted-foreground">
              Manage and organize your device cohorts
            </p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setView('organization');
                  setPagination(prev => ({ ...prev, pageIndex: 0 }));
                  setSearchTerm("");
                }}
                className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium transition-colors border ${view === 'organization'
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-blue-600 border-blue-600 hover:bg-blue-50"
                  }`}
              >
                Organization Cohorts
                <span className="ml-1">
                  ({isFetchingOrgCount && orgCountMeta?.total === undefined ? (
                    <Skeleton className={`inline-block h-3 w-6 rounded-full ${view === 'organization' ? "bg-white/20" : "bg-blue-100"}`} />
                  ) : (
                    orgCountMeta?.total ?? 0
                  )})
                </span>
              </button>
              <button
                onClick={() => {
                  setView('user');
                  setPagination(prev => ({ ...prev, pageIndex: 0 }));
                  setSearchTerm("");
                }}
                className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium transition-colors border ${view === 'user'
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-blue-600 border-blue-600 hover:bg-blue-50"
                  }`}
              >
                User Cohorts
                <span className="ml-1">
                  ({isFetchingUserCount && userCountMeta?.total === undefined ? (
                    <Skeleton className={`inline-block h-3 w-6 rounded-full ${view === 'user' ? "bg-white/20" : "bg-blue-100"}`} />
                  ) : (
                    userCountMeta?.total ?? 0
                  )})
                </span>
              </button>
            </div>
          </div>
          <ReusableButton
            variant="filled"
            onClick={() => {
              setShowCreateCohortModal(true);
            }}
            Icon={AqPlus}
          >
            Create Cohort
          </ReusableButton>
        </div>

        <div>
          <ReusableTable
            title="Cohorts"
            data={rows}
            columns={columns}
            loading={isFetching}
            onRowClick={(item: unknown) => {
              const row = item as CohortRow;
              if (row?.id) router.push(`/admin/cohorts/${row.id}`)
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
