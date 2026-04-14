'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePostHog } from 'posthog-js/react';
import WideDialog from '@/shared/components/ui/wide-dialog';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import { EmptyState } from '@/shared/components/ui/empty-state';
import LocationCard from '@/shared/components/ui/location-card';
import { useSitesData } from '@/shared/hooks/useSitesData';
import { useUser } from '@/shared/hooks/useUser';
import {
  useUserPreferencesList,
  useUpdateUserPreferences,
} from '@/shared/hooks/usePreferences';
import { useChecklistIntegration } from '@/modules/user-checklist';
import type { Site } from '@/shared/types/api';
import { trackEvent } from '@/shared/utils/analytics';

interface AddFavoritesProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddFavorites: React.FC<AddFavoritesProps> = ({ isOpen, onClose }) => {
  const posthog = usePostHog();
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Cache for storing site data across pagination
  const [siteDataCache, setSiteDataCache] = useState<
    Map<string | number, Site>
  >(new Map());

  // Get current user and group information
  const { user, activeGroup } = useUser();

  // Get current user preferences
  const { data: preferences, isLoading: preferencesLoading } =
    useUserPreferencesList(user?.id || '', activeGroup?.id || '');

  // Update preferences hook
  const { trigger: updatePreferences, isMutating: isUpdating } =
    useUpdateUserPreferences();

  // Checklist integration hook
  const { markLocationStepCompleted } = useChecklistIntegration();

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
    enabled: isOpen,
    initialPageSize: 6,
    maxLimit: 80,
  });

  // Get the most recent preference from the list
  const currentPreference = useMemo(() => {
    if (!preferences?.preferences || preferences.preferences.length === 0) {
      return null;
    }
    // Sort by lastAccessed date (most recent first) and take the first one
    return preferences.preferences.sort(
      (a, b) =>
        new Date(b.lastAccessed || b.updatedAt).getTime() -
        new Date(a.lastAccessed || a.updatedAt).getTime()
    )[0];
  }, [preferences?.preferences]);

  // Initialize selectedIds and cache with current favorite sites from preferences
  useEffect(() => {
    if (currentPreference?.selected_sites && isOpen) {
      const favoriteSites = currentPreference.selected_sites as Site[];
      const favoriteIds = favoriteSites.map(site => site._id);

      // Set selected IDs
      setSelectedIds(favoriteIds);

      // Initialize cache with existing favorites
      setSiteDataCache(new Map(favoriteSites.map(site => [site._id, site])));
    }
  }, [currentPreference?.selected_sites, isOpen]);

  // Table columns configuration
  const columns = useMemo(
    () => [
      { key: 'location', label: 'Location', sortable: true },
      { key: 'city', label: 'City', sortable: true },
      { key: 'country', label: 'Country', sortable: true },
      { key: 'owner', label: 'Owner', sortable: true },
    ],
    []
  );

  // Get all selected locations from cache
  const allSelectedLocations = useMemo(() => {
    return selectedIds
      .map(id => siteDataCache.get(id))
      .filter((site): site is Site => site !== undefined);
  }, [selectedIds, siteDataCache]);

  const handleTableSelectionChange = useCallback(
    (newSelectedIds: (string | number)[]) => {
      // Update the selections
      setSelectedIds(newSelectedIds);

      // Update the site data cache
      setSiteDataCache(prevCache => {
        const newCache = new Map(prevCache);

        // Remove data for unselected items
        Array.from(prevCache.keys()).forEach(id => {
          if (!newSelectedIds.includes(id)) {
            newCache.delete(id);
          }
        });

        // Add data for newly selected items from current page
        newSelectedIds.forEach(id => {
          if (!newCache.has(id)) {
            const site = sites.find(s => s.id === id);
            if (site) {
              newCache.set(id, {
                _id: site.id,
                name: site.location,
                search_name: site.location,
                city: site.city,
                country: site.country,
                latitude: 0,
                longitude: 0,
                approximate_latitude: 0,
                approximate_longitude: 0,
                generated_name: site.location,
                createdAt: new Date().toISOString(),
              });
            }
          }
        });

        return newCache;
      });

      // Show warning if over limit, but allow the selection
      if (newSelectedIds.length > 4) {
        setErrorMessage(
          `You have selected ${newSelectedIds.length} locations. Maximum allowed is 4. Please deselect ${newSelectedIds.length - 4} location(s) before saving.`
        );
      } else {
        setErrorMessage('');
      }
    },
    [sites]
  );

  const handleRemoveLocation = useCallback(
    (locationId: string | number) => {
      const newSelectedIds = selectedIds.filter(id => id !== locationId);
      handleTableSelectionChange(newSelectedIds);
    },
    [selectedIds, handleTableSelectionChange]
  );

  const handleClearAll = useCallback(() => {
    handleTableSelectionChange([]);
  }, [handleTableSelectionChange]);

  const handleAddLocation = useCallback(async () => {
    if (!user?.id || !activeGroup?.id) {
      setErrorMessage('User or group information is missing');
      return;
    }

    // Check if we exceed the limit
    if (selectedIds.length > 4) {
      setErrorMessage(
        `Cannot save ${selectedIds.length} locations. Maximum allowed is 4. Please deselect ${selectedIds.length - 4} location(s) first.`
      );
      return;
    }

    try {
      // Get selected sites data from cache
      const sitesToSave: Site[] = Array.from(siteDataCache.values());

      // Update user preferences
      await updatePreferences({
        user_id: user.id,
        group_id: activeGroup.id,
        selected_sites: sitesToSave,
      });

      posthog?.capture('favorites_updated', {
        count: sitesToSave.length,
        site_ids: sitesToSave.map(s => s._id),
      });

      trackEvent('favorites_updated', {
        count: sitesToSave.length,
        site_ids: sitesToSave.map(s => s._id),
      });

      // Update checklist - mark location selection step as completed
      try {
        await markLocationStepCompleted();
      } catch (checklistError) {
        // Don't block the main flow if checklist update fails
        console.error(
          'Failed to update checklist for location selection:',
          checklistError
        );
      }

      // Close dialog on success
      onClose();
    } catch (error) {
      console.error('Failed to save favorites:', error);
      setErrorMessage('Failed to save favorites. Please try again.');
    }
  }, [
    user?.id,
    activeGroup?.id,
    selectedIds.length,
    siteDataCache,
    updatePreferences,
    markLocationStepCompleted,
    onClose,
    posthog,
  ]);

  return (
    <WideDialog
      isOpen={isOpen}
      onClose={onClose}
      headerLeft={<h2 className="text-xl">Add Favorites</h2>}
      sidebar={
        <div className="h-full">
          {allSelectedLocations.length === 0 ? (
            <EmptyState
              title="No favorites selected"
              description="Select locations from the table to add them as favorites."
              compact={true}
              className="h-auto"
            />
          ) : (
            <div className="space-y-2">
              <h3 className="text-sm font-medium  dark:text-gray-100 mb-3">
                Selected Favorites ({selectedIds.length}/4)
              </h3>
              <AnimatePresence>
                {allSelectedLocations.map(location => (
                  <motion.div
                    key={location._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  >
                    <LocationCard
                      locationName={
                        location.name || location.generated_name || ''
                      }
                      subtitle={`${location.city}, ${location.country}`}
                      isChecked={true}
                      showCloseButton={true}
                      onClose={() => handleRemoveLocation(location._id)}
                      compact={true}
                      loading={preferencesLoading}
                      variant="location"
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      }
      primary={{
        loading: isUpdating,
        label: isUpdating
          ? 'Saving...'
          : `Save Favorites (${selectedIds.length})`,
        onClick: handleAddLocation,
        disabled:
          selectedIds.length === 0 || selectedIds.length > 4 || isUpdating,
      }}
      onClear={handleClearAll}
      showClear={selectedIds.length > 0}
      message={errorMessage}
      messageSeverity={errorMessage ? 'error' : null}
      maxWidth="max-w-6xl"
    >
      <div className="max-w-[360px] md:max-w-none">
        <ServerSideTable
          title="Sites"
          data={sites}
          columns={columns}
          multiSelect={true}
          selectedItems={selectedIds}
          onSelectedItemsChange={handleTableSelectionChange}
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
    </WideDialog>
  );
};

export default AddFavorites;
