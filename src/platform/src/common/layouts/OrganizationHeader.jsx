'use client';

import React from 'react';
import TopBar from '@/components/TopBar';
import { useOrganization } from '@/app/providers/OrganizationProvider';

export default function OrganizationHeader({ organization }) {
  const { logo } = useOrganization();

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
    <TopBar
      logoComponent={logoComponent}
      homeNavPath={`/org/${organization?.slug || ''}/dashboard`}
      showMobileDrawerButton={false}
    />
  );
}
