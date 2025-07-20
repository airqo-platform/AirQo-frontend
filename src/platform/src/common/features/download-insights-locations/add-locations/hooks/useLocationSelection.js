import { useState, useCallback, useEffect } from 'react';
import { MAX_LOCATIONS } from '../constants';

/**
 * Custom hook for managing location selection logic
 * @param {Array} filteredSites – all site objects available for selection
 * @param {string[]} initialSelectedIds – `_id` values to pre-select
 */
export const useLocationSelection = (
  filteredSites,
  initialSelectedIds = [],
) => {
  const [selectedSites, setSelectedSites] = useState([]);
  const [sidebarSites, setSidebarSites] = useState([]);
  const [clearSelected, setClearSelected] = useState(false);
  const [error, setError] = useState('');

  // Initialise from preferences
  useEffect(() => {
    if (filteredSites.length && initialSelectedIds.length) {
      const matching = filteredSites.filter((site) =>
        initialSelectedIds.includes(site._id),
      );
      if (matching.length) {
        setSelectedSites(matching);
        setSidebarSites(matching);
      }
    }
  }, [filteredSites, initialSelectedIds]);

  const handleClearSelection = useCallback(() => {
    setSelectedSites([]);
    setSidebarSites([]);
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
        setSidebarSites((sidebar) => sidebar.filter((s) => s._id !== site._id));
        setError('');
        return removed;
      }

      /* ---------- ADD ---------- */
      if (prev.length >= MAX_LOCATIONS) {
        setError(`You can select up to ${MAX_LOCATIONS} locations only.`);
        return prev; // unchanged
      }

      const added = [...prev, site];
      setSidebarSites((sidebar) =>
        sidebar.some((s) => s._id === site._id) ? sidebar : [...sidebar, site],
      );
      setError('');
      return added;
    });
  }, []);

  return {
    selectedSites,
    setSelectedSites,
    sidebarSites,
    clearSelected,
    error,
    setError,
    handleClearSelection,
    handleToggleSite,
  };
};
