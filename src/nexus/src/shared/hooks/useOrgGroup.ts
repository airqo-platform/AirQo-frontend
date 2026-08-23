'use client';

import { useMemo } from 'react';
import { useUser } from './useUser';
import type { NormalizedGroup } from '@/shared/utils/userUtils';

interface UseOrgGroupOptions {
  /** URL slug for the organization. */
  organizationSlug?: string;
  /** When true, resolve group from the slug rather than using activeGroup. */
  isOrganizationFlow?: boolean;
}

interface UseOrgGroupResult {
  /** Matched organization group (by organizationSlug, case-insensitive), null when !isOrganizationFlow. */
  organizationGroup: NormalizedGroup | null;
  /** organizationGroup?.id || '' */
  organizationGroupId: string;
  /** org flow ? organizationGroupId : (activeGroup?.id ?? '') */
  groupId: string;
  /** userContextLoading || (isOrganizationFlow && !!slug && !organizationGroupId) */
  isInitialLoading: boolean;
}

/**
 * Resolves the organization group from a URL slug, deduplicating the
 * identical slug→group lookup performed in OrgDashboard, AnalyticsDashboard,
 * and AnalyticsExplorerPage.
 */
export const useOrgGroup = ({
  organizationSlug,
  isOrganizationFlow = false,
}: UseOrgGroupOptions): UseOrgGroupResult => {
  const { activeGroup, groups, isLoading: userContextLoading } = useUser();

  const normalizedSlug = useMemo(
    () => (organizationSlug || '').trim().toLowerCase(),
    [organizationSlug]
  );

  const organizationGroup = useMemo(() => {
    if (!isOrganizationFlow || !normalizedSlug) return null;
    return (
      groups?.find(
        group =>
          (group.organizationSlug || '').trim().toLowerCase() === normalizedSlug
      ) || null
    );
  }, [groups, isOrganizationFlow, normalizedSlug]);

  const organizationGroupId = organizationGroup?.id || '';

  const groupId = isOrganizationFlow
    ? organizationGroupId
    : (activeGroup?.id ?? '');

  const isInitialLoading =
    userContextLoading ||
    (isOrganizationFlow && !!normalizedSlug && !organizationGroupId);

  return {
    organizationGroup,
    organizationGroupId,
    groupId,
    isInitialLoading,
  };
};
