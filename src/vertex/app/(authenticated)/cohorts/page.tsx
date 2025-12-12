"use client";

import { useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import ReusableTable, { TableColumn } from "@/components/shared/table/ReusableTable";
import { useCohorts, useGroupCohorts } from "@/core/hooks/useCohorts";
import { Cohort } from "@/app/types/cohorts";
import { useServerSideTableState } from "@/core/hooks/useServerSideTableState";
import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import { PERMISSIONS } from "@/core/permissions/constants";
import { useUserContext } from "@/core/hooks/useUserContext";

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

    const { userDetails: user, isExternalOrg, activeGroup } = useUserContext();

    // 1. Fetch group cohort IDs if external org
    const { data: groupCohortIds, isLoading: isLoadingGroupCohorts } = useGroupCohorts(
        activeGroup?._id,
        { enabled: isExternalOrg && !!activeGroup?._id }
    );

    // 2. Determine target IDs based on scope
    const targetCohortIds = useMemo(() => {
        if (isExternalOrg) {
            return groupCohortIds || [];
        }
        // Personal scope
        return user?.cohort_ids || [];
    }, [isExternalOrg, groupCohortIds, user?.cohort_ids]);

    // 3. Conditional Fetching
    const hasIdsToFetch = targetCohortIds && targetCohortIds.length > 0;

    const { cohorts, meta, isFetching: isFetchingCohorts, error } = useCohorts({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: searchTerm,
        sortBy: sorting[0]?.id,
        order: sorting.length ? (sorting[0]?.desc ? "desc" : "asc") : undefined,
        cohort_id: hasIdsToFetch ? targetCohortIds : ["EMPTY_SCOPE_GUARD"],
    });

    const pageCount = meta?.totalPages ?? 0;

    // Composite loading state
    const isLoading = isExternalOrg ? (isLoadingGroupCohorts || isFetchingCohorts) : isFetchingCohorts;

    // Composite error state
    const displayError = (!hasIdsToFetch && !isLoading) ? null : error;

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
                return format(date, "MMM d yyyy, h:mm a");
            }
        }
    ];

    return (
        <RouteGuard permission={PERMISSIONS.DEVICE.VIEW}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Cohorts</h1>
                    <p className="text-muted-foreground max-w-3xl">
                        Cohorts are groups of devices claimed by you or your organization. Use them to control data privacy settings and determine whether your device data is public or private.
                    </p>
                </div>

                <div ref={tableRef}>
                    <ReusableTable
                        title="Your Cohorts"
                        data={rows}
                        columns={columns}
                        loading={isLoading}
                        onRowClick={(item: unknown) => {
                            const row = item as CohortRow;
                            if (row?.id) router.push(`/cohorts/${row.id}`)
                        }}
                        emptyState={displayError ? (displayError.message || "Unable to load cohorts") : "No cohorts available"}
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
            </div>
        </RouteGuard>
    );
}
