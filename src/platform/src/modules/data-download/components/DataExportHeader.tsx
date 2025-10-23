import React from 'react';
import { Button } from '@/shared/components/ui';
import { AqAnnotationX, AqDownload01 } from '@airqo/icons-react';
import { TabType } from '../types/dataExportTypes';

interface DataExportHeaderProps {
  activeTab: TabType;
  selectedSiteIds: string[];
  selectedDeviceIds: string[];
  isDownloadReady: boolean;
  isDownloading: boolean;
  onTabChange: (tab: TabType) => void;
  onClearSelections: () => void;
  onVisualizeData: () => void;
  onPreview: () => void;
  onDownload: () => void;
  onToggleSidebar?: () => void;
}

/**
 * Header component with tabs and action buttons
 */
export const DataExportHeader: React.FC<DataExportHeaderProps> = ({
  activeTab,
  selectedSiteIds,
  selectedDeviceIds,
  isDownloadReady,
  isDownloading,
  onTabChange,
  onClearSelections,
  onVisualizeData,
  onPreview,
  onDownload,
  onToggleSidebar,
}) => {
  const hasSelections =
    selectedSiteIds.length > 0 || selectedDeviceIds.length > 0;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-4 w-full sm:w-auto">
        {/* Mobile Sidebar Toggle */}
        {onToggleSidebar && (
          <Button
            variant="outlined"
            size="sm"
            onClick={onToggleSidebar}
            className="md:hidden flex-shrink-0"
          >
            <span className="sr-only">Toggle sidebar</span>☰
          </Button>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-2">
          <Button
            variant={activeTab === 'sites' ? 'filled' : 'outlined'}
            onClick={() => onTabChange('sites')}
          >
            Sites
          </Button>
          <Button
            variant={activeTab === 'devices' ? 'filled' : 'outlined'}
            onClick={() => onTabChange('devices')}
          >
            Devices
          </Button>
        </div>
      </div>

      <div className="flex flex-col justify-end sm:flex-row gap-2 w-full sm:w-auto flex-wrap">
        {hasSelections && (
          <Button
            variant="outlined"
            onClick={onClearSelections}
            Icon={AqAnnotationX}
            className="px-4 py-2 w-full sm:w-auto"
          >
            Clear All
          </Button>
        )}
        <Button
          variant="outlined"
          onClick={onVisualizeData}
          disabled={
            (activeTab === 'sites' && selectedSiteIds.length === 0) ||
            (activeTab === 'devices' && selectedDeviceIds.length === 0)
          }
          className="px-4 py-2 w-full sm:w-auto"
        >
          Visualize Data
        </Button>
        <Button
          variant="outlined"
          onClick={onPreview}
          disabled={!isDownloadReady}
          className="px-4 py-2 w-full sm:w-auto"
        >
          Preview
        </Button>
        <Button
          variant="filled"
          onClick={onDownload}
          Icon={AqDownload01}
          className="px-4 py-2 w-full sm:w-auto"
          disabled={!isDownloadReady}
          loading={isDownloading}
        >
          {isDownloading ? 'Downloading...' : 'Download Data'}
        </Button>
      </div>
    </div>
  );
};
