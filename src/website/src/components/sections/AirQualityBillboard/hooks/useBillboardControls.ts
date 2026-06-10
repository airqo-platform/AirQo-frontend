import { useCallback, useEffect, useRef, useState } from 'react';

import type { BillboardState, DataType, Item } from '../types';

export const useBillboardControls = (
  propDataType?: DataType,
  propItemName?: string,
  autoRotate = false,
) => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null);

  const isMountedRef = useRef(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const copiedTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle item selection
  const handleItemSelect = useCallback((item: Item | null) => {
    setSelectedItem(item);
    setSearchQuery('');
    setIsDropdownOpen(false);
  }, []);

  // Handle copy URL
  const handleCopyUrl = useCallback(async (item: Item) => {
    const itemName = (item.name || item.long_name || '')
      .toLowerCase()
      .replace(/\s+/g, '-');
    const url = `${window.location.origin}/billboard/grid/${encodeURIComponent(itemName)}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopiedItemId(item._id);

      // Clear any existing timeout
      if (copiedTimeoutRef.current) {
        clearTimeout(copiedTimeoutRef.current);
      }

      // Set new timeout
      copiedTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setCopiedItemId(null);
        }
      }, 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  }, []);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If the click is inside the original dropdown container, ignore
      if (
        dropdownRef.current &&
        dropdownRef.current.contains(event.target as Node)
      ) {
        return;
      }

      // Also ignore clicks inside the portal-rendered dropdown (it lives on document.body)
      const portalEl = document.querySelector('[data-billboard-portal]');
      if (portalEl && portalEl.contains(event.target as Node)) {
        return;
      }

      // Otherwise it's an outside click
      setIsDropdownOpen(false);
      setSearchQuery('');
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (copiedTimeoutRef.current) {
        clearTimeout(copiedTimeoutRef.current);
      }
    };
  }, []);

  const state: BillboardState = {
    dataType: 'grid',
    selectedItem,
    currentMeasurement: null, // This will be managed by useMeasurements hook
    dataLoaded,
    currentSiteIndex: 0, // This will be managed by useMeasurements hook
    searchQuery,
    isDropdownOpen,
    hoveredItemId,
    copiedItemId,
  };

  return {
    // State
    ...state,

    // Refs
    dropdownRef,

    // Actions
    setDataLoaded,
    setHoveredItemId,
    setSearchQuery,
    setIsDropdownOpen,
    handleItemSelect,
    handleCopyUrl,

    // Props
    propItemName,
    autoRotate,
  };
};
