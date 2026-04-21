import React from 'react';
import { Button } from '@/shared/components/ui';
import { AqAnnotationX, AqDownload01 } from '@airqo/icons-react';
import { TabType } from '../types/dataExportTypes';

interface DataExportHeaderProps {
  activeTab: TabType;
  selectedSiteIds: string[];
  selectedDeviceIds: string[];
  selectedGridIds: string[];
  selectedGridSiteIds: Record<string, string[]>;
  isDownloadReady: boolean;
  isDownloading: boolean;
  isGroupSyncing?: boolean;
  onTabChange: (tab: TabType) => void;
  onClearSelections: () => void;
  onVisualizeData: () => void;
  onDownload: () => void;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
  isOrgFlow?: boolean;
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
  isGroupSyncing = false,
  onTabChange,
  onClearSelections,
  onVisualizeData,
  onDownload,
  onToggleSidebar,
  sidebarOpen = false,
  isOrgFlow = false,
}) => {
  const hasSelections =
    selectedSiteIds.length > 0 ||
    selectedDeviceIds.length > 0 ||
    selectedGridIds.length > 0 ||
    Object.keys(selectedGridSiteIds).length > 0;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-start gap-4 w-full sm:w-auto">
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
        <div className="flex flex-wrap lg:flex-nowrap gap-2 gap-x-2 overflow-x-auto scrollbar-hide mt-2 lg:mt-0">
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

      <div className="flex flex-col justify-end sm:flex-row gap-2 w-full sm:w-auto flex-wrap mt-3 sm:mt-0">
        {hasSelections && (
          <Button
            variant="outlined"
            onClick={onClearSelections}
            Icon={AqAnnotationX}
            disabled={isGroupSyncing}
            className="px-4 py-2 w-full sm:w-auto"
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
          className="px-4 py-2 w-full sm:w-auto"
        >
          Visualize Data
        </Button>
        {/* Preview button removed: preview shown via Review & Download flow */}
        <Button
          variant="filled"
          onClick={onDownload}
          Icon={AqDownload01}
          className="px-4 py-2 w-full sm:w-auto"
          disabled={isGroupSyncing || !isDownloadReady}
          loading={isDownloading}
        >
          {isDownloading ? 'Downloading...' : 'Review & Download'}
        </Button>
      </div>
    </div>
  );
};
