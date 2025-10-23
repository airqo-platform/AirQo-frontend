import { useState, useMemo, useCallback } from 'react';
import { useActiveGroupCohortDevices } from '../hooks/useDevice';
import { normalizeDevicesData } from '../utils/deviceUtils';
import { useDebounce } from './useDebounce';
import type { NormalizedDeviceData, RawDeviceData } from '../utils/deviceUtils';
import type { CohortDevicesParams, CohortDevicesMeta } from '../types/api';

export interface UseDevicesDataParams {
  enabled?: boolean;
  initialPageSize?: number;
  maxLimit?: number;
  category?: string;
}

export interface UseDevicesDataResult {
  // Data
  devices: NormalizedDeviceData[];
  totalDevices: number;
  totalPages: number;
  currentPage: number;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Pagination controls
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  pageSize: number;

  // Search controls
  searchTerm: string;
  setSearchTerm: (term: string) => void;

  // Category filter
  category: string;
  setCategory: (category: string) => void;

  // Raw metadata
  meta?: CohortDevicesMeta;
}

/**
 * Enhanced hook for fetching and managing devices data with server-side pagination and search
 * Implements proper server-side operations with max limit of 80 per API constraints
 */
export function useDevicesData({
  enabled = true,
  initialPageSize = 6,
  maxLimit = 80,
  category = '',
}: UseDevicesDataParams = {}): UseDevicesDataResult {
  // State for pagination, search, and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(Math.min(initialPageSize, maxLimit));
  const [searchTerm, setSearchTerm] = useState('');
  const [deviceCategory, setDeviceCategory] = useState(category);

  // Debounce search to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Build API parameters with proper server-side pagination
  const apiParams = useMemo((): CohortDevicesParams => {
    const effectivePageSize = Math.min(pageSize, maxLimit);
    const params: CohortDevicesParams = {
      limit: effectivePageSize,
      skip: (currentPage - 1) * effectivePageSize,
    };

    // Add search parameter if provided
    if (debouncedSearchTerm.trim()) {
      params.search = debouncedSearchTerm.trim();
    }

    // Add category filter if provided
    if (deviceCategory.trim()) {
      params.category = deviceCategory.trim();
    }

    return params;
  }, [currentPage, pageSize, debouncedSearchTerm, deviceCategory, maxLimit]);

  // Fetch data using the enhanced hook
  const { data, error, isLoading } = useActiveGroupCohortDevices(
    enabled ? apiParams : undefined
  );

  // Normalize devices data
  const normalizedDevices = useMemo(() => {
    if (!data?.devices || !Array.isArray(data.devices)) {
      return [];
    }
    return normalizeDevicesData(data.devices as RawDeviceData[]);
  }, [data?.devices]);

  // Handlers for pagination, search, and filtering
  const handleSetSearchTerm = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page on search
  }, []);

  const handleSetPageSize = useCallback(
    (size: number) => {
      const effectiveSize = Math.min(size, maxLimit);
      setPageSize(effectiveSize);
      setCurrentPage(1); // Reset to first page when page size changes
    },
    [maxLimit]
  );

  const handleSetCategory = useCallback((cat: string) => {
    setDeviceCategory(cat);
    setCurrentPage(1); // Reset to first page on category change
  }, []);

  return {
    // Data
    devices: normalizedDevices,
    totalDevices: data?.meta?.total ?? 0,
    totalPages: data?.meta?.totalPages ?? 1,
    currentPage,

    // Loading states
    isLoading,
    error: typeof error === 'string' ? error : (error?.message ?? null),

    // Pagination controls
    setCurrentPage,
    setPageSize: handleSetPageSize,
    pageSize: Math.min(pageSize, maxLimit),

    // Search controls
    searchTerm,
    setSearchTerm: handleSetSearchTerm,

    // Category filter
    category: deviceCategory,
    setCategory: handleSetCategory,

    // Raw metadata
    meta: data?.meta,
  };
}
