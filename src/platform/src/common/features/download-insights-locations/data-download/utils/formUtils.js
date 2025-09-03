import { useMemo } from 'react';
import {
  POLLUTANT_OPTIONS,
  DATA_TYPE_OPTIONS,
  FREQUENCY_OPTIONS,
  FILE_TYPE_OPTIONS,
  DEVICE_CATEGORY_OPTIONS,
} from '../constants';

/**
 * Utility functions for form management
 */

// Default form state
export const getDefaultFormData = () => ({
  title: { name: 'Untitled Report' },
  deviceCategory: DEVICE_CATEGORY_OPTIONS[0], // Default to 'lowcost'
  dataType: DATA_TYPE_OPTIONS[0],
  pollutant: [POLLUTANT_OPTIONS[0]],
  duration: null,
  frequency: FREQUENCY_OPTIONS[0],
  fileType: FILE_TYPE_OPTIONS[0],
});

// Form validation
export const validateFormData = (formData, selectedItems) => {
  if (!formData.duration?.name?.start || !formData.duration?.name?.end) {
    return 'Please select a valid date range';
  }

  if (!selectedItems.length) {
    return 'Please select at least one location to download data from';
  }

  const startDate = new Date(formData.duration.name.start);
  const endDate = new Date(formData.duration.name.end);

  // Validate date range
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return 'Invalid date selection. Please choose valid dates';
  }

  // Duration validation based on frequency
  const frequencyLower = formData.frequency.name.toLowerCase();
  if (frequencyLower === 'hourly') {
    const diffMs = endDate - startDate;
    const sixMonthsMs = 180 * 24 * 60 * 60 * 1000;
    if (diffMs > sixMonthsMs) {
      return 'For hourly data, please limit your selection to 6 months';
    }
  }

  return null;
};

// Get duration guidance
export const useDurationGuidance = (frequency) => {
  return useMemo(() => {
    if (frequency?.name?.toLowerCase() === 'hourly') {
      return 'For hourly data, limit selection to 6 months';
    }
    return null;
  }, [frequency]);
};

// Check if download should be disabled
export const useDownloadDisabled = (
  isLoadingSiteIds,
  downloadLoading,
  formData,
  selectedItems,
) => {
  return useMemo(() => {
    return (
      isLoadingSiteIds ||
      downloadLoading ||
      !formData.duration ||
      selectedItems.length === 0
    );
  }, [
    isLoadingSiteIds,
    downloadLoading,
    formData.duration,
    selectedItems.length,
  ]);
};

// Get footer info
export const useFooterInfo = (
  formError,
  statusMessage,
  messageType,
  selectedItems,
  formData,
) => {
  return useMemo(() => {
    const MESSAGE_TYPES = {
      ERROR: 'error',
      WARNING: 'warning',
      INFO: 'info',
    };

    if (formError) {
      return { message: formError, type: MESSAGE_TYPES.ERROR };
    }

    if (statusMessage) {
      return { message: statusMessage, type: messageType };
    }

    if (selectedItems.length === 0) {
      return {
        message: 'Select at least one location to continue',
        type: MESSAGE_TYPES.INFO,
      };
    }

    if (!formData.duration) {
      return {
        message: 'Please select a date range before downloading',
        type: MESSAGE_TYPES.WARNING,
      };
    }

    return { message: 'Ready to download', type: MESSAGE_TYPES.INFO };
  }, [
    formError,
    statusMessage,
    messageType,
    selectedItems.length,
    formData.duration,
  ]);
};
