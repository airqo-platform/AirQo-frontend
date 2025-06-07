'use client';

import { useOrganization } from '@/app/providers/OrganizationProvider';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Import existing analytics components
import OverView from '@/app/(default)/(pages)/(layout-1)/analytics/view/OverView';

export default function OrganizationInsightsPage({ params }) {
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {organization.name} - Data Insights
            </h1>
            <p className="text-gray-600 mt-1">
              Air quality analytics and trends for {organization.name}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: primaryColor }}
            />
            <span className="text-sm text-gray-600">Organization Theme</span>
          </div>
        </div>
      </div>

      {/* Custom organization branding wrapper */}
      <div
        className="rounded-lg border-2 p-1"
        style={{ borderColor: primaryColor + '20' }}
      >
        <div className="bg-white rounded-md">
          {/* Render the existing analytics overview with organization context */}
          <OverView />
        </div>
      </div>

      {/* Organization-specific insights footer */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Organization Insights
          </h3>
          <p className="text-gray-600">
            Data shown above is filtered and customized for {organization.name}.
            For platform-wide analytics, visit the main analytics dashboard.
          </p>
          {organization.domain && (
            <p className="text-sm text-gray-500 mt-2">
              Organization Domain: {organization.domain}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
