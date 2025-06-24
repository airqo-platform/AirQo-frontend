'use client';

import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useOrganization } from '@/app/providers/UnifiedGroupProvider';
import { setOpenModal } from '@/lib/store/services/downloadModal';
import AQNumberCard from '@/features/airQuality-cards';
import Modal from '@/features/download-insights-locations';
import {
  useOrganizationAnalyticsData,
  OrganizationAnalyticsControls,
  AnalyticsChartsGrid,
} from '@/features/analytics-overview';
import AlertBox from '@/components/AlertBox';

import { useGetActiveGroup } from '@/app/providers/UnifiedGroupProvider';
import { useDeviceSummary } from '@/core/hooks/analyticHooks';
import { AiOutlinePlusCircle } from 'react-icons/ai';
import AirQualityLoadingSkeleton from '@/components/Skeleton/AirQualityLoadingSkeleton';
import Button from '@/components/Button';

const OrganizationInsightsPage = () => {
  const dispatch = useDispatch();
  const { organization } = useOrganization();
  const [alert, setAlert] = useState({ type: '', message: '', show: false });
  const isModalOpen = useSelector((state) => state.modal.openModal);

  // Get active group info
  const { title: groupTitle } = useGetActiveGroup();

  // Fetch device summary for the active group
  const {
    data: deviceSummaryData,
    isLoading: isDeviceSummaryLoading,
    isError: isDeviceSummaryError,
  } = useDeviceSummary(groupTitle, {});

  // Use our custom hook for organization data management
  const {
    allSiteData,
    chartData,
    dateRange,
    apiDateRange,
    sitesError,
    sitesErrorMessage,
    hasSites,
    totalSites,
    onlineSites,
    isChartLoading,
    isError,
    error,
    handleTimeFrameChange,
    handlePollutantChange,
    handleDateChange,
    refetch,
  } = useOrganizationAnalyticsData(organization);

  const handleCloseModal = useCallback(() => {
    dispatch(setOpenModal(false));
  }, [dispatch]);

  if (!organization) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">
          Organization not found
        </h3>
        <p className="mt-2 text-gray-600">
          Please check your organization URL and try again.
        </p>
      </div>
    );
  }

  // Handle sites loading error
  if (sitesError && sitesErrorMessage) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-red-600">
          Unable to load organization sites
        </h3>
        <p className="mt-2 text-gray-600">{sitesErrorMessage}</p>
        <p className="mt-1 text-sm text-gray-500">
          Please try refreshing the page or contact support if the issue
          persists.
        </p>
      </div>
    );
  }

  // Show loading text while fetching device summary
  if (isDeviceSummaryLoading) {
    return <AirQualityLoadingSkeleton />;
  }

  // Check if there are no devices and display a message
  if (
    !isDeviceSummaryLoading &&
    !isDeviceSummaryError &&
    deviceSummaryData.length === 0
  ) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-primary bg-opacity-10 rounded-lg p-8">
        <div className="flex flex-col items-center text-center space-y-4 max-w-sm">
          {/* Icon */}
          <AiOutlinePlusCircle className="text-primary text-5xl" />

          {/* Headline */}
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Let’s get things started!
          </h3>

          {/* Subcopy */}
          <p className="text-gray-600 dark:text-gray-400">
            Deploy your first device to begin collecting air quality data and
            unlock real‑time insights for your organization.
          </p>

          {/* CTA Button */}
          <Button
            onClick={() => {
              const baseUrl =
                process.env.NEXT_PUBLIC_ALLOW_DEV_TOOLS === 'staging'
                  ? 'https://staging-vertex.airqo.net/login'
                  : 'https://vertex.airqo.net/login';
              window.open(baseUrl, '_blank', 'noopener,noreferrer');
            }}
          >
            Deploy a device
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <AlertBox
        type={alert.type}
        message={alert.message}
        show={alert.show}
        hide={() => setAlert({ ...alert, show: false })}
      />

      <div className="flex flex-col gap-8">
        {/* Organization Header and Controls Section */}
        <OrganizationAnalyticsControls
          organization={organization}
          chartData={chartData}
          dateRange={dateRange}
          hasSites={hasSites}
          totalSites={totalSites}
          onlineSites={onlineSites}
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

export default OrganizationInsightsPage;
