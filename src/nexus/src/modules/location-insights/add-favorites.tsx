'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePostHog } from 'posthog-js/react';
import { AqRefreshCcw01 } from '@airqo/icons-react';
import WideDialog from '@/shared/components/ui/wide-dialog';
import { Button } from '@/shared/components/ui';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import { EmptyState } from '@/shared/components/ui/empty-state';
import LocationCard from '@/shared/components/ui/location-card';
import { areArraysEqual } from '@/shared/utils/arrays';
import { useSitesData } from '@/shared/hooks/useSitesData';
import { useUser } from '@/shared/hooks/useUser';
import {
  getLatestPreferenceForGroup,
  useUserPreferencesList,
  useUpdateUserPreferences,
} from '@/shared/hooks/usePreferences';
import { useChecklistIntegration } from '@/modules/user-checklist';
import type { Site } from '@/shared/types/api';
import { trackEvent } from '@/shared/utils/analytics';
import { getSiteDisplayName } from '@/shared/utils/siteUtils';

const isCancellationError = (error: unknown) => {
  const candidate = error as {
    name?: string;
    code?: string;
    message?: string;
  } | null;

  return (
    candidate?.name === 'AbortError' ||
    candidate?.name === 'CanceledError' ||
    candidate?.code === 'ERR_CANCELED' ||
    candidate?.message === 'canceled'
  );
};

interface AddSavedLocationsProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddSavedLocations: React.FC<AddSavedLocationsProps> = ({
  isOpen,
  onClose,
}) => {
  const posthog = usePostHog();
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMountedRef = React.useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Cache for storing site data across pagination
  const [siteDataCache, setSiteDataCache] = useState<
    Map<string | number, Site>
  >(new Map());

  // Get current user and group information
  const { user, activeGroup } = useUser();

  // Get current user preferences
  const {
    data: preferences,
    isLoading: preferencesLoading,
    mutate: refreshPreferences,
  } = useUserPreferencesList(user?.id || '', activeGroup?.id || '');

  // Update preferences hook
  const { trigger: updatePreferences, isMutating: isUpdating } =
    useUpdateUserPreferences();

  // Checklist integration hook
  const { markLocationStepCompleted } = useChecklistIntegration();

  // Use proper server-side pagination hook with max limit of 80
  const {
    sites,
    isLoading,
    isRefreshing: isTableRefreshing,
    error,
    retry,
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

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setErrorMessage('');
    try {
      const results = await Promise.allSettled([
        retry(),
        refreshPreferences?.(),
      ]);
      const failures = results.filter(
        result =>
          result.status === 'rejected' && !isCancellationError(result.reason)
      );

      if (failures.length > 0) {
        console.error('Failed to refresh saved locations data:', failures);
        setErrorMessage('Failed to refresh saved locations. Please try again.');
      }
    } finally {
      if (isMountedRef.current) {
        setIsRefreshing(false);
      }
    }
  }, [refreshPreferences, retry]);

  // Get the most recent preference from the list
  const currentPreference = useMemo(() => {
    return getLatestPreferenceForGroup(
      preferences?.preferences,
      activeGroup?.id
    );
  }, [activeGroup?.id, preferences?.preferences]);

  // Initialize selectedIds and cache with current saved sites from preferences
  useEffect(() => {
    if (currentPreference?.selected_sites && isOpen) {
      const savedSites = currentPreference.selected_sites as Site[];
      const savedSiteIds = savedSites.map(site => site._id);

      // Set selected IDs
      setSelectedIds(prev =>
        areArraysEqual(prev, savedSiteIds) ? prev : savedSiteIds
      );

      // Initialize cache with existing saved locations
      setSiteDataCache(prev => {
        const currentIds = Array.from(prev.keys());
        if (areArraysEqual(currentIds, savedSiteIds)) {
          return prev;
        }

        return new Map(savedSites.map(site => [site._id, site]));
      });
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
              const toNumber = (value: unknown): number | undefined =>
                typeof value === 'number' && Number.isFinite(value)
                  ? value
                  : undefined;
              newCache.set(id, {
                _id: site.id,
                name: site.location,
                search_name: site.location,
                city: site.city,
                country: site.country,
                latitude:
                  toNumber(site._raw?.latitude) ??
                  toNumber(site._raw?.lat) ??
                  toNumber(site._raw?.approximate_latitude),
                longitude:
                  toNumber(site._raw?.longitude) ??
                  toNumber(site._raw?.lng) ??
                  toNumber(site._raw?.approximate_longitude),
                approximate_latitude: toNumber(site._raw?.approximate_latitude),
                approximate_longitude: toNumber(
                  site._raw?.approximate_longitude
                ),
                generated_name: site.location,
                createdAt: new Date().toISOString(),
              });
            }
          }
        });

        return newCache;
      });
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

    setErrorMessage('');
    try {
      // Save exactly what is selected — never the whole cache (the cache is
      // usually a mirror of the selection, but must not be trusted for it).
      const sitesToSave: Site[] = selectedIds
        .map(id => siteDataCache.get(id))
        .filter((site): site is Site => site !== undefined);

      // Update user preferences
      await updatePreferences({
        user_id: user.id,
        group_id: activeGroup.id,
        selected_sites: sitesToSave,
      });

      posthog?.capture('saved_locations_updated', {
        count: sitesToSave.length,
        site_ids: sitesToSave.map(s => s._id),
      });

      trackEvent('saved_locations_updated', {
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
      // Log only the status/message — axios errors carry Authorization headers
      console.error('Failed to save location selection:', {
        status: (error as { response?: { status?: unknown } })?.response
          ?.status,
        message: (error as { message?: unknown })?.message,
      });
      setErrorMessage('Failed to save location selection. Please try again.');
    }
  }, [
    user?.id,
    activeGroup?.id,
    selectedIds,
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
      headerLeft={<h2 className="text-xl">Add Saved Locations</h2>}
      headerRight={
        <Button
          variant="outlined"
          size="sm"
          onClick={() => void handleRefresh()}
          Icon={AqRefreshCcw01}
          loading={isRefreshing}
          disabled={isRefreshing || isLoading || preferencesLoading}
        >
          Refresh
        </Button>
      }
      sidebar={
        <div className="h-full">
          {allSelectedLocations.length === 0 ? (
            <EmptyState
              title="No saved locations selected"
              description="Select locations from the table to save them to this organization."
              compact={true}
              className="h-auto"
            />
          ) : (
            <div className="space-y-2">
              <h3 className="text-sm font-medium dark:text-gray-100 mb-3">
                Selected Locations ({selectedIds.length})
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
                      locationName={getSiteDisplayName(location)}
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
          : `Save Locations (${selectedIds.length})`,
        onClick: handleAddLocation,
        disabled: selectedIds.length === 0 || isUpdating,
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
          isRefreshing={isTableRefreshing}
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

export default AddSavedLocations;
