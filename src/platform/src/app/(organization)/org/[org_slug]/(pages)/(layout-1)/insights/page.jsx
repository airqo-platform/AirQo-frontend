'use client';

import { useOrganization } from '@/app/providers/OrganizationProvider';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import withOrgAuth from '@/core/HOC/withOrgAuth';

// Import existing analytics components
import OverView from '@/app/(individual)/user/(pages)/(layout-1)/analytics/view/OverView';

const OrganizationInsightsPage = ({ params }) => {
  const _router = useRouter();
  const { organization } = useOrganization();
  const [isLoading, setIsLoading] = useState(true);

  const _orgSlug = params?.org_slug || '';

  useEffect(() => {
    if (organization) {
      setIsLoading(false);
    }
  }, [organization]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading insights dashboard...</p>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="text-center py-12">
        {' '}
        <h3 className="text-lg font-medium text-gray-900">
          Organization not found
        </h3>
        <p className="mt-2 text-gray-600">
          Please check your organization URL and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Render the existing analytics overview */}
      <OverView />
    </div>
  );
};

export default withOrgAuth(OrganizationInsightsPage);
