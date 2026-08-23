'use client';

import React, { useState } from 'react';
import { HiChevronDown } from 'react-icons/hi';
import {
  AqRefreshCcw01,
  AqDownload01,
  AqAtom02,
  AqFileShield02,
  AqBarChartSquareUp,
  AqEdit02,
  AqCheck,
  AqXClose,
  AqPalette,
} from '@airqo/icons-react';

import {
  ChartContainerProps,
  ChartType,
  AirQualityStandardsConfig,
  StandardsType,
} from '../types';
import { useChartExport } from '../hooks/useChartExport';
import { StandardsDialog } from './ui/StandardsDialog';
import { ChartFiltersComponent } from './ui/ChartFilters';
import { CHART_TYPE_LABELS } from '../constants';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/shared/components/ui/card';
import { SegmentedTabs } from '@/shared/components/ui/segmented-tabs';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/shared/components/ui/dropdown-menu';
import { LoadingSpinner } from '@/shared/components/ui/loading-spinner';
import { cn } from '@/shared/lib/utils';
import { toast } from '@/shared/components/ui/toast';
import { STANDARDS_ORGANIZATIONS } from '@/shared/utils/airQuality';
import { usePostHog } from 'posthog-js/react';
import { trackEvent } from '@/shared/utils/analytics';

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  children,
  exportOptions = {
    enablePDF: true,
    enablePNG: true,
    filename: 'air-quality-chart',
  },
  onRefresh,
  onMoreInsights,
  onAirQualityStandards,
  onChartTypeChange,
  currentChartType,
  autoSelectChart = true,
  onAutoSelectToggle,
  onFiltersChange,
  currentFilters,
  showReferenceLines: initialShowReferenceLines = true,
  onReferenceLinesToggle,
  themeColors = false,
  onThemeColorsToggle,
  onStandardsChange,
  selectedStandards,
  currentSites,
  className,
  loading = false,
  error = null,
  showTitle = true,
  showMoreButton = true,
  onEditTitle,
  menuItems,
  footerHint,
  toolbar,
  toolbarActions,
  periodPresets,
  activePeriod,
  onPeriodChange,
  minContentHeight = '400px',
}) => {
  const posthog = usePostHog();
  const [isExporting, setIsExporting] = useState(false);
  const [showStandardsDialog, setShowStandardsDialog] = useState(false);
  const [currentStandards, setCurrentStandards] = useState<
    AirQualityStandardsConfig | undefined
  >(() =>
    selectedStandards
      ? {
          organization: selectedStandards,
          pollutant: 'PM2.5',
          showReferenceLine: initialShowReferenceLines,
        }
      : undefined
  );
  const [showReferenceLines, setShowReferenceLines] = useState(
    initialShowReferenceLines
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const [draftSubtitle, setDraftSubtitle] = useState(subtitle ?? '');
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const { exportRef, exportChart } = useChartExport();

  // Close dropdown when loading, refreshing, or error states occur
  React.useEffect(() => {
    if (loading || isRefreshing || error) {
      setIsDropdownOpen(false);
    }
  }, [loading, isRefreshing, error]);

  // Keep edit drafts in sync with the controlled title/subtitle
  React.useEffect(() => {
    if (!isEditingTitle) {
      setDraftTitle(title);
      setDraftSubtitle(subtitle ?? '');
    }
  }, [isEditingTitle, subtitle, title]);

  const handleExport = async (format: 'pdf' | 'png') => {
    if (!exportOptions.filename) return;

    posthog?.capture('chart_export_clicked', {
      format,
      chart_title: title,
    });

    trackEvent('chart_export_clicked', {
      format,
      chart_title: title,
    });

    setIsExporting(true);
    try {
      await exportChart({
        format,
        filename: `${exportOptions.filename}-${Date.now()}`,
        quality: 0.9,
      });
      toast.success(`Chart exported as ${format.toUpperCase()} successfully`);
    } catch (error) {
      console.error(
        'Export failed:',
        error instanceof Error ? error.message : error
      );
      toast.error(`Failed to export chart as ${format.toUpperCase()}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
        toast.success('Data refreshed');
      } catch (error) {
        toast.error('Failed to refresh data');
        console.error(
          'Refresh error:',
          error instanceof Error ? error.message : error
        );
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  const handleStartEditTitle = () => {
    setDraftTitle(title);
    setDraftSubtitle(subtitle ?? '');
    setIsDropdownOpen(false);
    setIsEditingTitle(true);
  };

  const handleSaveTitle = async () => {
    if (!onEditTitle || isSavingTitle) return;

    const nextTitle = draftTitle.trim();
    if (!nextTitle) {
      toast.error('Chart title cannot be empty');
      return;
    }

    setIsSavingTitle(true);
    try {
      await onEditTitle(nextTitle, draftSubtitle.trim());
      setIsEditingTitle(false);
      toast.success('Chart title updated');
    } catch (error) {
      console.error(
        'Failed to update chart title:',
        error instanceof Error ? error.message : error
      );
      toast.error('Failed to update chart title');
    } finally {
      setIsSavingTitle(false);
    }
  };

  const handleAirQualityStandards = () => {
    posthog?.capture('air_quality_standards_clicked', {
      chart_title: title,
    });

    trackEvent('air_quality_standards_clicked', {
      chart_title: title,
    });

    if (onAirQualityStandards) {
      onAirQualityStandards();
    } else {
      setShowStandardsDialog(true);
    }
  };

  const handleApplyStandards = (config: AirQualityStandardsConfig) => {
    posthog?.capture('air_quality_standards_applied', {
      organization: config.organization,
      pollutant: config.pollutant,
    });

    trackEvent('air_quality_standards_applied', {
      organization: config.organization,
      pollutant: config.pollutant,
    });

    setCurrentStandards(config);
    setShowReferenceLines(config.showReferenceLine ?? true);
    onStandardsChange?.(config.organization);
    toast.success(
      `Applied ${STANDARDS_ORGANIZATIONS[config.organization]} standards for ${config.pollutant}`
    );
  };

  // Keep the standards state in sync when the parent changes the selection
  // (e.g. switching charts) — the dialog only re-seeds itself from
  // `currentStandards`, which lives here.
  React.useEffect(() => {
    if (!selectedStandards) return;
    setCurrentStandards(prev =>
      prev?.organization === selectedStandards
        ? prev
        : {
            organization: selectedStandards,
            pollutant: prev?.pollutant ?? 'PM2.5',
            showReferenceLine:
              prev?.showReferenceLine ?? initialShowReferenceLines,
          }
    );
  }, [initialShowReferenceLines, selectedStandards]);

  // Typed standards organization for child props
  const currentStandardsOrg: StandardsType =
    (currentStandards?.organization as StandardsType) || 'WHO';

  // The full "More" menu. Rendered in the header by default; when a toolbar
  // is provided it moves to the right side of the toolbar row instead.
  const renderMoreDropdown = () => (
    <DropdownMenu
      key={showStandardsDialog ? 'closed' : 'open'}
      open={isDropdownOpen}
      onOpenChange={setIsDropdownOpen}
    >
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'flex items-center border shadow-sm space-x-1 px-3 py-2 text-sm font-medium text-muted-foreground',
            'hover:text-foreground hover:bg-muted rounded-md transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary/20'
          )}
          disabled={isExporting}
        >
          <span>More</span>
          <HiChevronDown className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <div
          className="py-1"
          onClickCapture={() => {
            // Close the menu AFTER the clicked item's own onClick has
            // run. Closing synchronously here unmounts the item before
            // its handler fires, silently swallowing Edit/Delete/etc.
            setTimeout(() => setIsDropdownOpen(false), 0);
          }}
        >
          {/* Custom actions (edit/delete chart, etc.) */}
          {menuItems && (
            <>
              {menuItems}
              <div className="border-t border-border my-1" />
            </>
          )}

          {/* Edit title & subtitle */}
          {onEditTitle && (
            <button
              onClick={handleStartEditTitle}
              className="flex items-center w-full px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <AqEdit02 className="h-4 w-4 mr-2" />
              Edit title &amp; subtitle
            </button>
          )}

          {/* Refresh Data */}
          {onRefresh && (
            <button
              onClick={handleRefresh}
              className="flex items-center w-full px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <AqRefreshCcw01 className="h-4 w-4 mr-2" />
              Refresh Data
            </button>
          )}

          {/* Export Options */}
          {exportOptions.enablePDF && (
            <button
              onClick={() => handleExport('pdf')}
              disabled={isExporting}
              className="flex items-center w-full px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              type="button"
            >
              <AqDownload01 className="h-4 w-4 mr-2" />
              Export as PDF
            </button>
          )}

          {exportOptions.enablePNG && (
            <button
              onClick={() => handleExport('png')}
              disabled={isExporting}
              className="flex items-center w-full px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              type="button"
            >
              <AqDownload01 className="h-4 w-4 mr-2" />
              Export as PNG
            </button>
          )}

          {/* Separator */}
          {(exportOptions.enablePDF || exportOptions.enablePNG) &&
            (onMoreInsights || onAirQualityStandards) && (
              <div className="border-t border-border my-1" />
            )}

          {/* More Insights */}
          {onMoreInsights && (
            <button
              onClick={() => onMoreInsights(currentSites)}
              className="flex items-center w-full px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <AqBarChartSquareUp className="h-4 w-4 mr-2" />
              More Insights
            </button>
          )}

          {/* Chart Type Selection */}
          {onChartTypeChange && (
            <>
              <div className="px-3 py-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Chart Type
                </p>
              </div>

              {/* Auto Select Toggle */}
              <button
                onClick={onAutoSelectToggle}
                className="flex items-center w-full px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <AqAtom02 className="h-4 w-4 mr-2" />
                Auto Select: {autoSelectChart ? 'On' : 'Off'}
              </button>

              {/* Chart Type Options */}
              {!autoSelectChart && (
                <div className="px-3 py-1">
                  <div className="space-y-1">
                    {Object.entries(CHART_TYPE_LABELS)
                      .filter(([type]) => type !== 'area')
                      .map(([type, label]) => (
                        <button
                          key={type}
                          onClick={() => onChartTypeChange(type as ChartType)}
                          className={cn(
                            'flex items-center w-full px-2 py-1 text-xs rounded transition-colors',
                            currentChartType === type
                              ? 'bg-primary text-primary-foreground'
                              : 'text-foreground hover:bg-muted'
                          )}
                        >
                          {label}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              <div className="border-t border-border my-1" />
            </>
          )}

          {/* Air Quality Standards */}
          <button
            onClick={handleAirQualityStandards}
            className="flex items-center w-full px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
          >
            <AqFileShield02 className="h-4 w-4 mr-2" />
            Air Quality Standards
          </button>

          {/* Reference Lines Toggle */}
          <button
            onClick={() => {
              setShowReferenceLines(prev => {
                const next = !prev;
                onReferenceLinesToggle?.(next);
                return next;
              });
            }}
            className="flex items-center w-full px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
          >
            Reference Lines: {showReferenceLines ? 'On' : 'Off'}
          </button>

          {/* Theme Colors Toggle — shades of the active theme vs fixed palette */}
          {onThemeColorsToggle && (
            <button
              onClick={onThemeColorsToggle}
              className="flex items-center w-full px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <AqPalette className="h-4 w-4 mr-2" />
              Theme colors: {themeColors ? 'On' : 'Off'}
            </button>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <Card className={cn('w-full', className)}>
      {/* Toolbar section at the TOP of the card: custom content left, actions
          + More right, separator line below (before the title/subtitle).
          Interactive chrome — excluded from chart exports. */}
      {toolbar && (
        <div
          className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2.5 border-b border-border px-4 py-2.5"
          data-export-ignore
          data-html2canvas-ignore="true"
        >
          <div className="flex min-w-0 flex-wrap items-center gap-x-5 gap-y-2">
            {periodPresets && onPeriodChange && (
              <SegmentedTabs
                ariaLabel="Chart time range"
                size="sm"
                options={periodPresets.map(preset => ({
                  value: preset.value,
                  label: preset.label,
                }))}
                value={activePeriod ?? periodPresets[0]?.value ?? ''}
                onChange={onPeriodChange}
              />
            )}
            {toolbar}
          </div>
          <div className="flex items-center gap-4">
            {toolbarActions}
            {showMoreButton && renderMoreDropdown()}
          </div>
        </div>
      )}

      {/* Period presets without a custom toolbar — their own compact row. */}
      {!toolbar &&
        periodPresets &&
        periodPresets.length > 0 &&
        onPeriodChange && (
          <div
            className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2"
            data-export-ignore
            data-html2canvas-ignore="true"
          >
            <SegmentedTabs
              ariaLabel="Chart time range"
              size="sm"
              options={periodPresets.map(preset => ({
                value: preset.value,
                label: preset.label,
              }))}
              value={activePeriod ?? periodPresets[0]?.value ?? ''}
              onChange={onPeriodChange}
            />
          </div>
        )}

      {/* Export root: the shareable image is the header (title/subtitle) plus
          the chart itself (legend included). Everything interactive inside
          here — More menu, filters, edit form, footer actions — is marked
          export-ignored. */}
      <div ref={exportRef} data-export-root className="flex min-w-0 flex-col">
        {(showTitle || (showMoreButton && !toolbar)) && (
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4 gap-3">
            {showTitle &&
              (isEditingTitle ? (
                /* Inline title/subtitle editor */
                <div
                  className="flex-1 min-w-0 space-y-2"
                  data-export-ignore
                  data-html2canvas-ignore="true"
                >
                  <Input
                    label="Title"
                    aria-label="Chart title"
                    value={draftTitle}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setDraftTitle(event.target.value)
                    }
                    maxLength={80}
                  />
                  <Input
                    label="Subtitle"
                    aria-label="Chart subtitle"
                    value={draftSubtitle}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setDraftSubtitle(event.target.value)
                    }
                    maxLength={120}
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      variant="filled"
                      size="sm"
                      Icon={AqCheck}
                      onClick={() => void handleSaveTitle()}
                      loading={isSavingTitle}
                      disabled={isSavingTitle}
                    >
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      Icon={AqXClose}
                      onClick={() => setIsEditingTitle(false)}
                      disabled={isSavingTitle}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="min-w-0 space-y-1 flex-1">
                  <CardTitle className="text-lg text-foreground truncate">
                    {title}
                  </CardTitle>
                  {subtitle && (
                    <p className="text-sm text-muted-foreground truncate">
                      {subtitle}
                    </p>
                  )}
                </div>
              ))}

            {/* More dropdown menu — in the header unless a toolbar is present.
              Interactive chrome — excluded from chart exports. */}
            {showMoreButton && !toolbar && (
              <div data-export-ignore data-html2canvas-ignore="true">
                {renderMoreDropdown()}
              </div>
            )}
          </CardHeader>
        )}

        {/* Filters Section — interactive chrome, excluded from chart exports */}
        {onFiltersChange && currentFilters && (
          <div data-export-ignore data-html2canvas-ignore="true">
            <ChartFiltersComponent
              filters={currentFilters}
              onFiltersChange={onFiltersChange}
            />
          </div>
        )}

        <CardContent
          className={cn(
            'px-1 pb-2 flex-1',
            !showTitle && !showMoreButton && 'pt-3'
          )}
        >
          <div
            className="relative w-full min-w-0"
            style={{ minHeight: minContentHeight }}
          >
            {error && (
              <div className="flex items-center justify-center h-64 text-destructive">
                <div className="text-center">
                  <p className="text-lg font-medium">Error loading chart</p>
                  <p className="text-sm text-muted-foreground mt-1">{error}</p>
                  {onRefresh && (
                    <Button
                      onClick={handleRefresh}
                      className="mt-3"
                      loading={isRefreshing}
                    >
                      Try Again
                    </Button>
                  )}
                </div>
              </div>
            )}

            {!error && (
              <div
                className="w-full h-full min-w-0"
                style={{ minHeight: minContentHeight }}
              >
                {React.isValidElement(children)
                  ? React.cloneElement(
                      children as React.ReactElement<{
                        showReferenceLines?: boolean;
                        standards?: string;
                      }>,
                      {
                        showReferenceLines,
                        standards: currentStandardsOrg,
                      }
                    )
                  : children}
              </div>
            )}

            {loading && !error && (
              <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-40"
                role="status"
                aria-live="polite"
                data-export-ignore
              >
                <div className="flex flex-col items-center space-y-3">
                  <LoadingSpinner />
                  <p className="text-sm text-muted-foreground">
                    Loading chart data...
                  </p>
                </div>
              </div>
            )}

            {/* Export loading overlay */}
            {isExporting && (
              <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
                data-export-ignore
              >
                <div className="flex flex-col items-center space-y-3">
                  <LoadingSpinner />
                  <p className="text-sm text-muted-foreground">
                    Exporting chart...
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer hint (e.g. last update time) — interactive footer actions
            excluded from chart exports */}
          {footerHint && (
            <div
              className="px-1 pt-1 pb-0.5"
              data-export-ignore
              data-html2canvas-ignore="true"
            >
              {footerHint}
            </div>
          )}
        </CardContent>
      </div>

      {/* Standards Dialog */}
      <StandardsDialog
        open={showStandardsDialog}
        onClose={() => setShowStandardsDialog(false)}
        currentStandards={currentStandards}
        onApplyStandards={handleApplyStandards}
        activePollutant={currentFilters?.pollutant as 'pm2_5' | 'pm10'}
      />
    </Card>
  );
};
