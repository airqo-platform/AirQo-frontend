import { useState, useEffect, useCallback } from 'react';
import { MAX_FAVORITES } from '../constants';

export const useFavoritesSelection = (
  filteredSites,
  initialSelectedIds = [],
) => {
  const [selectedSites, setSelectedSites] = useState([]);
  const [sidebarSites, setSidebarSites] = useState([]);
  const [clearSelected, setClearSelected] = useState(false);
  const [error, setError] = useState('');

  // Initialize selected sites when data is loaded
  useEffect(() => {
    if (filteredSites.length > 0 && initialSelectedIds.length > 0) {
      const initialSelected = filteredSites.filter((site) =>
        initialSelectedIds.includes(site._id),
      );
      setSelectedSites(initialSelected);
      setSidebarSites(initialSelected);
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
      setError('Invalid location data. Please try again.');
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
      if (prev.length >= MAX_FAVORITES) {
        setError(
          `You can only add up to ${MAX_FAVORITES} locations to your favorites.`,
        );
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
