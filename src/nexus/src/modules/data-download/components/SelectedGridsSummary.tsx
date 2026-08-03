import React from 'react';
import { Button } from '@/shared/components/ui';
import { AqLightbulb01 } from '@airqo/icons-react';
import { Grid } from '@/shared/types/api';

interface SelectedGridsSummaryProps {
  activeTab: 'countries' | 'cities';
  selectedGridIds: string[];
  processedGridsData: Grid[];
  selectedGridSites: Record<string, string[]>;
  selectedGridSiteIds: Record<string, string[]>;
  onCustomizeSites: (grid: Grid) => void;
}

export const SelectedGridsSummary: React.FC<SelectedGridsSummaryProps> = ({
  activeTab,
  selectedGridIds,
  processedGridsData,
  selectedGridSites,
  selectedGridSiteIds,
  onCustomizeSites,
}) => {
  if (selectedGridIds.length === 0) return null;

  const selectedGrids = processedGridsData.filter(grid =>
    selectedGridIds.includes(grid._id)
  );

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
      <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-3">
        Selected {activeTab === 'countries' ? 'Country' : 'City'}
      </h3>
      <div className="space-y-3">
        {selectedGrids.map(grid => {
          const totalSites = grid.sites?.length || 0;
          const hasCustomSelection = Object.prototype.hasOwnProperty.call(
            selectedGridSiteIds,
            grid._id
          );
          const selectedSites = hasCustomSelection
            ? selectedGridSiteIds[grid._id]?.length || 0
            : selectedGridSites[grid._id]?.length || 0;

          return (
            <div
              key={grid._id}
              className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-md p-3 border border-blue-200 dark:border-blue-700"
            >
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {grid.name}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedSites > 0
                    ? `${selectedSites} of ${totalSites} sites selected`
                    : 'No monitoring sites selected'}
                </div>
              </div>
              <Button
                variant="outlined"
                size="sm"
                onClick={() => onCustomizeSites(grid)}
                className="ml-3"
              >
                {hasCustomSelection ? 'Modify Sites' : 'Customize Sites'}
              </Button>
            </div>
          );
        })}
      </div>
      <div className="mt-3 text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
        <AqLightbulb01 className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>
          Tip: Click &quot;Choose Sites&quot; to select specific monitoring
          locations, or use the main download button to download all sites in
          your selection.
        </span>
      </div>
    </div>
  );
};
