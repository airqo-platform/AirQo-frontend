'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { MapPage } from '@/modules/airqo-map';
import { useUser } from '@/shared/hooks/useUser';
import { useActiveGroupCohorts } from '@/shared/hooks';
import { LoadingSpinner } from '@/shared/components/ui/loading-spinner';

interface PageProps {
  params: {
    org_slug: string;
  };
}

const Page: React.FC<PageProps> = ({ params }) => {
  const { groups, isLoading: userLoading } = useUser();
  const { org_slug } = params;
  const [cohortIdString, setCohortIdString] = useState<string | null>(null);

  const activeGroup = useMemo(() => {
    return groups?.find(g => g.organizationSlug === org_slug);
  }, [groups, org_slug]);

  // Fetch cohort IDs for the organization
  const { cohortIds, isLoading: cohortsLoading } = useActiveGroupCohorts();

  // Convert cohort IDs array to comma-separated string when ready
  useEffect(() => {
    if (!cohortsLoading && activeGroup) {
      if (cohortIds && cohortIds.length > 0) {
        // Join multiple cohort IDs with comma
        setCohortIdString(cohortIds.join(','));
      } else {
        // Empty string means no cohorts exist for this organization
        setCohortIdString('');
      }
    }
  }, [cohortIds, cohortsLoading, activeGroup]);

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
  if (cohortIdString === null || cohortsLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <LoadingSpinner />
      </div>
    );
  }

  // If organization has no cohorts, show message
  if (cohortIdString === '') {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">No Data Available</p>
          <p className="text-sm text-gray-600">
            This organization does not have any devices deployed yet.
          </p>
        </div>
      </div>
    );
  }

  // Pass cohort IDs and organization flow flag to MapPage
  return <MapPage cohortId={cohortIdString} isOrganizationFlow />;
};

export default Page;
