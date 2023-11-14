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
  setDefaultID,
  resetChartStore,
} from '@/lib/store/services/charts/ChartSlice';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserChecklists } from '@/lib/store/services/checklists/CheckData';
import { updateCards } from '@/lib/store/services/checklists/CheckList';

const Layout = ({ children, topbarTitle, noBorderBottom }) => {
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

  useEffect(() => {
    const fetchPreferences = async () => {
      if (userInfo && !userPreferences) {
        try {
          await dispatch(fetchUserPreferences(userInfo._id));
        } catch (error) {
          console.error(`Error getting user preferences: ${error}`);
        }
      }
    };

    fetchPreferences();
  }, [userInfo, userPreferences, dispatch]);

  useEffect(() => {
    const setChartProperties = async () => {
      if (userInfo && userPreferences && userPreferences.length > 0) {
        const { period, site_ids, startDate, endDate, frequency, chartType, pollutant } =
          userPreferences[0];
        dispatch(clearChartStore());
        try {
          await dispatch(setChartSites(site_ids || chartData.chartSites));
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
          console.error(`Error setting chart properties: ${error}`);
        }
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
  );
};

export default Layout;
