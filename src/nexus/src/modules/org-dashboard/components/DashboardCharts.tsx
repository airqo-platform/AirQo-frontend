'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { ErrorState } from '@/shared/components/ui/error-state';
import { LoadingState } from '@/shared/components/ui/loading-state';
import ReusableDialog from '@/shared/components/ui/dialog';
import { AqPlus, AqTrash01 } from '@airqo/icons-react';
import { useChartManagement } from '@/modules/analytics/hooks/useChartManagement';
import { AnalyticsChartCard } from '@/modules/analytics/components/explorer/AnalyticsChartCard';
import { ChartConfigDialog } from '@/modules/analytics/components/explorer/ChartConfigDialog';

interface DashboardChartsProps {
  groupId: string;
  className?: string;
}

/**
 * Organization dashboard charts section — renders the group's configured
 * charts as a list (default view uses the group's saved chart preferences),
 * with a "Manage charts" flow to create/edit/duplicate/delete — reusing the
 * analytics module's chart machinery via `useChartManagement`.
 */
export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  groupId,
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
    openCreate,
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
  } = useChartManagement(groupId, !!groupId);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">Charts</h2>
        {charts.length > 0 && (
          <Button
            variant="filled"
            size="md"
            Icon={AqPlus}
            onClick={openCreate}
            disabled={!groupId}
            showTextOnMobile
          >
            Manage charts
          </Button>
        )}
      </div>

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
          action={{ label: 'Create chart', onClick: openCreate }}
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
