"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AqArrowLeft, AqMinusCircle, AqPlus } from "@airqo/icons-react";
import { AssignCohortDevicesDialog } from "@/components/features/cohorts/assign-cohort-devices";
import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import { useCohortDetails } from "@/core/hooks/useCohorts";
import ClientPaginatedDevicesTable from "@/components/features/devices/client-paginated-devices-table";
import CohortDetailsCard from "@/components/features/cohorts/cohort-detail-card";
import CohortDetailsModal from "@/components/features/cohorts/edit-cohort-details-modal";
import { usePermission } from "@/core/hooks/usePermissions";
import { PERMISSIONS } from "@/core/permissions/constants";
import ReusableButton from "@/components/shared/button/ReusableButton";
import { UnassignCohortDevicesDialog } from "@/components/features/cohorts/unassign-cohort-devices";
import CohortMeasurementsApiCard from "@/components/features/cohorts/cohort-measurements-api-card";

// Loading skeleton for content grid
const ContentGridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 items-start">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
    ))}
  </div>
);

export default function CohortDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const cohortId = params?.id as string;

  const { data: cohort, isLoading, error } = useCohortDetails(cohortId);
  const canUpdateDevice = usePermission(PERMISSIONS.DEVICE.UPDATE);
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
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showUnassignDialog, setShowUnassignDialog] = useState(false);

  const handleOpenDetails = () => setShowDetailsModal(true);
  const handleCloseDetails = () => setShowDetailsModal(false);

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

  const handleAssignSuccess = () => {
    setShowAssignDialog(false);
  };

  const handleUnassignSuccess = () => {
    setShowUnassignDialog(false);
  };

  return (
    <RouteGuard permission={PERMISSIONS.DEVICE.VIEW}>
      <div>
        <div className="flex">
          <ReusableButton variant="text" onClick={() => router.back()} Icon={AqArrowLeft}>
            Back
          </ReusableButton>

        </div>
        <AssignCohortDevicesDialog
          open={showAssignDialog}
          onOpenChange={setShowAssignDialog}
          onSuccess={handleAssignSuccess}
          cohortId={cohortId}
        />
        <UnassignCohortDevicesDialog
          open={showUnassignDialog}
          onOpenChange={setShowUnassignDialog}
          cohortDevices={devices}
          onSuccess={handleUnassignSuccess}
          cohortId={cohortId}
        />

        {isLoading ? (
          <ContentGridSkeleton />
        ) : error ? (
          <div className="mt-6 text-sm text-muted-foreground">
            Unable to load cohort details:{" "}
            {String((error as Error)?.message || "Unknown error")}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Cohort basic info card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 items-start">
              <CohortDetailsCard
                name={cohort?.name || ""}
                id={cohort?._id || ""}
                visibility={Boolean(cohort?.visibility)}
                onShowDetailsModal={handleOpenDetails}
                loading={isLoading}
              />
              <CohortMeasurementsApiCard cohortId={cohortId} />
            </div>

            {/* Devices list */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Cohort devices</h2>
                <div className="flex gap-2">
                  <ReusableButton
                    variant="filled"
                    onClick={() => setShowAssignDialog(true)}
                    disabled={!canUpdateDevice}
                    permission={PERMISSIONS.DEVICE.UPDATE}
                    Icon={AqPlus}
                    padding="px-3 py-1.5"
                    className="text-sm font-medium"
                  >
                    Add Devices
                  </ReusableButton>
                  <ReusableButton
                    variant="outlined"
                    onClick={() => setShowUnassignDialog(true)}
                    disabled={!canUpdateDevice}
                    permission={PERMISSIONS.DEVICE.UPDATE}
                    Icon={AqMinusCircle}
                    padding="px-3 py-1.5"
                    className="border-red-700 hover:bg-red-700 text-red-700 text-sm font-medium"
                  >
                    Remove Devices
                  </ReusableButton>
                </div>
              </div>
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
              onClose={handleCloseDetails}
            />
          </div>
        )}
      </div>
    </RouteGuard>
  );
}
