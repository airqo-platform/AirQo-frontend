'use client';

import * as React from 'react';
import { useState } from 'react';
import { usePostHog } from 'posthog-js/react';
import { useUser, useOrgGroup } from '@/shared/hooks';
import { useAqiConfig } from '@/shared/providers/aqi-config-provider';
import { AccessDenied } from '@/shared/components/AccessDenied';
import { AqiLegend } from '@/modules/analytics';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { AqPlus } from '@airqo/icons-react';
import { AiDrawerTrigger } from '@/modules/ai/components/AiDrawerTrigger';
import { useChartManagement } from '@/modules/analytics/hooks/useChartManagement';
import { ComparisonView } from '@/modules/analytics/components/comparison';
import { SegmentedTabs } from '@/shared/components/ui/segmented-tabs';
import { DashboardHeader } from './components/DashboardHeader';
import { DashboardCharts } from './components/DashboardCharts';
import { SavedPreferencesSection } from './components/SavedPreferencesSection';
import { OrgDashboardSkeleton } from './components/OrgDashboardSkeleton';

type AnalysisTab = 'trends' | 'comparison';

const ANALYSIS_TAB_STORAGE_KEY = 'nexus:org-dashboard:analysis-tab';

const ANALYSIS_TAB_OPTIONS: { value: AnalysisTab; label: string }[] = [
  { value: 'trends', label: 'Trends' },
  { value: 'comparison', label: 'Comparison' },
];

// Lazy-init the analytics tab from localStorage so a returning visitor keeps
// their last view; anything unrecognized falls back to 'trends' so a stale or
// corrupt stored value can never break the page.
const readStoredAnalysisTab = (): AnalysisTab => {
  if (typeof window === 'undefined') return 'trends';
  try {
    const stored = window.localStorage.getItem(ANALYSIS_TAB_STORAGE_KEY);
    return stored === 'comparison' ? 'comparison' : 'trends';
  } catch {
    return 'trends';
  }
};

interface OrgDashboardProps {
  organizationSlug: string;
  className?: string;
}

/**
 * Organization dashboard — renders an empty-state header for the org
 * and a unified "Air Quality Analysis" section combining saved locations
 * and user-configured charts.
 */
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

  const { config: selectedAqiConfig } = useAqiConfig('pm2_5');

  // Trends (saved locations + charts) and Comparison are mutually exclusive
  // views of the "Air Quality Analysis" section; persist the choice so a
  // returning visitor lands on the same tab.
  const [analysisTab, setAnalysisTab] = useState<AnalysisTab>(
    readStoredAnalysisTab
  );

  const handleAnalysisTabChange = (tab: AnalysisTab) => {
    setAnalysisTab(tab);
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(ANALYSIS_TAB_STORAGE_KEY, tab);
    } catch {
      /* storage unavailable (private mode) — keep session-only state */
    }
  };

  // Call unconditionally — the hook's `enabled` param handles the not-ready state.
  const chartMgmt = useChartManagement(
    organizationGroupId,
    !!organizationGroupId
  );

  const isOrgContextReady =
    !!organizationGroupId && activeGroup?.id === organizationGroupId;

  const unresolvedOrganizationSlug =
    !!organizationSlug.trim().toLowerCase() &&
    !userContextLoading &&
    !organizationGroupId;

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
      />
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-medium text-foreground">
            Air Quality Analysis
          </h2>
          {analysisTab === 'trends' && (
            <div className="flex items-center gap-2">
              {chartMgmt.charts.length > 0 && (
                <Button
                  variant="filled"
                  size="md"
                  Icon={AqPlus}
                  onClick={chartMgmt.openCreate}
                  disabled={!organizationGroupId}
                  showTextOnMobile
                >
                  Add chart
                </Button>
              )}
              <AiDrawerTrigger />
            </div>
          )}
        </div>
        <Card className="w-fit">
          <CardContent className="p-2">
            <SegmentedTabs
              ariaLabel="Air Quality Analysis views"
              options={ANALYSIS_TAB_OPTIONS}
              value={analysisTab}
              onChange={handleAnalysisTabChange}
            />
          </CardContent>
        </Card>
        {analysisTab === 'trends' ? (
          <>
            <SavedPreferencesSection groupId={organizationGroupId} />
            <DashboardCharts
              groupId={organizationGroupId}
              chartMgmt={chartMgmt}
            />
            {/* Page-level legend is trends-only — ComparisonView ships its
                own, and rendering both would duplicate the color scale. */}
            <AqiLegend aqiConfig={selectedAqiConfig} className="pt-2" />
          </>
        ) : (
          <ComparisonView
            groupId={organizationGroupId}
            isOrganizationFlow
            organizationSlug={organizationSlug}
          />
        )}
      </section>
    </div>
  );
};
