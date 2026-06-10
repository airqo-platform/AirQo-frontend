import React, { useState, useEffect, useMemo } from 'react';
import ReusableDialog from '@/shared/components/ui/dialog';
import Checkbox from '@/shared/components/ui/checkbox';
import { Button } from '@/shared/components/ui';
import { Input } from '@/shared/components/ui/input';
import { GridSite } from '@/shared/types/api';

const toNormalizedText = (value: unknown): string =>
  typeof value === 'string' ? value.toLowerCase() : '';

interface SiteSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedSiteIds: string[]) => Promise<void>;
  sites: GridSite[];
  initialSelectedSiteIds: string[];
  gridName: string;
  gridType: 'country' | 'city';
  isDownloading?: boolean;
}

export const SiteSelectionDialog: React.FC<SiteSelectionDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  sites = [],
  initialSelectedSiteIds,
  gridName,
  gridType,
  isDownloading = false,
}) => {
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>(
    initialSelectedSiteIds
  );
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const validSiteIds = new Set(sites.map(site => site._id));
    const uniqueInitialIds = Array.from(new Set(initialSelectedSiteIds));
    const nextSelectedSiteIds = uniqueInitialIds.filter(id =>
      validSiteIds.has(id)
    );
    setSelectedSiteIds(nextSelectedSiteIds);
  }, [initialSelectedSiteIds, sites]);

  // Filter sites based on search term
  const filteredSites = useMemo(() => {
    if (!searchTerm.trim()) return sites;
    const term = searchTerm.trim().toLowerCase();
    return sites.filter(
      site =>
        toNormalizedText(site?.name).includes(term) ||
        toNormalizedText(site?.city).includes(term) ||
        toNormalizedText(site?.country).includes(term) ||
        toNormalizedText(site?.location_name).includes(term)
    );
  }, [sites, searchTerm]);

  const handleSiteToggle = (siteId: string, checked: boolean) => {
    if (checked) {
      setSelectedSiteIds(prev =>
        prev.includes(siteId) ? prev : [...prev, siteId]
      );
    } else {
      setSelectedSiteIds(prev => prev.filter(id => id !== siteId));
    }
  };

  const handleSelectAll = () => {
    setSelectedSiteIds(Array.from(new Set(sites.map(site => site._id))));
  };

  const handleDeselectAll = () => {
    setSelectedSiteIds([]);
  };

  const handleConfirm = async () => {
    try {
      await onConfirm(selectedSiteIds);
      // Dialog will be closed by parent on successful download
    } catch (error) {
      // Error handling is done in parent component
      console.error('Download failed:', error);
    }
  };

  return (
    <ReusableDialog
      isOpen={isOpen}
      onClose={() => {
        if (!isDownloading) {
          onClose();
        }
      }}
      title={`Select Sites in ${gridName}`}
      subtitle={`Choose which sites under this ${gridType} to include in your data download.`}
      preventBackdropClose={isDownloading}
      showCloseButton={!isDownloading}
      customFooter={
        <div className="flex justify-end items-center gap-3">
          <Button variant="outlined" onClick={onClose} disabled={isDownloading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedSiteIds.length === 0 || isDownloading}
            loading={isDownloading}
          >
            {isDownloading
              ? 'Downloading...'
              : `Download (${selectedSiteIds.length} selected)`}
          </Button>
        </div>
      }
    >
      {/* Search Bar */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search sites by name, city, or country..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full"
          disabled={isDownloading}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-4">
        <Button
          variant="outlined"
          size="sm"
          onClick={handleSelectAll}
          disabled={isDownloading}
        >
          Select All
        </Button>
        <Button
          variant="outlined"
          size="sm"
          onClick={handleDeselectAll}
          disabled={isDownloading}
        >
          Deselect All
        </Button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        <div className="space-y-2">
          {filteredSites.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm
                ? 'No sites found matching your search.'
                : 'No sites available.'}
            </div>
          ) : (
            filteredSites.map(site => (
              <div
                key={site._id}
                className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded"
              >
                <Checkbox
                  id={site._id}
                  checked={selectedSiteIds.includes(site._id)}
                  onCheckedChange={checked =>
                    handleSiteToggle(site._id, checked === true)
                  }
                  disabled={isDownloading}
                />
                <label
                  htmlFor={site._id}
                  className="text-sm cursor-pointer flex-1"
                >
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {site.name}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-xs">
                    {site.city}, {site.country}
                  </div>
                </label>
              </div>
            ))
          )}
        </div>
      </div>
    </ReusableDialog>
  );
};
