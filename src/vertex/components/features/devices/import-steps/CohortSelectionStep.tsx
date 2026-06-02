import React, { useState, useEffect, useMemo } from "react";
import { ComboBox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { AqPlus } from "@airqo/icons-react";
import { useCohorts, useGroupCohorts, usePersonalUserCohorts } from "@/core/hooks/useCohorts";
import { useUserContext } from "@/core/hooks/useUserContext";
import { useAppSelector } from "@/core/redux/hooks";
import { CreateCohortDialog } from "../../cohorts/create-cohort";
import type { Cohort } from "@/app/types/cohorts";

interface CohortSelectionStepProps {
  selectedCohortId: string;
  onCohortSelect: (id: string, name: string) => void;
  open: boolean;
  isAdminPage: boolean;
  preselectedNetwork?: string;
}

export const CohortSelectionStep: React.FC<CohortSelectionStepProps> = ({
  selectedCohortId,
  onCohortSelect,
  open,
  isAdminPage,
  preselectedNetwork,
}) => {
  const { isExternalOrg, activeGroup } = useUserContext();
  const userDetails = useAppSelector((state) => state.user.userDetails);
  const [cohortSearch, setCohortSearch] = useState("");
  const [debouncedCohortSearch, setDebouncedCohortSearch] = useState("");
  const [createCohortModalOpen, setCreateCohortModalOpen] = useState(false);
  const [optimisticCohort, setOptimisticCohort] = useState<{_id: string, name: string} | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCohortSearch(cohortSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [cohortSearch]);

  const { data: personalCohortIds, isFetching: isFetchingPersonalCohortIds } = usePersonalUserCohorts(
    userDetails?._id,
    { enabled: open && !isExternalOrg && !!userDetails?._id }
  );

  const { cohorts: allCohorts, isFetching: isFetchingAllCohorts } = useCohorts({
    enabled: open && !isExternalOrg && !!personalCohortIds && personalCohortIds.length > 0,
    search: debouncedCohortSearch,
    cohort_id: personalCohortIds,
    limit: 100
  });

  const { data: groupCohortIds, isFetching: isFetchingCohortIds } = useGroupCohorts(
    activeGroup?._id,
    { enabled: open && isExternalOrg && !!activeGroup?._id }
  );

  const { cohorts: searchedCohorts, isFetching: isFetchingGroupCohorts } = useCohorts({
    enabled: open && isExternalOrg && !!activeGroup?._id,
    search: debouncedCohortSearch,
    limit: 100
  });

  const filteredGroupCohorts = useMemo(() => {
    if (!isExternalOrg || !groupCohortIds || groupCohortIds.length === 0) {
      return searchedCohorts;
    }
    const cohortIdSet = new Set(groupCohortIds);
    return searchedCohorts.filter(cohort => cohortIdSet.has(cohort._id));
  }, [isExternalOrg, searchedCohorts, groupCohortIds]);

  const cohorts = isExternalOrg ? filteredGroupCohorts : allCohorts;
  const isFetchingCohorts = isExternalOrg ? (isFetchingGroupCohorts || isFetchingCohortIds) : (isFetchingAllCohorts || isFetchingPersonalCohortIds);

  const handleCreateCohortSuccess = (cohortData?: { cohort: { _id: string; name: string } }) => {
    setCreateCohortModalOpen(false);
    if (cohortData && cohortData.cohort && cohortData.cohort._id) {
      setOptimisticCohort(cohortData.cohort);
      onCohortSelect(cohortData.cohort._id, cohortData.cohort.name);
    }
  };

  const handleCreateCohortAction = () => {
    setCreateCohortModalOpen(true);
  };

  const handleCohortSelect = (id: string) => {
    const cohort = cohorts?.find((c: Cohort) => c._id === id);
    onCohortSelect(id, cohort?.name || "");
  };

  const baseOptions = cohorts?.map((cohort: Cohort) => ({
    value: cohort._id,
    label: cohort.name,
  })) || [];

  const finalOptions = [...baseOptions];
  if (optimisticCohort && !finalOptions.find(o => o.value === optimisticCohort._id)) {
    finalOptions.push({ value: optimisticCohort._id, label: optimisticCohort.name });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label>
          Choose cohort {isAdminPage ? '(Optional)' : <span className="text-red-500">*</span>}
        </Label>
        <ComboBox
          options={finalOptions}
          value={selectedCohortId}
          onValueChange={handleCohortSelect}
          placeholder="Select a cohort"
          searchPlaceholder="Search cohorts..."
          emptyMessage="No cohorts found"
          className="w-full"
          allowCustomInput={false}
          customActionLabel="Create New Cohort"
          customActionIcon={AqPlus}
          onCustomAction={handleCreateCohortAction}
          onSearchChange={setCohortSearch}
          isLoading={isFetchingCohorts}
        />
        <p className="text-xs text-muted-foreground">
          {isAdminPage
            ? "You can optionally assign the imported device(s) to a cohort to easily manage them."
            : "You must assign the imported device(s) to a cohort."}
        </p>
      </div>

      <CreateCohortDialog
        open={createCohortModalOpen}
        onOpenChange={setCreateCohortModalOpen}
        onSuccess={handleCreateCohortSuccess}
        hideDeviceSelection={true}
        preselectedDevices={[]}
        andNavigate={false}
        preselectedNetwork={preselectedNetwork}
      />
    </div>
  );
};
