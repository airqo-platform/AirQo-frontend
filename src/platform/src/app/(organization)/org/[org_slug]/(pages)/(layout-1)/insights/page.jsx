'use client';

import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useOrganization } from '@/app/providers/OrganizationProvider';
import withOrgAuth from '@/core/HOC/withOrgAuth';
import { setOpenModal } from '@/lib/store/services/downloadModal';
import AQNumberCard from '@/features/airQuality-cards';
import Modal from '@/features/download-insights-locations';
import {
  useOrganizationAnalyticsData,
  OrganizationAnalyticsControls,
  AnalyticsChartsGrid,
} from '@/features/analytics-overview';
import AlertBox from '@/components/AlertBox';

const OrganizationInsightsPage = ({ params: _params }) => {
  const dispatch = useDispatch();
  const { organization } = useOrganization();
  const [alert, setAlert] = useState({ type: '', message: '', show: false });
  const isModalOpen = useSelector((state) => state.modal.openModal);

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

export default withOrgAuth(OrganizationInsightsPage);
