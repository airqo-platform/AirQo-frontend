import React, { type ReactNode } from 'react';
import { OrgCohortProvider } from '@/shared/providers/org-cohort-provider';

interface OrgPagesLayoutProps {
  children: ReactNode;
  params: {
    org_slug: string;
  };
}

/**
 * Org-shell layout. Wraps every org page (dashboard, data-export, map) in the
 * org-wide cohort context so a single cohort selection in the header drives
 * them all. Sits above the existing layout1/layout2 shells rather than
 * duplicating them.
 */
const OrgPagesLayout = ({ children, params }: OrgPagesLayoutProps) => {
  return (
    <OrgCohortProvider organizationSlug={params.org_slug}>
      {children}
    </OrgCohortProvider>
  );
};

export default OrgPagesLayout;
