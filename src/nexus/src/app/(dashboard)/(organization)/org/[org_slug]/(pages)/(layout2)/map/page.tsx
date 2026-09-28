'use client';

import React from 'react';
import { MapPage } from '@/modules/airqo-map';
import { LoadingSpinner } from '@/shared/components/ui/loading-spinner';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { AqAlertTriangle, AqSearchRefraction } from '@airqo/icons-react';
import { useOrgCohortContextRequired } from '@/shared/providers/org-cohort-provider';

interface PageProps {
  params: {
    org_slug: string;
  };
}

const Page: React.FC<PageProps> = () => {
  // Cohort selection lives in the org-wide context (set once in the header).
  // MapPage takes only the first id of a comma list, so a single cohort id
  // resolves exactly one cohort — no "All cohorts".
  const {
    organizationGroup,
    cohortIds,
    selectedCohortId,
    isLoading: cohortsLoading,
    error: cohortsError,
    refetch: refetchCohorts,
  } = useOrgCohortContextRequired();

  // `isLoading` stays true while the organization group is still resolving,
  // so the not-found branch keys off the group itself + the load state.
  if (cohortsLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (!organizationGroup) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <p>Organization not found or you do not have access.</p>
      </div>
    );
  }

  // Only bail when the cohort ids themselves are unavailable; a failed
  // summary (names) call still leaves enough to render the map — the header
  // bar surfaces fallback labels and its own retry action.
  if (cohortsError && !cohortIds.length) {
    return (
      <div className="h-full w-full p-6">
        <EmptyState
          title="Unable to load device groups"
          description={cohortsError}
          icon={<AqAlertTriangle size={48} />}
          action={{
            label: 'Retry',
            onClick: () => refetchCohorts(),
          }}
          className="min-h-[400px]"
        />
      </div>
    );
  }

  // If organization has no cohorts, show message
  if (!cohortIds.length) {
    return (
      <div className="h-full w-full p-6">
        <EmptyState
          title="No Data Available"
          description="This organization does not have any devices deployed yet."
          icon={<AqSearchRefraction size={48} />}
          className="min-h-[400px]"
        />
      </div>
    );
  }

  // The cohort selector now lives inline in the header top row (above the map
  // via the shared shell), so the map fills the remaining viewport without a
  // floating overlay. `navHeight` covers all chrome around the map: MapLayout
  // p-1 (4+4) + gap-2 (8) + header h-12 (48) — the same math the default uses.
  return <MapPage cohortId={selectedCohortId} isOrganizationFlow />;
};

export default Page;
