'use client';

import React from 'react';
import { useOrganization } from '@/app/providers/OrganizationProvider';
import AuthenticatedSideBar from '@/components/SideBar/AuthenticatedSidebar';
import OrganizationSidebarContent from '@/components/SideBar/OrganizationSidebarContent';
import { useSelector } from 'react-redux';

export default function OrganizationSidebar({ organization }) {
  const { logo } = useOrganization();
  const isCollapsed = useSelector((state) => state.sidebar.isCollapsed);

  const logoComponent = logo ? (
    <img
      src={logo}
      alt={`${organization?.name} logo`}
      className="w-[46.56px] h-8 object-contain"
      onError={(e) => {
        e.target.src = '/icons/airqo_logo.svg';
      }}
    />
  ) : null;

  return (
    <AuthenticatedSideBar
      showOrganizationDropdown={false}
      logoComponent={logoComponent}
      homeNavPath={`/org/${organization?.slug || ''}/dashboard`}
    >
      <OrganizationSidebarContent isCollapsed={isCollapsed} />
    </AuthenticatedSideBar>
  );
}
