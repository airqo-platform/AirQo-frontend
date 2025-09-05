"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AssignCohortDevicesDialog } from "@/components/features/cohorts/assign-cohort-devices";
import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import { useCohortDetails } from "@/core/hooks/useCohorts";
import DevicesTable from "@/components/features/devices/device-list-table";
import CohortDetailsCard from "@/components/features/cohorts/cohort-detail-card";
import CohortDetailsModal from "@/components/features/cohorts/edit-cohort-details-modal";

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
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);

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
    setSelectedDevices([]);
    setShowAssignDialog(false);
  };

  return (
    <RouteGuard permission="DEVICE_VIEW">
      <div>
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
            Back to Cohorts
          </Button>
          <AssignCohortDevicesDialog
            open={showAssignDialog}
            onOpenChange={setShowAssignDialog}
            selectedDevices={selectedDevices}
            onSuccess={handleAssignSuccess}
          />
        </div>

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
            </div>

            {/* Devices list */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Cohort devices</h2>

              <DevicesTable
                devices={devices}
                isLoading={isLoading}
                error={error}
              />
            </div>
            <CohortDetailsModal
              open={showDetailsModal}
              onOpenChange={setShowDetailsModal}
              cohortDetails={cohortDetails}
              onClose={handleCloseDetails}
            />
          </div>
        )}
      </div>
    </RouteGuard>
  );
}
