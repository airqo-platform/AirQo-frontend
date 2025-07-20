import { useEffect, useState, useCallback } from 'react';
import { dailyPredictionsApi } from '@/core/apis/predict';

export default function useWeeklyPredictions(selectedLocation) {
  const [weeklyPredictions, setWeeklyPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!selectedLocation?._id) {
      setWeeklyPredictions([]);
      return;
    }
    setIsLoading(true);
    try {
      if (
        Array.isArray(selectedLocation.forecast) &&
        selectedLocation.forecast.length
      ) {
        setWeeklyPredictions(selectedLocation.forecast);
      } else {
        const { forecasts = [] } = await dailyPredictionsApi(
          selectedLocation._id,
        );
        setWeeklyPredictions(forecasts);
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedLocation]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { weeklyPredictions, isLoading };
}
