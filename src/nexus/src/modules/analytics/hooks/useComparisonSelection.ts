'use client';

import { useCallback, useMemo, useState } from 'react';
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
   * Persisted selection for the active group — the preference payload until
   * the first local save, then the locally-saved ids (which the invalidated
   * preference list confirms moments later).
   */
  savedSiteIds: string[];
  /** Full `Site` objects behind `savedSiteIds`, from the preference payload. */
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
  ids: string[];
}

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
 * A successful save also invalidates every `preferences/*` SWR key
 * (see useUpdateUserPreferences), so the read side converges on the server
 * state without extra wiring here.
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

  // Locally-saved ids win over the (briefly stale) preference payload right
  // after a save; they are dropped on a group switch so the next group's
  // preference is authoritative again.
  const [savedOverride, setSavedOverride] = useState<SavedOverride | null>(
    null
  );
  const [saveError, setSaveError] = useState<string | null>(null);

  const savedSiteIds = useMemo(() => {
    if (
      savedOverride &&
      resolvedGroupId &&
      savedOverride.groupId === resolvedGroupId
    ) {
      return savedOverride.ids;
    }
    return prefSiteIds;
  }, [prefSiteIds, resolvedGroupId, savedOverride]);

  const savedSites = useMemo(
    () => (savedSiteIds === prefSiteIds ? prefSites : []),
    [prefSiteIds, prefSites, savedSiteIds]
  );

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
          ids: sites.map(site => site._id),
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
