'use client';

import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePostHog } from 'posthog-js/react';
import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { LoadingState } from '@/shared/components/ui/loading-state';
import { useSitesData } from '@/shared/hooks/useSitesData';
import { useUser } from '@/shared/hooks/useUser';
import {
  useUserPreferencesList,
  useUpdateUserPreferences,
} from '@/shared/hooks/usePreferences';
import { useChecklistIntegration } from '@/modules/user-checklist';
import type { Site } from '@/shared/types/api';
import { trackEvent } from '@/shared/utils/analytics';
import { toast } from '@/shared/components/ui/toast';
import { AqCheckCircle } from '@airqo/icons-react';

interface SuggestedLocationsProps {
  className?: string;
}

/**
 * SuggestedLocations Component
 * Displays suggested monitoring locations for users to add to their favorites
 * Clean and simple UI to get users started
 *
 * Flow:
 * 1. Fetches organization-specific sites (via active group)
 * 2. Filters out already favorited sites
 * 3. Shows up to 12 suggestions in a grid
 * 4. Allows users to select up to 4 locations at once
 * 5. Updates preferences and reloads to show dashboard
 */
export const SuggestedLocations: React.FC<SuggestedLocationsProps> = ({
  className = '',
}) => {
  const posthog = usePostHog();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ref to track if component is mounted (prevent memory leaks)
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Get current user and group information
  const { user, activeGroup } = useUser();

  // Get current user preferences
  const { data: preferences, isLoading: preferencesLoading } =
    useUserPreferencesList(user?.id || '', activeGroup?.id || '');

  // Update preferences hook
  const { trigger: updatePreferences } = useUpdateUserPreferences();

  // Checklist integration hook
  const { markLocationStepCompleted } = useChecklistIntegration();

  // Fetch sites data - limit to 12 for quick suggestions
  // This uses the active group context automatically (organization-specific)
  const {
    sites,
    isLoading: sitesLoading,
    error: sitesError,
  } = useSitesData({
    enabled: true,
    initialPageSize: 12,
    maxLimit: 12,
  });

  // Get the most recent preference from the list
  const currentPreference = useMemo(() => {
    if (!preferences?.preferences || preferences.preferences.length === 0) {
      return null;
    }
    return [...preferences.preferences].sort(
      (a, b) =>
        new Date(b.lastAccessed || b.updatedAt).getTime() -
        new Date(a.lastAccessed || a.updatedAt).getTime()
    )[0];
  }, [preferences?.preferences]);

  // Get IDs of already favorited sites
  const favoritedSiteIds = useMemo(() => {
    if (!currentPreference?.selected_sites) return new Set<string>();
    const favoriteSites = currentPreference.selected_sites as Site[];
    return new Set(favoriteSites.map(site => site._id));
  }, [currentPreference?.selected_sites]);

  // Filter out already favorited sites from suggestions
  const suggestedSites = useMemo(() => {
    return sites.filter(site => !favoritedSiteIds.has(site.id));
  }, [sites, favoritedSiteIds]);

  // Handle site selection toggle
  const handleToggleSelection = useCallback((siteId: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(siteId)) {
        newSet.delete(siteId);
      } else {
        if (newSet.size >= 4) {
          toast.error('You can only select up to 4 locations at a time');
          return prev;
        }
        newSet.add(siteId);
      }
      return newSet;
    });
  }, []);

  // Handle clear all selections
  const handleClearAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Handle adding selected locations to favorites
  const handleAddToFavorites = useCallback(async () => {
    if (!user?.id || !activeGroup?.id) {
      toast.error('User or group information is missing');
      return;
    }

    if (selectedIds.size === 0) {
      toast.error('Please select at least one location');
      return;
    }

    // Check if total would exceed limit (current favorites + new selections)
    const currentFavoriteCount = favoritedSiteIds.size;
    const totalAfterAdd = currentFavoriteCount + selectedIds.size;
    if (totalAfterAdd > 4) {
      toast.error(
        `Cannot add ${selectedIds.size} location(s). You have ${currentFavoriteCount} favorite(s) and the maximum is 4.`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Get existing favorite sites data
      const existingFavorites = (currentPreference?.selected_sites ||
        []) as Site[];

      // Convert selected site IDs to Site objects
      const newSitesToAdd: Site[] = Array.from(selectedIds)
        .map(id => {
          const site = suggestedSites.find(s => s.id === id);
          if (!site) return null;

          return {
            _id: site.id,
            name: site.location || site.name || '',
            search_name: site.location || site.name || '',
            city: site.city,
            country: site.country,
            latitude:
              site._raw?.latitude ||
              site._raw?.lat ||
              site._raw?.approximate_latitude ||
              undefined,
            longitude:
              site._raw?.longitude ||
              site._raw?.lng ||
              site._raw?.approximate_longitude ||
              undefined,
            approximate_latitude: site._raw?.approximate_latitude || undefined,
            approximate_longitude:
              site._raw?.approximate_longitude || undefined,
            generated_name: site.location || site.name || '',
            createdAt: new Date().toISOString(),
          } as Site;
        })
        .filter((site): site is Site => site !== null);

      if (newSitesToAdd.length === 0) {
        toast.error('No valid locations found to add');
        setIsSubmitting(false);
        return;
      }

      // Combine with existing favorites (avoid duplicates)
      const existingIds = new Set(existingFavorites.map(s => s._id));
      const uniqueNewSites = newSitesToAdd.filter(
        site => !existingIds.has(site._id)
      );
      const allSites: Site[] = [...existingFavorites, ...uniqueNewSites];

      // Update user preferences
      await updatePreferences({
        user_id: user.id,
        group_id: activeGroup.id,
        selected_sites: allSites,
      });

      // Track analytics
      posthog?.capture('suggested_locations_added', {
        count: uniqueNewSites.length,
        site_ids: uniqueNewSites.map(s => s._id),
      });

      trackEvent('suggested_locations_added', {
        count: uniqueNewSites.length,
        site_ids: uniqueNewSites.map(s => s._id),
      });

      // Update checklist - mark location selection step as completed
      try {
        await markLocationStepCompleted();
      } catch (checklistError) {
        console.error(
          'Failed to update checklist for location selection:',
          checklistError
        );
        // Don't block the flow if checklist update fails
      }

      toast.success(
        `Successfully added ${uniqueNewSites.length} location${uniqueNewSites.length > 1 ? 's' : ''} to favorites`
      );

      // Clear selections
      setSelectedIds(new Set());

      // Reload the page to show updated dashboard (with cleanup check to prevent memory leaks)
      setTimeout(() => {
        if (isMountedRef.current) {
          window.location.reload();
        }
      }, 1000);
    } catch (error) {
      console.error('Failed to add locations to favorites:', error);
      toast.error('Failed to add locations to favorites. Please try again.');
    } finally {
      if (isMountedRef.current) {
        setIsSubmitting(false);
      }
    }
  }, [
    user?.id,
    activeGroup?.id,
    selectedIds,
    favoritedSiteIds.size,
    currentPreference?.selected_sites,
    suggestedSites,
    updatePreferences,
    markLocationStepCompleted,
    posthog,
  ]);

  // Loading state
  if (sitesLoading || preferencesLoading) {
    return (
      <div
        className={`flex items-center justify-center min-h-[400px] ${className}`}
      >
        <LoadingState text="Loading suggested locations..." />
      </div>
    );
  }

  // Error state
  if (sitesError) {
    return (
      <div
        className={`flex items-center justify-center min-h-[400px] ${className}`}
      >
        <EmptyState
          title="Unable to load suggestions"
          description="We're having trouble loading location suggestions. Please try again later."
        />
      </div>
    );
  }

  // No suggestions available state (all sites are already favorited or no sites exist)
  if (suggestedSites.length === 0) {
    return (
      <div
        className={`flex items-center justify-center min-h-[400px] ${className}`}
      >
        <EmptyState
          title="No new locations available"
          description={
            favoritedSiteIds.size > 0
              ? "You've already added all available monitoring locations to your favorites."
              : 'There are currently no monitoring locations available to add to your favorites.'
          }
        />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Add Favorite Locations
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Select up to 4 monitoring locations to add to your favorites and
            start tracking air quality data.
          </p>
        </div>
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              disabled={isSubmitting}
            >
              Clear all
            </Button>
            <Button
              onClick={handleAddToFavorites}
              size="sm"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              Add {selectedIds.size} to favorites
            </Button>
          </div>
        )}
      </div>

      {/* Suggestions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {suggestedSites.map(site => {
            const isSelected = selectedIds.has(site.id);
            return (
              <motion.div
                key={site.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                onClick={() => handleToggleSelection(site.id)}
                className={`
                  relative cursor-pointer rounded-lg p-4 transition-all
                  hover:shadow-md
                  ${
                    isSelected
                      ? 'border border-primary bg-primary/5 shadow-sm'
                      : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                {/* Selection Indicator */}
                <div className="absolute top-3 right-3">
                  <div
                    className={`
                    w-5 h-5 rounded-full flex items-center justify-center transition-all
                    ${
                      isSelected
                        ? 'bg-primary'
                        : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                    }
                  `}
                  >
                    {isSelected && (
                      <AqCheckCircle size={14} className="text-white" />
                    )}
                  </div>
                </div>

                {/* Location Info */}
                <div className="pr-7">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-2 line-clamp-2">
                    {site.location}
                  </h3>
                  <div className="space-y-0.5 text-sm text-gray-600 dark:text-gray-400">
                    {site.city && (
                      <p className="line-clamp-1">
                        <span className="font-medium">City:</span> {site.city}
                      </p>
                    )}
                    {site.country && (
                      <p className="line-clamp-1">
                        <span className="font-medium">Country:</span>{' '}
                        {site.country}
                      </p>
                    )}
                    {site.owner && (
                      <p className="line-clamp-1 text-xs mt-1">
                        <span className="font-medium">Owner:</span>{' '}
                        {String(site.owner).toUpperCase()}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
