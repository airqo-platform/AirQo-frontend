import React from 'react';
import { Tooltip } from 'flowbite-react';
import { Button } from '@/shared/components/ui';
import {
  AqAnnotationX,
  AqDownload01,
  AqRefreshCcw01,
  AqHelpCircle,
} from '@airqo/icons-react';
import { TabType } from '../types/dataExportTypes';

interface DataExportHeaderProps {
  activeTab: TabType;
  selectedSiteIds: string[];
  selectedDeviceIds: string[];
  selectedGridIds: string[];
  selectedGridSiteIds: Record<string, string[]>;
  isDownloadReady: boolean;
  isDownloading: boolean;
  isPreviewLoading?: boolean;
  isGroupSyncing?: boolean;
  canDownload?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onTabChange: (tab: TabType) => void;
  onClearSelections: () => void;
  onVisualizeData: () => void;
  onDownload: () => void;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
  isOrgFlow?: boolean;
  showHelpBanner?: boolean;
  onToggleHelpBanner?: () => void;
  selectionCount?: number;
}

/**
 * Header component with tabs and action buttons
 */
export const DataExportHeader: React.FC<DataExportHeaderProps> = ({
  activeTab,
  selectedSiteIds,
  selectedDeviceIds,
  selectedGridIds,
  selectedGridSiteIds,
  isDownloadReady,
  isDownloading,
  isPreviewLoading = false,
  isGroupSyncing = false,
  canDownload = true,
  onRefresh,
  isRefreshing = false,
  onTabChange,
  onClearSelections,
  onVisualizeData,
  onDownload,
  onToggleSidebar,
  sidebarOpen = false,
  isOrgFlow = false,
  showHelpBanner = true,
  onToggleHelpBanner,
  selectionCount = 0,
}) => {
  const hasSelections =
    selectedSiteIds.length > 0 ||
    selectedDeviceIds.length > 0 ||
    selectedGridIds.length > 0 ||
    Object.keys(selectedGridSiteIds).length > 0;

  const totalSelectionCount =
    selectedSiteIds.length +
    selectedDeviceIds.length +
    selectedGridIds.length;

  const handleClearClick = () => {
    if (totalSelectionCount > 5) {
      const confirmed = window.confirm(
        `You have ${totalSelectionCount} items selected. Are you sure you want to clear all selections?`
      );
      if (!confirmed) return;
    }
    onClearSelections();
  };

  const reviewDownloadTooltip = isDownloadReady
    ? 'Preview your export before downloading'
    : 'Select a date range, location, and pollutant to enable download';

  return (
    <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-4 min-w-0">
      <div className="flex items-start gap-4 w-full min-w-0 xl:w-auto">
        {/* Sidebar Toggle - Hidden on desktop */}
        {onToggleSidebar && (
          <div className="block lg:hidden">
            <Button
              variant="outlined"
              size="sm"
              onClick={onToggleSidebar}
              className="flex-shrink-0"
            >
              <span className="sr-only">
                {sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              </span>
              {sidebarOpen ? '✕' : '☰'}
            </Button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 gap-x-2 overflow-visible scrollbar-hide mt-2 lg:mt-0 min-w-0">
          <Button
            variant={activeTab === 'sites' ? 'filled' : 'outlined'}
            onClick={() => onTabChange('sites')}
            disabled={isGroupSyncing}
            className="flex-shrink-0"
          >
            Sites
          </Button>
          <Button
            variant={activeTab === 'devices' ? 'filled' : 'outlined'}
            onClick={() => onTabChange('devices')}
            disabled={isGroupSyncing}
            className="flex-shrink-0"
          >
            Devices
          </Button>
          {!isOrgFlow && (
            <>
              <Button
                variant={activeTab === 'countries' ? 'filled' : 'outlined'}
                onClick={() => onTabChange('countries')}
                disabled={isGroupSyncing}
                className="flex-shrink-0"
              >
                Countries
              </Button>
              <Button
                variant={activeTab === 'cities' ? 'filled' : 'outlined'}
                onClick={() => onTabChange('cities')}
                disabled={isGroupSyncing}
                className="flex-shrink-0"
              >
                Cities
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:flex xl:flex-wrap gap-2 w-full min-w-0 xl:w-auto mt-3 xl:mt-0">
        {!showHelpBanner && onToggleHelpBanner && (
          <Tooltip content="Show getting-started tips" placement="top">
            <span className="inline-flex w-full xl:w-auto">
              <Button
                variant="outlined"
                onClick={onToggleHelpBanner}
                Icon={AqHelpCircle}
                size="sm"
                className="px-4 py-2 w-full xl:w-auto"
              >
                Show Tips
              </Button>
            </span>
          </Tooltip>
        )}
        {onRefresh && (
          <Button
            variant="outlined"
            onClick={onRefresh}
            Icon={AqRefreshCcw01}
            loading={isRefreshing}
            disabled={isGroupSyncing || isRefreshing}
            size="sm"
            className="px-4 py-2 w-full xl:w-auto"
          >
            Refresh
          </Button>
        )}
        {hasSelections && (
          <Button
            variant="outlined"
            onClick={handleClearClick}
            Icon={AqAnnotationX}
            disabled={isGroupSyncing}
            className="px-4 py-2 w-full xl:w-auto"
          >
            Clear All
          </Button>
        )}
        <Button
          variant="outlined"
          onClick={onVisualizeData}
          disabled={
            isGroupSyncing ||
            (activeTab === 'sites' && selectedSiteIds.length === 0) ||
            (activeTab === 'devices' && selectedDeviceIds.length === 0) ||
            ((activeTab === 'countries' || activeTab === 'cities') &&
              selectedGridIds.length === 0)
          }
          className="px-4 py-2 w-full xl:w-auto"
        >
          Visualize Data
        </Button>
        {/* Preview button removed: preview shown via Review & Download flow */}
        {canDownload && (
          <Tooltip content={reviewDownloadTooltip} placement="top">
            <span className="inline-flex w-full xl:w-auto">
              <Button
                variant="filled"
                onClick={onDownload}
                Icon={AqDownload01}
                className="px-4 py-2 w-full xl:w-auto"
                disabled={isGroupSyncing || !isDownloadReady || isPreviewLoading || isDownloading}
                loading={isPreviewLoading || isDownloading}
              >
                {isPreviewLoading
                  ? 'Loading preview...'
                  : isDownloading
                    ? 'Downloading...'
                    : selectionCount > 0
                      ? `Review & Download (${selectionCount})`
                      : 'Review & Download'}
              </Button>
            </span>
          </Tooltip>
        )}
      </div>
    </div>
  );
};
