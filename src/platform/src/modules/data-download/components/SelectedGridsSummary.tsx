import React from 'react';
import { Button } from '@/shared/components/ui';
import { Grid } from '@/shared/types/api';

interface SelectedGridsSummaryProps {
  activeTab: 'countries' | 'cities';
  selectedGridIds: string[];
  processedGridsData: Grid[];
  selectedGridSiteIds: Record<string, string[]>;
  onCustomizeSites: (grid: Grid) => void;
}

export const SelectedGridsSummary: React.FC<SelectedGridsSummaryProps> = ({
  activeTab,
  selectedGridIds,
  processedGridsData,
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
          const customSites = selectedGridSiteIds[grid._id] || [];
          const selectedSites = customSites.length;

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
                    : `No sites selected`}
                </div>
              </div>
              <Button
                variant="outlined"
                size="sm"
                onClick={() => onCustomizeSites(grid)}
                className="ml-3"
              >
                {selectedSites > 0 ? 'Modify Sites' : 'Choose Sites'}
              </Button>
            </div>
          );
        })}
      </div>
      <div className="mt-3 text-xs text-blue-700 dark:text-blue-300">
        💡 Tip: Click &quot;Choose Sites&quot; to select specific monitoring
        locations, or use the main download button to download all sites in your
        selection.
      </div>
    </div>
  );
};
