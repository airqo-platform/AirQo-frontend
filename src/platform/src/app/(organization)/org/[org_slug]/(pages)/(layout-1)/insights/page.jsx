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
import EmptyState from '@/common/components/EmptyState';
import ErrorState from '@/common/components/ErrorState';

import { useGetActiveGroup } from '@/app/providers/UnifiedGroupProvider';
import { useDeviceSummary } from '@/core/hooks/analyticHooks';
import AirQualityLoadingSkeleton from '@/components/Skeleton/AirQualityLoadingSkeleton';

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
      <ErrorState
        type="notFound"
        title="Organization not found"
        description="Please check your organization URL and try again."
      />
    );
  }

  if (sitesError && sitesErrorMessage) {
    return (
      <ErrorState
        type="server"
        title="Unable to load organization sites"
        description={
          <>
            {sitesErrorMessage}
            <br />
            <span className="text-sm text-gray-500">
              Please try refreshing the page or contact support if the issue
              persists.
            </span>
          </>
        }
      />
    );
  }

  if (isDeviceSummaryLoading) {
    return <AirQualityLoadingSkeleton />;
  }

  if (
    !isDeviceSummaryLoading &&
    !isDeviceSummaryError &&
    deviceSummaryData.length === 0
  ) {
    return (
      <EmptyState
        preset="devices"
        actionLabel="Deploy a device"
        onAction={() => {
          const baseUrl =
            process.env.NEXT_PUBLIC_ALLOW_DEV_TOOLS === 'staging'
              ? 'https://staging-vertex.airqo.net/login'
              : 'https://vertex.airqo.net/login';
          window.open(baseUrl, '_blank', 'noopener,noreferrer');
        }}
        size="medium"
        variant="card"
      />
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
