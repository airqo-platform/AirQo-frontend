import React, { useState, useEffect } from 'react';
import AuthenticatedSideBar from '@/components/SideBar/AuthenticatedSidebar';
import TopBar from '@/components/TopBar';
import {
  setChartSites,
  setChartDataRange,
  setTimeFrame,
  setChartType,
  setPollutant,
  resetChartStore,
} from '@/lib/store/services/charts/ChartSlice';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserChecklists } from '@/lib/store/services/checklists/CheckData';
import { updateCards } from '@/lib/store/services/checklists/CheckList';
import Head from 'next/head';
import { toggleSidebar } from '@/lib/store/services/sideBar/SideBarSlice';

const Layout = ({
  pageTitle = 'AirQo Analytics',
  children,
  topbarTitle,
  noBorderBottom,
  noTopNav = true,
}) => {
  // Constants
  const MAX_WIDTH = '(max-width: 1024px)';
  const dispatch = useDispatch();
  const chartData = useSelector((state) => state.chart);
  const userInfo = useSelector((state) => state.login.userInfo);
  const preferenceData = useSelector((state) => state.defaults.individual_preferences) || [];

  useEffect(() => {
    const setChartProperties = async () => {
      if (userInfo && preferenceData && preferenceData.length > 0) {
        const { period, selected_sites, startDate, endDate, frequency, chartType, pollutant } =
          preferenceData[0];
        // console.log(selected_sites);
        try {
          const chartSites = selected_sites
            ? selected_sites.map((site) => site['_id'])
            : chartData.chartSites;

          await dispatch(setChartSites(chartSites.slice(0, 4)));
          await dispatch(
            setChartDataRange({
              startDate: startDate || chartData.chartDataRange.startDate,
              endDate: endDate || chartData.chartDataRange.endDate,
              label: period.label || chartData.chartDataRange.label,
            }),
          );
          await dispatch(setTimeFrame(frequency || chartData.timeFrame));
          await dispatch(setChartType(chartType || chartData.chartType));
          await dispatch(setPollutant(pollutant || chartData.pollutionType));
        } catch (error) {
          dispatch(resetChartStore());
          console.error(`Error setting chart properties: ${error}`);
        }
      } else {
        dispatch(resetChartStore());
      }
    };

    setChartProperties();
  }, [userInfo, preferenceData, dispatch]);

  // Fetching user checklists
  const fetchData = () => {
    if (userInfo?._id && !localStorage.getItem('dataFetched')) {
      dispatch(fetchUserChecklists(userInfo._id)).then((action) => {
        if (fetchUserChecklists.fulfilled.match(action)) {
          const { payload } = action;
          if (payload && payload.length > 0) {
            const { items } = payload[0];
            dispatch(updateCards(items));
          }
          localStorage.setItem('dataFetched', 'true');
        }
      });
    }
  };

  useEffect(fetchData, [dispatch, userInfo]);

  // handling media query change
  useEffect(() => {
    const mediaQuery = window.matchMedia(MAX_WIDTH);
    const handleMediaQueryChange = (e) => {
      if (e.matches) {
        dispatch(toggleSidebar());
      }
    };

    mediaQuery.addEventListener('change', handleMediaQueryChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaQueryChange);
    };
  }, []);

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta property='og:title' content={pageTitle} key='title' />
      </Head>
      <div className='w-full h-dvh overflow-hidden' data-testid='layout'>
        <div className='flex'>
          <AuthenticatedSideBar />
          <div className='w-full h-dvh overflow-y-auto transition-all duration-300 ease-in-out'>
            {noTopNav && (
              <div className='sticky top-0 z-50'>
                <TopBar topbarTitle={topbarTitle} noBorderBottom={noBorderBottom} />
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default Layout;
