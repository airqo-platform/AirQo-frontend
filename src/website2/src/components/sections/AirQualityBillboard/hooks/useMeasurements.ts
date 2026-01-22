import { useCallback, useEffect, useState } from 'react';
import { mutate } from 'swr';

import {
  useCohortMeasurements,
  useGridMeasurements,
} from '@/hooks/useApiHooks';

import type { DataType, Item, Measurement } from '../types';
import { getValidMeasurements } from '../utils';

export const useMeasurements = (
  dataType: DataType,
  selectedItem: Item | null,
) => {
  const [currentMeasurement, setCurrentMeasurement] =
    useState<Measurement | null>(null);
  const [currentSiteIndex, setCurrentSiteIndex] = useState(0);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);

  // Measurements hooks
  const {
    data: cohortMeasurements,
    isLoading: cohortMeasurementsLoading,
    error: cohortMeasurementsError,
  } = useCohortMeasurements(
    selectedItem && dataType === 'cohort' ? selectedItem._id : null,
    { limit: 80 },
  );

  const {
    data: gridMeasurements,
    isLoading: gridMeasurementsLoading,
    error: gridMeasurementsError,
  } = useGridMeasurements(
    selectedItem && dataType === 'grid' ? selectedItem._id : null,
    { limit: 80 },
  );

  // Get current measurements data
  const measurementsData =
    dataType === 'cohort' ? cohortMeasurements : gridMeasurements;
  const measurementsLoading =
    dataType === 'cohort' ? cohortMeasurementsLoading : gridMeasurementsLoading;
  const measurementsError =
    dataType === 'cohort' ? cohortMeasurementsError : gridMeasurementsError;

  // Update current measurement based on current index
  const updateMeasurement = useCallback(() => {
    if (!selectedItem || !measurementsData?.measurements) return;

    const measurements = measurementsData.measurements;
    const validMeasurements = getValidMeasurements(measurements);

    if (validMeasurements.length > 0) {
      if (dataType === 'grid') {
        const index = currentSiteIndex % validMeasurements.length;
        setCurrentMeasurement(validMeasurements[index]);
      } else {
        const index = currentDeviceIndex % validMeasurements.length;
        setCurrentMeasurement(validMeasurements[index]);
      }
    } else {
      // If no valid measurements, set to first measurement if available and has valid PM2.5
      if (
        measurements.length > 0 &&
        Number.isFinite(measurements[0]?.pm2_5?.value)
      ) {
        setCurrentMeasurement(measurements[0]);
      } else {
        setCurrentMeasurement(null);
      }
    }
  }, [
    measurementsData,
    dataType,
    currentSiteIndex,
    currentDeviceIndex,
    selectedItem,
  ]);

  // Set initial measurement when measurements data loads
  useEffect(() => {
    if (!selectedItem || !measurementsData?.measurements) return;

    const measurements = measurementsData.measurements;
    if (measurements.length > 0 && !currentMeasurement) {
      updateMeasurement();
    }
  }, [
    measurementsData?.measurements,
    currentMeasurement,
    updateMeasurement,
    selectedItem,
  ]);

  // Auto-rotate measurement every 20 seconds
  useEffect(() => {
    if (!selectedItem) return;

    const interval = setInterval(() => {
      const measurements = measurementsData?.measurements;
      const validMeasurements = measurements
        ? getValidMeasurements(measurements)
        : [];

      if (validMeasurements.length > 0) {
        if (dataType === 'grid') {
          setCurrentSiteIndex((prev) => (prev + 1) % validMeasurements.length);
        } else {
          setCurrentDeviceIndex(
            (prev) => (prev + 1) % validMeasurements.length,
          );
        }
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [dataType, measurementsData, selectedItem]);

  // Update measurement when index changes
  useEffect(() => {
    updateMeasurement();
  }, [currentSiteIndex, currentDeviceIndex, updateMeasurement]);

  // Force revalidation when item changes
  const forceMeasurementsRefresh = useCallback(() => {
    if (selectedItem) {
      if (dataType === 'cohort') {
        mutate(
          `cohortMeasurements-${selectedItem._id}-${JSON.stringify({ limit: 80 })}`,
        );
      } else {
        mutate(
          `gridMeasurements-${selectedItem._id}-${JSON.stringify({ limit: 80 })}`,
        );
      }
    }
  }, [dataType, selectedItem]);

  // Reset indices when item changes
  const resetIndices = useCallback(() => {
    setCurrentSiteIndex(0);
    setCurrentDeviceIndex(0);
    setCurrentMeasurement(null);
  }, []);

  return {
    // Data
    measurementsData,
    currentMeasurement,

    // State
    currentSiteIndex,
    currentDeviceIndex,

    // Loading and errors
    measurementsLoading,
    measurementsError,

    // Actions
    forceMeasurementsRefresh,
    resetIndices,
    updateMeasurement,
  };
};
