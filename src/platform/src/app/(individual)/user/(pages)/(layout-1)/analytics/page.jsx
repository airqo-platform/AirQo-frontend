'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setOpenModal } from '@/lib/store/services/downloadModal';
import AQNumberCard from '@/features/airQuality-cards';
import Modal from '@/features/download-insights-locations';
import {
  useAnalyticsOverviewData,
  AnalyticsControls,
  AnalyticsChartsGrid,
} from '@/features/analytics-overview';
import AlertBox from '@/components/AlertBox';
import { useOutsideClick } from '@/core/hooks';
import { useTour } from '@/features/tours/contexts/TourProvider';
import { setChartSites } from '@/lib/store/services/charts/ChartSlice';

const AuthenticatedHomePage = () => {
  const dispatch = useDispatch();
  const { startTourForCurrentPath, run } = useTour();
  const isModalOpen = useSelector((state) => state.modal.openModal);
  const [alert, setAlert] = useState({ type: '', message: '', show: false });
  const [customise, setCustomise] = useState(false);
  const preferenceData = useSelector(
    (state) => state.defaults.individual_preferences,
  );
  const customiseRef = useRef();

  useOutsideClick(customiseRef, () => {
    if (customise) setCustomise(false);
  });

  // Use our custom hook for data management
  const {
    allSiteData,
    chartData,
    dateRange,
    apiDateRange,
    isChartLoading,
    isError,
    error,
    handleTimeFrameChange,
    handlePollutantChange,
    handleDateChange,
    refetch,
  } = useAnalyticsOverviewData();

  const handleCloseModal = useCallback(() => {
    dispatch(setOpenModal(false));
  }, [dispatch]);

  useEffect(() => {
    if (!run) {
      const timer = setTimeout(() => {
        startTourForCurrentPath();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [startTourForCurrentPath, run]);

  /**
   * Sets chart details based on user preferences.
   */
  useEffect(() => {
    if (
      preferenceData &&
      preferenceData.length > 0 &&
      preferenceData[0]?.selected_sites
    ) {
      const { selected_sites } = preferenceData[0];
      const chartSites = selected_sites
        .map((site) => site?._id)
        .filter(Boolean);
      dispatch(setChartSites(chartSites));
    }
  }, [dispatch, preferenceData]);

  return (
    <>
      <AlertBox
        type={alert.type}
        message={alert.message}
        show={alert.show}
        hide={() => setAlert({ ...alert, show: false })}
      />

      <div className="flex flex-col gap-8">
        {/* Controls Section */}
        <AnalyticsControls
          chartData={chartData}
          dateRange={dateRange}
          onTimeFrameChange={handleTimeFrameChange}
          onPollutantChange={handlePollutantChange}
          onDateChange={handleDateChange}
        />

        {/* AQ Number Card */}
        <AQNumberCard />

        {/* Charts Section */}
        <AnalyticsChartsGrid
          allSiteData={allSiteData}
          isChartLoading={isChartLoading}
          isError={isError}
          error={error}
          refetch={refetch}
          apiDateRange={apiDateRange}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
};

export default AuthenticatedHomePage;
