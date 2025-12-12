"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { AqArrowLeft } from "@airqo/icons-react";
import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import { useCohortDetails } from "@/core/hooks/useCohorts";
import ClientPaginatedDevicesTable from "@/components/features/devices/client-paginated-devices-table";
import CohortDetailsCard from "@/components/features/cohorts/cohort-detail-card";
import CohortDetailsModal from "@/components/features/cohorts/edit-cohort-details-modal";
import { PERMISSIONS } from "@/core/permissions/constants";
import ReusableButton from "@/components/shared/button/ReusableButton";
import CohortMeasurementsApiCard from "@/components/features/cohorts/cohort-measurements-api-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

const ContentGridSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 items-start">
        {[...Array(2)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
        ))}
    </div>
);

export default function CohortDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const rawCohortId = params?.id;
    // ensure strings are passed to hooks, but invalid ones are caught by the guard later
    const cohortId = typeof rawCohortId === "string" ? rawCohortId : "";

    const { data: cohort, isLoading, error } = useCohortDetails(cohortId, { enabled: !!cohortId });

    const [cohortDetails, setCohortDetails] = useState<{
        name: string;
        id: string;
        visibility: boolean;
    }>({
        name: "",
        id: "",
        visibility: true,
    });

    const [showDetailsModal, setShowDetailsModal] = useState(false);

    useEffect(() => {
        if (cohort) {
            setCohortDetails({
                name: cohort.name,
                id: cohort._id,
                visibility: cohort.visibility,
            });
        }
    }, [cohort]);

    const devices = useMemo(() => cohort?.devices || [], [cohort]);

    if (!rawCohortId || typeof rawCohortId !== "string") {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <p className="text-muted-foreground">Invalid cohort ID</p>
            </div>
        );
    }

    return (
        <RouteGuard permission={PERMISSIONS.DEVICE.VIEW}>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <ReusableButton variant="text" onClick={() => router.back()} Icon={AqArrowLeft}>
                        Back
                    </ReusableButton>
                </div>

                {isLoading ? (
                    <ContentGridSkeleton />
                ) : error ? (
                    <Alert variant="destructive">
                        <ExclamationTriangleIcon className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            {String((error as Error)?.message || "Unable to load cohort details")}
                        </AlertDescription>
                    </Alert>
                ) : (
                    <div className="flex flex-col gap-8">
                        {/* Top Cards: Details & API */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            <CohortDetailsCard
                                name={cohort?.name || ""}
                                id={cohort?._id || ""}
                                visibility={Boolean(cohort?.visibility)}
                                onShowDetailsModal={() => setShowDetailsModal(true)}
                                loading={isLoading}
                            />
                            <CohortMeasurementsApiCard cohortId={cohortId} />
                        </div>

                        {/* Devices List */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold">Cohort Devices</h2>
                            <ClientPaginatedDevicesTable
                                devices={devices}
                                isLoading={isLoading}
                                error={error}
                                hiddenColumns={["site", "groups"]}
                            />
                        </div>

                        <CohortDetailsModal
                            open={showDetailsModal}
                            cohortDetails={cohortDetails}
                            onClose={() => setShowDetailsModal(false)}
                        />
                    </div>
                )}
            </div>
        </RouteGuard>
    );
}
