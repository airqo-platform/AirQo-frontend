"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddDevicesDialog } from "@/components/features/cohorts/assign-cohort-devices";
import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import { useCohortDetails } from "@/core/hooks/useCohorts";
import DevicesTable from "@/components/features/devices/device-list-table";
import CohortDetailsCard from "@/components/features/cohorts/cohort-detail-card";
import CohortDetailsModal from "@/components/features/cohorts/edit-cohort-details-modal";

const ITEMS_PER_PAGE = 8;

export default function CohortDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const cohortId = params?.id as string;

  const { data: cohort, isLoading, error } = useCohortDetails(cohortId);
  const [cohortDetails, setCohortDetails] = useState<{ name: string; id: string; visibility: boolean }>({
    name: "",
    id: "",
    visibility: true,
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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

  // Optional: wire up save to API when available
  const handleSaveDetails = async ({ name, visibility }: { name: string; visibility: boolean }) => {
    // TODO: call update cohort API when implemented, then optimistically update local UI or refetch
    setCohortDetails((prev) => ({ ...prev, name, visibility: visibility }));
  };

  return (
    <RouteGuard permission="DEVICE_VIEW">
      <div>
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
            Back to Cohorts
          </Button>
          <AddDevicesDialog />
        </div>

        {/* Loading / Error states */}
        {isLoading && <div className="text-sm text-muted-foreground">Loading cohort...</div>}
        {!isLoading && error && (
          <div className="text-sm text-destructive">{error.message || "Unable to load cohort"}</div>
        )}

        {/* Details form */}
        {!isLoading && cohort && (
          <div className="flex flex-col gap-6">
            {/* Cohort basic info card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 items-start">
            <CohortDetailsCard
              name={cohort?.name || ""}
              id={cohort?._id || ""}
              visibility={Boolean(cohort?.visibility)}
              onShowDetailsModal={handleOpenDetails}
            />
            </div>

            {/* Devices list */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Cohort devices</h2>

              <DevicesTable
                devices={devices}
                isLoading={isLoading}
                error={error}
                itemsPerPage={ITEMS_PER_PAGE}
              />
            </div>
            <CohortDetailsModal
              open={showDetailsModal}
              onOpenChange={setShowDetailsModal}
              cohortDetails={cohortDetails}
              onClose={handleCloseDetails}
              onSave={handleSaveDetails}
            />
          </div>
        )}
      </div>
    </RouteGuard>
  );
}