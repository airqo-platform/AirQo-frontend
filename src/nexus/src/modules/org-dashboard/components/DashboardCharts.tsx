'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { ErrorState } from '@/shared/components/ui/error-state';
import { LoadingState } from '@/shared/components/ui/loading-state';
import ReusableDialog from '@/shared/components/ui/dialog';
import { AqTrash01 } from '@airqo/icons-react';
import { AnalyticsChartCard } from '@/modules/analytics/components/explorer/AnalyticsChartCard';
import { ChartConfigDialog } from '@/modules/analytics/components/explorer/ChartConfigDialog';
import type { UseChartManagementResult } from '@/modules/analytics/hooks/useChartManagement';

interface DashboardChartsProps {
  groupId: string;
  chartMgmt: UseChartManagementResult;
  className?: string;
}

/**
 * Organization dashboard charts section — renders the group's configured
 * charts as a list, with the chart config dialog and delete-confirmation.
 * The heading + "Add chart" button live in the parent (OrgDashboard).
 */
export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  groupId,
  chartMgmt,
  className,
}) => {
  const {
    charts,
    chartsLoading,
    chartsError,
    refetchCharts,
    siteNames,
    forecastChartIds,
    dialogOpen,
    editingDraft,
    deleteDraft,
    saveError,
    isSaving,
    openEdit,
    closeDialog,
    handleSaveDraft,
    handleRequestDelete,
    cancelDelete,
    confirmDelete,
    handleDuplicate,
    handleForecastToggle,
    handleEditTitle,
    handleNamesResolved,
  } = chartMgmt;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Body */}
      {chartsLoading && charts.length === 0 ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <LoadingState text="Loading charts..." />
        </div>
      ) : chartsError && charts.length === 0 ? (
        <ErrorState
          title="Unable to load chart configurations"
          description={
            chartsError instanceof Error
              ? chartsError.message
              : 'We could not load your saved charts.'
          }
          retryAction={{ label: 'Retry', onClick: () => void refetchCharts() }}
        />
      ) : charts.length === 0 ? (
        <EmptyState
          title="No charts yet"
          description="Create your first chart to explore air quality across locations and time periods."
          action={{ label: 'Create chart', onClick: chartMgmt.openCreate }}
        />
      ) : (
        <div className="space-y-4">
          {charts.map(draft => (
            <AnalyticsChartCard
              key={draft.id}
              draft={draft}
              groupId={groupId}
              siteNames={siteNames}
              forecastEnabled={forecastChartIds.has(draft.id)}
              onForecastToggle={() => handleForecastToggle(draft.id)}
              onEdit={openEdit}
              onRequestDelete={handleRequestDelete}
              onEditTitle={handleEditTitle}
              onDuplicate={handleDuplicate}
            />
          ))}
        </div>
      )}

      {/* Chart config dialog */}
      <ChartConfigDialog
        isOpen={dialogOpen}
        onClose={closeDialog}
        groupId={groupId}
        draft={editingDraft}
        onSave={draft => void handleSaveDraft(draft)}
        onSelectionNamesChange={handleNamesResolved}
        siteNames={siteNames}
        isSaving={isSaving}
        saveError={saveError}
      />

      {/* Delete chart confirmation */}
      <ReusableDialog
        isOpen={!!deleteDraft}
        onClose={cancelDelete}
        title="Delete chart?"
        subtitle={
          deleteDraft
            ? `"${deleteDraft.title}" will be permanently removed from your saved charts. This action cannot be undone.`
            : undefined
        }
        icon={AqTrash01}
        iconColor="text-destructive"
        iconBgColor="bg-destructive/10"
        size="sm"
        primaryAction={{
          label: 'Delete chart',
          onClick: confirmDelete,
          variant: 'danger',
        }}
        secondaryAction={{ label: 'Cancel', onClick: cancelDelete }}
      >
        <p className="text-sm text-muted-foreground">
          Are you sure you want to continue? The chart configuration and its
          saved settings will be removed.
        </p>
      </ReusableDialog>
    </div>
  );
};
