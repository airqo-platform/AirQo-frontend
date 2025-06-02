'use client';

import React from 'react';
import PropTypes from 'prop-types';
import { useOrganization } from '@/common/components/Organization/OrganizationProvider';
import OrganizationHeader from './OrganizationHeader';
import OrganizationSidebar from './OrganizationSidebar';

export default function OrganizationLayout({ children, organization }) {
  const { primaryColor, secondaryColor } = useOrganization();

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{
        '--org-primary': primaryColor,
        '--org-secondary': secondaryColor,
      }}
    >
      {/* Organization Header */}
      <OrganizationHeader organization={organization} />

      <div className="flex">
        {/* Organization Sidebar */}
        <OrganizationSidebar organization={organization} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

OrganizationLayout.propTypes = {
  children: PropTypes.node.isRequired,
  organization: PropTypes.object,
};
