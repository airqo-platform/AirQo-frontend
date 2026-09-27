'use client';

import * as React from 'react';
import { usePostHog } from 'posthog-js/react';
import { useUser, useOrgGroup } from '@/shared/hooks';
import { AccessDenied } from '@/shared/components/AccessDenied';
import { DashboardHeader } from './components/DashboardHeader';
import { OrganizationReportDashboard } from './components/OrganizationReportDashboard';
import { OrgDashboardSkeleton } from './components/OrgDashboardSkeleton';

interface OrgDashboardProps {
  organizationSlug: string;
  className?: string;
}

export const OrgDashboard: React.FC<OrgDashboardProps> = ({
  organizationSlug,
  className = '',
}) => {
  const posthog = usePostHog();
  const { activeGroup, isLoading: userContextLoading } = useUser();
  const hasTrackedViewRef = React.useRef(false);
  const {
    organizationGroup,
    organizationGroupId,
    isInitialLoading: orgGroupLoading,
  } = useOrgGroup({ organizationSlug, isOrganizationFlow: true });

  const unresolvedOrganizationSlug =
    !!organizationSlug.trim().toLowerCase() &&
    !userContextLoading &&
    !organizationGroupId;
  const isOrgContextReady =
    !!organizationGroupId && activeGroup?.id === organizationGroupId;
  const isOrgSyncing =
    !userContextLoading && !unresolvedOrganizationSlug && !isOrgContextReady;
  const isInitialLoading =
    userContextLoading || orgGroupLoading || isOrgSyncing;

  React.useEffect(() => {
    if (isInitialLoading || hasTrackedViewRef.current) return;
    hasTrackedViewRef.current = true;
    posthog?.capture('organization_dashboard_viewed', {
      organization_group_id: organizationGroup?.id,
      organization_group_name: organizationGroup?.title,
    });
  }, [
    isInitialLoading,
    organizationGroup?.id,
    organizationGroup?.title,
    posthog,
  ]);

  if (unresolvedOrganizationSlug) {
    return (
      <div className={`min-h-[400px] ${className}`}>
        <AccessDenied
          title="Organization not found"
          message="We could not resolve that organization slug or you do not have access to it."
          showBackButton={false}
        />
      </div>
    );
  }

  if (isInitialLoading) {
    return <OrgDashboardSkeleton className={className} />;
  }

  return (
    <div className={`space-y-5 ${className}`}>
      <DashboardHeader
        organizationTitle={organizationGroup?.title ?? 'Organization'}
        description="Cohort-level air quality trends and coverage for this organization."
      />
      <OrganizationReportDashboard
        organizationTitle={organizationGroup?.title ?? 'Organization'}
      />
    </div>
  );
};
