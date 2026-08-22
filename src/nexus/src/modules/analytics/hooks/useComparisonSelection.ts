'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAnalyticsPreferences } from './index';
import { useUpdateUserPreferences } from '@/shared/hooks/usePreferences';
import type { Site } from '@/shared/types/api';

export interface UseComparisonSelectionOptions {
  /** Organization group id; empty in the user flow (uses the active group). */
  groupId?: string;
  userId?: string;
  enabled?: boolean;
}

export interface UseComparisonSelectionResult {
  /**
   * Persisted selection for the active group — the just-saved ids until the
   * invalidated preferences refetch confirms them, then the server payload.
   */
  savedSiteIds: string[];
  /**
   * Full `Site` objects behind `savedSiteIds`. Between a save and the
   * preferences refetch these are the just-saved objects (they carry the
   * display names); afterwards they come from the server payload.
   */
  savedSites: Site[];
  /**
   * True while the group's preference list is loading. Pickers must wait for
   * this before pre-checking rows, or a slow preferences fetch flashes an
   * empty selection.
   */
  isInitialLoading: boolean;
  isSaving: boolean;
  /** Sanitized save error (message only — never the raw axios error). */
  error: string | null;
  /**
   * Persists the selection as this group's `selected_sites` preference —
   * the same shared "my locations" list the favorites dialog writes.
   * Resolves `true` on success.
   */
  save: (sites: Site[]) => Promise<boolean>;
}

interface SavedOverride {
  groupId: string;
  /** Full just-saved Site objects — they carry the display names. */
  sites: Site[];
}

/**
 * True when both selections contain exactly the same site ids
 * (order-insensitive). Detects that the post-save preferences refetch has
 * converged on the just-saved selection. Ids are compared as sorted sets —
 * NEVER by array identity, since every refetch builds a fresh array and an
 * identity check would keep the override alive forever.
 */
export const savedOverrideMatchesPreference = (
  overrideIds: string[],
  preferenceIds: string[]
): boolean => {
  if (overrideIds.length !== preferenceIds.length) {
    return false;
  }
  const sortedOverride = [...overrideIds].sort();
  const sortedPreference = [...preferenceIds].sort();
  return sortedOverride.every((id, index) => id === sortedPreference[index]);
};

/**
 * Read/write access to the comparison ("my locations") selection:
 *
 * - READ via `useAnalyticsPreferences` (`site_ids` + `selected_sites` of the
 *   latest preference for the group) — already group-scoped, so a group
 *   switch swaps the selection with no cross-group bleed.
 * - WRITE via `useUpdateUserPreferences`
 *   (`PATCH /users/preferences/replace` with `{user_id, group_id,
 *   selected_sites}`) — the exact recipe the favorites dialog uses
 *   (add-favorites.tsx), so comparison selections stay consistent with
 *   favorites and the map's saved locations.
 *
 * A successful save stores the full just-saved Site[] as a local override so
 * display names survive until the invalidated `preferences/*` SWR keys
 * refetch (see useUpdateUserPreferences). Once the refetched preference's id
 * set matches the override, the override is dropped and the server payload —
 * which stores the site objects incl. names — becomes authoritative again.
 */
export const useComparisonSelection = (
  options?: UseComparisonSelectionOptions
): UseComparisonSelectionResult => {
  const {
    selectedSiteIds: prefSiteIds,
    selectedSites: prefSites,
    isLoading: preferencesLoading,
  } = useAnalyticsPreferences({
    groupId: options?.groupId,
    userId: options?.userId,
    enabled: options?.enabled,
  });

  const resolvedGroupId = options?.groupId ?? '';
  const resolvedUserId = options?.userId ?? '';

  const { trigger, isMutating } = useUpdateUserPreferences();

  // The just-saved Site objects win over the (briefly stale) preference
  // payload right after a save. The override only applies while the user
  // stays in the saved group — a group switch falls back to that group's
  // preference immediately.
  const [savedOverride, setSavedOverride] = useState<SavedOverride | null>(
    null
  );
  const [saveError, setSaveError] = useState<string | null>(null);

  const activeOverride =
    savedOverride &&
    resolvedGroupId &&
    savedOverride.groupId === resolvedGroupId
      ? savedOverride
      : null;

  const savedSiteIds = useMemo(
    () =>
      activeOverride ? activeOverride.sites.map(site => site._id) : prefSiteIds,
    [activeOverride, prefSiteIds]
  );

  const savedSites = useMemo(
    () => (activeOverride ? activeOverride.sites : prefSites),
    [activeOverride, prefSites]
  );

  // Convergence: once the post-save preferences refetch lands and its id set
  // matches the just-saved selection, drop the local override — the server
  // payload is authoritative. Runs at most once per save (after clearing,
  // activeOverride is null and the effect exits early — no render loop).
  useEffect(() => {
    if (!activeOverride || preferencesLoading) {
      return;
    }
    if (
      savedOverrideMatchesPreference(
        activeOverride.sites.map(site => site._id),
        prefSiteIds
      )
    ) {
      setSavedOverride(null);
    }
  }, [activeOverride, preferencesLoading, prefSiteIds]);

  const save = useCallback(
    async (sites: Site[]): Promise<boolean> => {
      if (!resolvedUserId || !resolvedGroupId) {
        setSaveError('You need to be signed in to save your locations.');
        return false;
      }

      setSaveError(null);
      try {
        await trigger({
          user_id: resolvedUserId,
          group_id: resolvedGroupId,
          selected_sites: sites,
        });
        setSavedOverride({
          groupId: resolvedGroupId,
          sites,
        });
        return true;
      } catch (err) {
        // Log the message only — raw axios errors carry Authorization
        // headers that must never reach logs/Sentry (AGENTS.md).
        console.error(
          'Failed to save location selection:',
          err instanceof Error ? err.message : err
        );
        setSaveError(
          'Failed to save your locations. Please check your connection and try again.'
        );
        return false;
      }
    },
    [resolvedGroupId, resolvedUserId, trigger]
  );

  return {
    savedSiteIds,
    savedSites,
    isInitialLoading: preferencesLoading,
    isSaving: isMutating,
    error: saveError,
    save,
  };
};
