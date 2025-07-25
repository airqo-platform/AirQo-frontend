import { useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setTempSelectedSites } from '@/lib/store/services/moreInsights';

/**
 * Custom hook for managing location selection logic specifically for More Insights
 * This hook doesn't save to user preferences but manages temporary state for analysis
 * @param {Array} filteredSites – all site objects available for selection
 * @param {Array} initialSelectedSites – site objects to pre-select
 */
export const useLocationSelectionForMoreInsights = (
  filteredSites,
  initialSelectedSites = [],
) => {
  const dispatch = useDispatch();
  const [selectedSites, setSelectedSites] = useState([]);
  const [sidebarSites, setSidebarSites] = useState([]);
  const [clearSelected, setClearSelected] = useState(false);
  const [error, setError] = useState('');

  // Initialize when component mounts or when initial selections change
  useEffect(() => {
    if (filteredSites.length > 0) {
      let initialSelection = [];

      if (initialSelectedSites && initialSelectedSites.length > 0) {
        initialSelection = initialSelectedSites;
      } else {
        // If no initial selections, select the first available site
        initialSelection = [filteredSites[0]];
      }

      setSelectedSites(initialSelection);
      setSidebarSites(initialSelection);
      dispatch(setTempSelectedSites(initialSelection));
    }
  }, [filteredSites, initialSelectedSites, dispatch]);

  const handleClearSelection = useCallback(() => {
    // For More Insights, we need at least one location selected
    if (filteredSites.length > 0) {
      const firstSite = filteredSites[0];
      setSelectedSites([firstSite]);
      setSidebarSites([firstSite]);
      setError('At least one location must be selected for analysis.');
    } else {
      setSelectedSites([]);
      setSidebarSites([]);
    }
    setClearSelected(true);
    // reset trigger after render with cleanup
    const timeoutId = setTimeout(() => setClearSelected(false), 100);
    return () => clearTimeout(timeoutId);
  }, [filteredSites]);

  const handleToggleSite = useCallback(
    (site) => {
      if (!site?._id) {
        setError('Invalid location data. Please try again.');
        return;
      }

      setSelectedSites((prev) => {
        const alreadySelected = prev.some((s) => s._id === site._id);
        let newSelection = [];

        /* ---------- REMOVE ---------- */
        if (alreadySelected) {
          // Don't allow removing if it's the only selected site
          if (prev.length === 1) {
            setError('At least one location must be selected for analysis.');
            return prev;
          }

          newSelection = prev.filter((s) => s._id !== site._id);
          setSidebarSites((sidebar) =>
            sidebar.filter((s) => s._id !== site._id),
          );
          setError('');
        } else {
          /* ---------- ADD ---------- */
          // For More Insights, we don't have a hard limit like regular add locations
          // But we should still prevent excessive selections for performance
          if (prev.length >= 20) {
            setError('You can select up to 20 locations for analysis.');
            return prev; // unchanged
          }

          newSelection = [...prev, site];
          setSidebarSites((sidebar) =>
            sidebar.some((s) => s._id === site._id)
              ? sidebar
              : [...sidebar, site],
          );
          setError('');
        }

        // Update Redux with new selection
        dispatch(setTempSelectedSites(newSelection));
        return newSelection;
      });
    },
    [dispatch],
  );

  // Custom setter that also updates sidebar sites and Redux
  const setSelectedSitesWithSidebar = useCallback(
    (sites) => {
      let newSites = [];

      if (typeof sites === 'function') {
        setSelectedSites((prev) => {
          newSites = sites(prev);
          setSidebarSites(newSites);
          dispatch(setTempSelectedSites(newSites));
          return newSites;
        });
      } else {
        newSites = sites;
        setSelectedSites(sites);
        setSidebarSites(sites);
        dispatch(setTempSelectedSites(sites));
      }
    },
    [dispatch],
  );

  return {
    selectedSites,
    setSelectedSites: setSelectedSitesWithSidebar,
    sidebarSites,
    clearSelected,
    error,
    setError,
    handleClearSelection,
    handleToggleSite,
  };
};
