import React, { useMemo, useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { ComboBox } from "@/components/ui/combobox";
import { AqPlus } from "@airqo/icons-react";
import { useCohorts, useGroupCohorts } from "@/core/hooks/useCohorts";
import { Cohort } from "@/app/types/cohorts";
import { useUserContext } from "@/core/hooks/useUserContext";
import { CreateCohortDialog } from "../../cohorts/create-cohort";

interface CohortSelectionStepProps {
  selectedCohortId: string;
  onCohortSelect: (cohortId: string) => void;
  open: boolean;
}

export const CohortSelectionStep: React.FC<CohortSelectionStepProps> = ({
  selectedCohortId,
  onCohortSelect,
  open
}) => {
  const { isExternalOrg, activeGroup } = useUserContext();
  const [cohortSearch, setCohortSearch] = useState("");
  const [debouncedCohortSearch, setDebouncedCohortSearch] = useState("");
  const [createCohortModalOpen, setCreateCohortModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCohortSearch(cohortSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [cohortSearch]);

  const { cohorts: allCohorts, isFetching: isFetchingAllCohorts } = useCohorts({
    enabled: open && !isExternalOrg,
    search: debouncedCohortSearch,
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
  const isFetchingCohorts = isExternalOrg ? (isFetchingGroupCohorts || isFetchingCohortIds) : isFetchingAllCohorts;

  const handleCreateCohortSuccess = (cohortData?: { cohort: { _id: string; name: string } }) => {
    setCreateCohortModalOpen(false);
    if (cohortData && cohortData.cohort && cohortData.cohort._id) {
      onCohortSelect(cohortData.cohort._id);
    }
  };

  const handleCreateCohortAction = () => {
    setCreateCohortModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label>Select a cohort</Label>
        <ComboBox
          options={cohorts?.map((cohort: Cohort) => ({
            value: cohort._id,
            label: cohort.name,
          })) || []}
          value={selectedCohortId}
          onValueChange={onCohortSelect}
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
          Group the imported device(s) under a cohort to easily manage them.
        </p>
      </div>

      <CreateCohortDialog
        open={createCohortModalOpen}
        onOpenChange={setCreateCohortModalOpen}
        onSuccess={handleCreateCohortSuccess}
        preselectedDevices={[]}
        andNavigate={false}
      />
    </div>
  );
};
