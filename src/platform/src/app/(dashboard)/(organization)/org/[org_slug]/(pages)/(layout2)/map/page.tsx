'use client';

import React, { useMemo } from 'react';
import { MapPage } from '@/modules/airqo-map';
import { useUser } from '@/shared/hooks/useUser';
import { useGroupCohorts } from '@/shared/hooks';
import { LoadingSpinner } from '@/shared/components/ui/loading-spinner';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { AqSearchRefraction } from '@airqo/icons-react';

interface PageProps {
  params: {
    org_slug: string;
  };
}

const Page: React.FC<PageProps> = ({ params }) => {
  const { groups, isLoading: userLoading } = useUser();
  const { org_slug } = params;

  const activeGroup = useMemo(() => {
    return groups?.find(g => g.organizationSlug === org_slug);
  }, [groups, org_slug]);

  const organizationGroupId = activeGroup?.id || '';
  const { data: groupCohortsResponse, isLoading: cohortsLoading } =
    useGroupCohorts(organizationGroupId, !!organizationGroupId);
  const cohortIds = useMemo(
    () => groupCohortsResponse?.data ?? [],
    [groupCohortsResponse?.data]
  );
  const cohortIdString = useMemo(() => cohortIds.join(','), [cohortIds]);

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (!activeGroup) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <p>Organization not found or you do not have access.</p>
      </div>
    );
  }

  // Show loading while fetching cohort IDs
  if (cohortsLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <LoadingSpinner />
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

  // Pass cohort IDs and organization flow flag to MapPage
  return <MapPage cohortId={cohortIdString} isOrganizationFlow />;
};

export default Page;
