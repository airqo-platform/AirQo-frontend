'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useOrgGroup } from '@/shared/hooks/useOrgGroup';
import {
  useOrgCohorts,
  useOrgCohortSelection,
  type OrgCohortOption,
} from '@/shared/hooks/useOrgCohorts';
import type { NormalizedGroup } from '@/shared/utils/userUtils';

export interface OrgCohortContextValue {
  organizationGroup: NormalizedGroup | null;
  organizationGroupId: string;
  cohorts: OrgCohortOption[];
  cohortIds: string[];
  selectedCohortId: string;
  selectedCohort: OrgCohortOption | undefined;
  selectCohort: (cohortId: string) => void;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const OrgCohortContext = createContext<OrgCohortContextValue | null>(null);

export interface OrgCohortProviderProps {
  organizationSlug: string;
  children: ReactNode;
}

/**
 * Org-wide cohort context, mounted once in the org shell layout. Resolves the
 * organization group, its cohort ids + names, and a single persisted cohort
 * selection. Every org page (dashboard, data-export, map) consumes this
 * instead of fetching cohorts itself, so there is exactly one
 * /users/groups/:id/cohorts + one /devices/cohorts/summary subscription per
 * group and the selection survives navigation within the group.
 */
export const OrgCohortProvider: React.FC<OrgCohortProviderProps> = ({
  organizationSlug,
  children,
}) => {
  const {
    organizationGroup,
    organizationGroupId,
    isInitialLoading: orgGroupLoading,
  } = useOrgGroup({ organizationSlug, isOrganizationFlow: true });

  const {
    cohorts,
    cohortIds,
    isLoading: cohortsLoading,
    error,
    refetch,
  } = useOrgCohorts(organizationGroupId, !!organizationGroupId);

  const { selectedCohortId, selectCohort } = useOrgCohortSelection(
    organizationGroupId,
    cohortIds
  );

  const selectedCohort = useMemo(
    () => cohorts.find(cohort => cohort.id === selectedCohortId),
    [cohorts, selectedCohortId]
  );

  const isLoading = orgGroupLoading || cohortsLoading;

  const value = useMemo<OrgCohortContextValue>(
    () => ({
      organizationGroup,
      organizationGroupId,
      cohorts,
      cohortIds,
      selectedCohortId,
      selectedCohort,
      selectCohort,
      isLoading,
      error,
      refetch,
    }),
    [
      organizationGroup,
      organizationGroupId,
      cohorts,
      cohortIds,
      selectedCohortId,
      selectedCohort,
      selectCohort,
      isLoading,
      error,
      refetch,
    ]
  );

  return (
    <OrgCohortContext.Provider value={value}>
      {children}
    </OrgCohortContext.Provider>
  );
};

/** Returns null outside the provider (e.g. user flow). */
export const useOrgCohortContext = (): OrgCohortContextValue | null =>
  useContext(OrgCohortContext);

export const useOrgCohortContextRequired = (): OrgCohortContextValue => {
  const ctx = useContext(OrgCohortContext);
  if (!ctx) {
    throw new Error(
      'useOrgCohortContextRequired must be used within an OrgCohortProvider.'
    );
  }
  return ctx;
};
