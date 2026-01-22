import { useCallback, useEffect, useRef, useState } from 'react';

import type { BillboardState, DataType, Item } from '../types';

export const useBillboardControls = (
  propDataType?: DataType,
  propItemName?: string,
  autoRotate = false,
) => {
  const [dataType, setDataType] = useState<DataType>(propDataType || 'grid');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null);

  const isMountedRef = useRef(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const copiedTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle data type change
  const handleDataTypeChange = useCallback((newDataType: DataType) => {
    setDataType(newDataType);
    setSelectedItem(null);
    setDataLoaded(false);
    setSearchQuery('');
    setIsDropdownOpen(false);
  }, []);

  // Handle item selection
  const handleItemSelect = useCallback((item: Item | null) => {
    setSelectedItem(item);
    setSearchQuery('');
    setIsDropdownOpen(false);
  }, []);

  // Handle copy URL
  const handleCopyUrl = useCallback(
    async (item: Item) => {
      const itemName = (item.name || item.long_name || '')
        .toLowerCase()
        .replace(/\s+/g, '-');
      const url = `${window.location.origin}/billboard/${dataType}/${encodeURIComponent(itemName)}`;

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
    },
    [dataType],
  );

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
        setSearchQuery('');
      }
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
    dataType,
    selectedItem,
    currentMeasurement: null, // This will be managed by useMeasurements hook
    dataLoaded,
    currentSiteIndex: 0, // This will be managed by useMeasurements hook
    currentDeviceIndex: 0, // This will be managed by useMeasurements hook
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
    handleDataTypeChange,
    handleItemSelect,
    handleCopyUrl,

    // Props
    propItemName,
    autoRotate,
  };
};
