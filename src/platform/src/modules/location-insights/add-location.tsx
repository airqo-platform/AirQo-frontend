'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { usePostHog } from 'posthog-js/react';
import WideDialog from '@/shared/components/ui/wide-dialog';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import LocationCard from '@/shared/components/ui/location-card';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { AqChevronLeft } from '@airqo/icons-react';
import {
  selectIsDialogOpen,
  selectSelectedSites,
} from '@/shared/store/selectors';
import { closeDialog, openMoreInsights } from '@/shared/store/insightsSlice';
import { useSitesData } from '@/shared/hooks/useSitesData';
import type { SelectedSite } from '@/shared/store/insightsSlice';
import {
  trackLocationSelection,
  trackFeatureUsage,
} from '@/shared/utils/enhancedAnalytics';

const AddLocation: React.FC = () => {
  const dispatch = useDispatch();
  const posthog = usePostHog();
  const isOpen = useSelector(selectIsDialogOpen('add-location'));
  const selectedSites = useSelector(selectSelectedSites);

  // Use proper server-side pagination hook with max limit of 80
  const {
    sites,
    isLoading,
    error,
    totalSites,
    totalPages,
    currentPage,
    pageSize,
    searchTerm,
    setCurrentPage,
    setPageSize,
    setSearchTerm,
  } = useSitesData({
    enabled: isOpen, // Only fetch when dialog is open
    initialPageSize: 6, // Start with 6 items per page
    maxLimit: 80, // API constraint
  });

  // Store both selected IDs and their corresponding site data
  const [selectedLocations, setSelectedLocations] = useState<
    (string | number)[]
  >((selectedSites as SelectedSite[]).map(site => site._id));

  const [selectedSiteData, setSelectedSiteData] = useState<
    Map<string | number, SelectedSite>
  >(new Map((selectedSites as SelectedSite[]).map(site => [site._id, site])));

  // Update selected locations when selectedSites changes (e.g., when dialog opens)
  React.useEffect(() => {
    if (isOpen) {
      const newSelectedIds = (selectedSites as SelectedSite[]).map(
        site => site._id
      );
      setSelectedLocations(newSelectedIds);
      setSelectedSiteData(
        new Map((selectedSites as SelectedSite[]).map(site => [site._id, site]))
      );
    }
  }, [selectedSites, isOpen]);

  // Table columns configuration
  const columns = useMemo(
    () => [
      {
        key: 'location',
        label: 'Location',
        sortable: true,
      },
      {
        key: 'city',
        label: 'City',
        sortable: true,
      },
      {
        key: 'country',
        label: 'Country',
        sortable: true,
      },
      {
        key: 'owner',
        label: 'Owner',
        sortable: true,
      },
    ],
    []
  );

  // Handle updating selected locations - replaces existing sites with table selections
  const handleAddLocations = () => {
    // Create new sites array from stored site data
    const newSites: SelectedSite[] = Array.from(selectedSiteData.values());

    // Track each location selection with enhanced analytics
    newSites.forEach(site => {
      trackLocationSelection(posthog, {
        locationId: site._id,
        locationName: site.name,
        city: site.city,
        country: site.country,
        source: 'insights',
      });
    });

    // Track feature usage
    trackFeatureUsage(posthog, 'location_insights', 'add_locations', {
      location_count: newSites.length,
    });

    dispatch(closeDialog('add-location'));
    dispatch(openMoreInsights({ sites: newSites }));
  };

  // Custom handler for selection changes that maintains site data
  const handleSelectionChange = useCallback(
    (newSelectedIds: (string | number)[]) => {
      setSelectedLocations(newSelectedIds);

      // Update the site data map
      setSelectedSiteData(prevData => {
        const newData = new Map(prevData);

        // Remove data for unselected items
        Array.from(prevData.keys()).forEach(id => {
          if (!newSelectedIds.includes(id)) {
            newData.delete(id);
          }
        });

        // Add data for newly selected items from current page
        newSelectedIds.forEach(id => {
          if (!newData.has(id)) {
            const site = sites.find(s => s.id === id);
            if (site) {
              newData.set(id, {
                _id: site.id,
                name: site.location,
                city: site.city,
                country: site.country,
              });
            }
          }
        });

        return newData;
      });
    },
    [sites]
  );

  // Handle clearing selections - clears all table selections
  const handleClearSelections = useCallback(() => {
    handleSelectionChange([]);
  }, [handleSelectionChange]);

  // Handle removing location from selection
  const handleRemoveLocation = useCallback(
    (locationId: string) => {
      const newSelectedIds = selectedLocations.filter(id => id !== locationId);
      handleSelectionChange(newSelectedIds);
    },
    [selectedLocations, handleSelectionChange]
  );

  // Safety checks for counts
  const selectedLocationsCount = Math.max(0, selectedLocations.length);

  // Handle dialog close
  const handleClose = () => {
    dispatch(closeDialog('add-location'));
    dispatch(openMoreInsights({ sites: selectedSites }));
  };

  // Sidebar content - shows selected sites from table and existing sites
  const sidebarContent = (
    <div className="space-y-4">
      {/* Selected sites */}
      <div>
        <h6 className="font-medium  dark:text-gray-100 mb-3">
          Selected Sites ({selectedLocationsCount})
        </h6>
        <div className="space-y-2">
          {selectedLocationsCount === 0 ? (
            <EmptyState
              title="No sites selected"
              description="Select locations from the table to include them in your insights."
              compact
            />
          ) : (
            <AnimatePresence>
              {selectedLocations.map(id => {
                const siteData = selectedSiteData.get(id);
                if (!siteData) return null;

                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  >
                    <LocationCard
                      locationName={siteData.name}
                      country={siteData.country}
                      subtitle={siteData.city}
                      isChecked={true}
                      showCloseButton
                      onClose={() => handleRemoveLocation(id as string)}
                      compact
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );

  // Footer actions
  const primaryAction = {
    label: `Update Selection (${selectedLocationsCount})`,
    onClick: handleAddLocations,
    disabled: selectedLocationsCount === 0,
  };

  return (
    <WideDialog
      isOpen={isOpen}
      onClose={handleClose}
      headerLeft={
        <div className="flex items-center gap-3">
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Go back to insights"
          >
            <AqChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h2 className="text-xl  dark:text-gray-100">Add Locations</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Modify your site selection for insights
            </p>
          </div>
        </div>
      }
      sidebar={sidebarContent}
      primary={primaryAction}
      onCancel={handleClose}
      onClear={handleClearSelections}
      showClear={selectedLocationsCount > 0}
      showCancel={true}
      showFooter={true}
      maxWidth="max-w-6xl"
    >
      {/* Main Content */}
      <div className="space-y-6">
        {/* Sites Table */}
        <div>
          <ServerSideTable
            title="Sites"
            data={sites}
            columns={columns}
            selectedItems={selectedLocations}
            onSelectedItemsChange={handleSelectionChange}
            multiSelect={true}
            loading={isLoading}
            error={error}
            // Server-side pagination props
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalSites}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            // Server-side search props
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>
      </div>
    </WideDialog>
  );
};

export default AddLocation;
