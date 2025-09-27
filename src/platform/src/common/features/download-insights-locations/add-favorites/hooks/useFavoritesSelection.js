import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
/* eslint-disable no-console */
import { MAX_FAVORITES } from '../constants';

/**
 * Custom hook for managing favorite location selection logic
 * @param {Array} filteredSites – all site objects available for selection
 * @param {string[]} initialSelectedIds – `_id` values to pre-select
 */
export const useFavoritesSelection = (
  filteredSites,
  initialSelectedIds = [],
) => {
  const [selectedSites, setSelectedSites] = useState([]); // All selected favorites
  const [clearSelected, setClearSelected] = useState(false);
  const [error, setError] = useState('');

  // Get user preferences from Redux store to get the full site objects
  const preferencesData = useSelector(
    (state) => state.defaults.individual_preferences,
  );

  // Get the full site objects from preferences
  const favoriteSitesFromPrefs = useMemo(() => {
    const first = preferencesData?.[0];
    return Array.isArray(first?.selected_sites) ? first.selected_sites : [];
  }, [preferencesData]);

  // Combine favorite sites from preferences with filtered sites for complete site data
  const allKnownSites = useMemo(() => {
    const siteMap = new Map();

    // Add filtered sites (current search/page data)
    filteredSites.forEach((site) => siteMap.set(site._id, site));

    // Add favorite sites from preferences (may include sites not in current page)
    favoriteSitesFromPrefs.forEach((site) => {
      if (site._id && !siteMap.has(site._id)) {
        siteMap.set(site._id, site);
      }
    });

    return Array.from(siteMap.values());
  }, [filteredSites, favoriteSitesFromPrefs]);

  // Initialize from preferences using the complete site data
  useEffect(() => {
    if (!initialSelectedIds.length) {
      setSelectedSites([]);
      return;
    }

    // Find sites from all known sites (filtered + preferences)
    const selectedFromAllKnown = allKnownSites.filter((site) =>
      initialSelectedIds.includes(site._id),
    );

    if (selectedFromAllKnown.length > 0) {
      setSelectedSites(selectedFromAllKnown);
    }
  }, [allKnownSites, initialSelectedIds]);

  const handleClearSelection = useCallback(() => {
    setSelectedSites([]);
    setClearSelected(true);
    // reset trigger after render
    setTimeout(() => setClearSelected(false), 100);
    setError('');
  }, []);

  const handleToggleSite = useCallback((site) => {
    if (!site?._id) {
      console.error('Invalid site object passed to handleToggleSite', site);
      return;
    }

    setSelectedSites((prev) => {
      const alreadySelected = prev.some((s) => s._id === site._id);

      /* ---------- REMOVE ---------- */
      if (alreadySelected) {
        const removed = prev.filter((s) => s._id !== site._id);
        setError('');
        return removed;
      }

      /* ---------- ADD ---------- */
      if (prev.length >= MAX_FAVORITES) {
        setError(`You can select up to ${MAX_FAVORITES} locations only.`);
        return prev; // unchanged
      }

      const added = [...prev, site];
      setError('');
      return added;
    });
  }, []);

  // Return selectedSites as sidebarSites - they represent all favorites
  return {
    selectedSites,
    setSelectedSites,
    sidebarSites: selectedSites, // All favorites should show in sidebar
    clearSelected,
    error,
    setError,
    handleClearSelection,
    handleToggleSite,
  };
};
