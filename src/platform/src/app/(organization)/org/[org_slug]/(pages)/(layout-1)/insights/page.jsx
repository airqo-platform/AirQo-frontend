'use client';

import { useOrganization } from '@/app/providers/OrganizationProvider';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CardWrapper from '@/common/components/CardWrapper';
import withOrgAuth from '@/core/HOC/withOrgAuth';

// Import existing analytics components
import OverView from '@/app/(individual)/user/(pages)/(layout-1)/analytics/view/OverView';

const OrganizationInsightsPage = ({ params }) => {
  const _router = useRouter();
  const { organization, primaryColor } = useOrganization();
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
      {/* Organization-specific header */}
      <CardWrapper
        title={`${organization.name} - Data Insights`}
        subtitle={`Air quality analytics and trends for ${organization.name}`}
        rightContent={
          <div className="flex items-center space-x-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: primaryColor }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Organization Theme
            </span>
          </div>
        }
        className="border-t-4"
        style={{ borderTopColor: primaryColor || '#3B82F6' }}
        padding="p-6"
      />
      {/* Custom organization branding wrapper */}
      <CardWrapper
        className="border-2"
        style={{ borderColor: (primaryColor || '#3B82F6') + '20' }}
        padding="p-1"
      >
        <div className="bg-white dark:bg-gray-900 rounded-md">
          {/* Render the existing analytics overview with organization context */}
          <OverView />
        </div>
      </CardWrapper>{' '}
    </div>
  );
};

export default withOrgAuth(OrganizationInsightsPage);
