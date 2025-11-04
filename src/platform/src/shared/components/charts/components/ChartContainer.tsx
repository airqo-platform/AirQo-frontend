'use client';

import React, { useState } from 'react';
import { HiChevronDown } from 'react-icons/hi';
import {
  AqRefreshCcw01,
  AqDownload01,
  AqAtom02,
  AqFileShield02,
  AqBarChartSquareUp,
} from '@airqo/icons-react';

import {
  ChartContainerProps,
  ChartType,
  AirQualityStandardsConfig,
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/shared/components/ui/dropdown-menu';
import { LoadingSpinner } from '@/shared/components/ui/loading-spinner';
import { cn } from '@/shared/lib/utils';
import { toast } from '@/shared/components/ui/toast';

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
  currentSites,
  className,
  loading = false,
  error = null,
  showTitle = true,
  showMoreButton = true,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showStandardsDialog, setShowStandardsDialog] = useState(false);
  const [currentStandards, setCurrentStandards] =
    useState<AirQualityStandardsConfig>();
  const [showReferenceLines, setShowReferenceLines] = useState(
    initialShowReferenceLines
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { exportRef, exportChart } = useChartExport();

  // Close dropdown when loading, refreshing, or error states occur
  React.useEffect(() => {
    if (loading || isRefreshing || error) {
      setIsDropdownOpen(false);
    }
  }, [loading, isRefreshing, error]);

  const handleExport = async (format: 'pdf' | 'png') => {
    if (!exportOptions.filename) return;

    setIsExporting(true);
    try {
      await exportChart({
        format,
        filename: `${exportOptions.filename}-${Date.now()}`,
        quality: 0.9,
      });
      toast.success(`Chart exported as ${format.toUpperCase()} successfully`);
    } catch (error) {
      console.error('Export failed:', error);
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
        console.error('Refresh error:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  const handleAirQualityStandards = () => {
    if (onAirQualityStandards) {
      onAirQualityStandards();
    } else {
      setShowStandardsDialog(true);
    }
  };

  const handleApplyStandards = (config: AirQualityStandardsConfig) => {
    setCurrentStandards(config);
    setShowReferenceLines(config.showReferenceLine ?? true);
    toast.success(
      `Applied ${config.organization} standards for ${config.pollutant}`
    );
  };

  // Typed standards organization for child props
  const currentStandardsOrg: 'WHO' | 'NEMA' =
    (currentStandards?.organization as 'WHO' | 'NEMA') || 'WHO';

  return (
    <Card className={cn('w-full', className)}>
      {(showTitle || showMoreButton) && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          {showTitle && (
            <div className="space-y-1">
              <CardTitle className="text-xl text-foreground">{title}</CardTitle>
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
          )}

          {/* More dropdown menu */}
          {showMoreButton && (
            <DropdownMenu
              key={showStandardsDialog ? 'closed' : 'open'}
              open={isDropdownOpen}
              onOpenChange={setIsDropdownOpen}
            >
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    'flex items-center space-x-1 px-3 py-2 text-sm font-medium text-muted-foreground',
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
                <div className="py-1">
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
                            {Object.entries(CHART_TYPE_LABELS).map(
                              ([type, label]) => (
                                <button
                                  key={type}
                                  onClick={() =>
                                    onChartTypeChange(type as ChartType)
                                  }
                                  className={cn(
                                    'flex items-center w-full px-2 py-1 text-xs rounded transition-colors',
                                    currentChartType === type
                                      ? 'bg-primary text-primary-foreground'
                                      : 'text-foreground hover:bg-muted'
                                  )}
                                >
                                  {label}
                                </button>
                              )
                            )}
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
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardHeader>
      )}

      {/* Filters Section */}
      {onFiltersChange && currentFilters && (
        <ChartFiltersComponent
          filters={currentFilters}
          onFiltersChange={onFiltersChange}
        />
      )}

      <CardContent ref={exportRef} className="pl-1 pb-2 flex-1">
        <div className="w-full h-full flex justify-center items-center min-h-[400px]">
          {error && (
            <div className="flex items-center justify-center h-64 text-destructive">
              <div className="text-center">
                <p className="text-lg font-medium">Error loading chart</p>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
                {onRefresh && (
                  <button
                    onClick={handleRefresh}
                    className="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </div>
          )}

          {loading && !error && (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center space-y-3">
                <LoadingSpinner />
                <p className="text-sm text-muted-foreground">
                  Loading chart data...
                </p>
              </div>
            </div>
          )}

          {!loading && !error && React.isValidElement(children)
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
            : !loading && !error && children}

          {/* Export loading overlay */}
          {isExporting && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="flex flex-col items-center space-y-3">
                <LoadingSpinner />
                <p className="text-sm text-muted-foreground">
                  Exporting chart...
                </p>
              </div>
            </div>
          )}

          {/* Refresh loading indicator */}
          {isRefreshing && (
            <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border z-20">
              <div className="flex items-center space-x-2">
                <LoadingSpinner className="h-4 w-4" />
                <p className="text-xs text-muted-foreground">
                  Refreshing data...
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>

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
