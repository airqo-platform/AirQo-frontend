import { useState, useCallback, useEffect } from 'react';
import { MAX_LOCATIONS } from '../constants';

/**
 * Custom hook for managing location selection logic
 */
const useLocationSelection = (filteredSites, initialSelectedIds = []) => {
  const [selectedSites, setSelectedSites] = useState([]);
  const [sidebarSites, setSidebarSites] = useState([]);
  const [clearSelected, setClearSelected] = useState(false);
  const [error, setError] = useState('');

  // Initialize selected sites from preferences
  useEffect(() => {
    if (filteredSites.length > 0 && initialSelectedIds.length > 0) {
      const matchingSites = filteredSites.filter((site) =>
        initialSelectedIds.includes(site._id),
      );

      if (matchingSites.length > 0) {
        setSelectedSites(matchingSites);
        setSidebarSites(matchingSites);
      }
    }
  }, [filteredSites, initialSelectedIds]);

  const handleClearSelection = useCallback(() => {
    setSelectedSites([]);
    setSidebarSites([]);
    setClearSelected(true);
    setTimeout(() => setClearSelected(false), 100);
    setError('');
  }, []);

  const handleToggleSite = useCallback((site) => {
    if (!site || !site._id) {
      console.error('Invalid site object passed to handleToggleSite', site);
      return;
    }

    setSelectedSites((prev) => {
      const isSelected = prev.some((s) => s._id === site._id);

      // If already selected, remove it
      if (isSelected) {
        const newSelection = prev.filter((s) => s._id !== site._id);
        setSidebarSites((sidebarPrev) =>
          sidebarPrev.filter((s) => s._id !== site._id),
        );
        setError('');
        return newSelection;
      }

      // Check for maximum selection limit
      if (prev.length >= MAX_LOCATIONS) {
        setError(`You can select up to ${MAX_LOCATIONS} locations only.`);
        return prev;
      }

      // Add the new selection
      const newSelection = [...prev, site];
      setSidebarSites((sidebarPrev) => {
        if (!sidebarPrev.some((s) => s._id === site._id)) {
          return [...sidebarPrev, site];
        }
        return sidebarPrev;
      });

      setError('');
      return newSelection;
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

export default useLocationSelection;
