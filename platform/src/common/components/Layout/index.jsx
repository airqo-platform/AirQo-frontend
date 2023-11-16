import React, { useState, useEffect, useCallback } from 'react';
import AuthenticatedSideBar from '@/components/SideBar/AuthenticatedSidebar';
import TopBar from '@/components/TopBar';
import {
  fetchUserPreferences,
  clearChartStore,
} from '@/lib/store/services/charts/userDefaultsSlice';
import {
  setChartSites,
  setChartDataRange,
  setTimeFrame,
  setChartType,
  setPollutant,
  resetChartStore,
  clearAll,
} from '@/lib/store/services/charts/ChartSlice';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserChecklists } from '@/lib/store/services/checklists/CheckData';
import { updateCards } from '@/lib/store/services/checklists/CheckList';
import Head from 'next/head';

const Layout = ({ pageTitle, children, topbarTitle, noBorderBottom }) => {
  // Constants
  const MAX_WIDTH = '(max-width: 1024px)';

  const dispatch = useDispatch();
  const chartData = useSelector((state) => state.chart);
  const userInfo = useSelector((state) => state.login.userInfo);
  const userPreferences = useSelector((state) => state.userDefaults.preferences);
  const [toggleDrawer, setToggleDrawer] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => JSON.parse(localStorage.getItem('collapsed')) || false,
  );

  // Fetching user preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      if (userInfo) {
        try {
          await dispatch(fetchUserPreferences(userInfo._id));
        } catch (error) {
          console.error(`Error getting user preferences: ${error}`);
        }
      }
    };

    fetchPreferences();
  }, [userInfo, dispatch]);

  useEffect(() => {
    const setChartProperties = async () => {
      if (userInfo && userPreferences && userPreferences.length > 0) {
        const { period, selected_sites, startDate, endDate, frequency, chartType, pollutant } =
          userPreferences[0];
        dispatch(clearAll());
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
  }, [userInfo, dispatch]);

  // Fetching user checklists
  useEffect(() => {
    if (userInfo?._id && !localStorage.getItem('dataFetched')) {
      dispatch(fetchUserChecklists(userInfo._id)).then((action) => {
        if (fetchUserChecklists.fulfilled.match(action)) {
          const { payload } = action;
          if (payload && payload.length > 0) {
            const { items } = payload[0];
            dispatch(updateCards(items));
            localStorage.setItem('dataFetched', 'true');
          } else {
            localStorage.setItem('dataFetched', 'true');
            return;
          }
        }
      });
    }
  }, [dispatch, userInfo]);

  useEffect(() => {
    localStorage.setItem('collapsed', collapsed);
  }, [collapsed]);

  // handling media query change
  useEffect(() => {
    const mediaQuery = window.matchMedia(MAX_WIDTH);
    const handleMediaQueryChange = (e) => {
      setToggleDrawer(false);
      setCollapsed(false);
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
      <div className=' w-screen h-screen  overflow-x-hidden' data-testid='layout'>
        <div className=' lg:flex w-screen h-screen'>
          <div>
            <AuthenticatedSideBar
              toggleDrawer={toggleDrawer}
              setToggleDrawer={setToggleDrawer}
              collapsed={collapsed}
              setCollapsed={setCollapsed}
            />
          </div>
          <div className='w-full overflow-x-hidden'>
            <TopBar
              topbarTitle={topbarTitle}
              noBorderBottom={noBorderBottom}
              toggleDrawer={toggleDrawer}
              setToggleDrawer={setToggleDrawer}
              collapsed={collapsed}
              setCollapsed={setCollapsed}
            />
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default Layout;
