import React, { useState, useEffect, useCallback } from 'react';
import AuthenticatedSideBar from '@/components/SideBar/AuthenticatedSidebar';
import TopBar from '@/components/TopBar';
import {
  fetchUserDefaults,
  clearChartStore,
  updateDefaults,
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

const Layout = ({ children, topbarTitle, noBorderBottom }) => {
  // Constants
  const MAX_WIDTH = '(max-width: 1024px)';
  const SUCCEEDED = 'succeeded';
  const FAILED = 'failed';

  // Redux hooks
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.login.userInfo);
  const userDefaults = useSelector((state) => state.userDefaults.defaults);
  const status = useSelector((state) => state.userDefaults.status);
  const error = useSelector((state) => state.userDefaults.error);

  // State hooks
  const [toggleDrawer, setToggleDrawer] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => JSON.parse(localStorage.getItem('collapsed')) || false,
  );

  // Effect hook for fetching user defaults
  useEffect(() => {
    if (userInfo?._id) {
      dispatch(fetchUserDefaults(userInfo._id));
    }
  }, [dispatch, userInfo]);

  // Effect hook for setting collapsed state in local storage
  useEffect(() => {
    localStorage.setItem('collapsed', collapsed);
  }, [collapsed]);

  // Effect hook for handling media query change
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

  // Function to update chart
  const updateChart = useCallback(
    ({ chartType, frequency, startDate, endDate, period, sites, pollutant, _id }) => {
      if (_id) {
        dispatch(setDefaultID(_id));
      }
      if (chartType) {
        dispatch(setChartType(chartType));
      }
      if (frequency) {
        dispatch(setTimeFrame(frequency));
      }
      if (pollutant) {
        dispatch(setPollutant(pollutant));
      }
      if (startDate && endDate && period && period.label) {
        dispatch(
          setChartDataRange({
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            label: period.label,
          }),
        );
      }
      if (sites) {
        dispatch(setChartSites(sites));
      }
    },
    [dispatch],
  );

  // Effect hook for updating chart based on user defaults
  useEffect(() => {
    if (status === SUCCEEDED && userDefaults) {
      updateChart(userDefaults);
    } else if (status === SUCCEEDED && !userDefaults) {
      dispatch(resetChartStore());
      dispatch(clearChartStore());
    } else if (status === FAILED) {
      console.error(`Error getting user defaults: ${error}`);
      dispatch(resetChartStore());
      dispatch(clearChartStore());
    }
  }, [status, error, userInfo, userDefaults, dispatch, updateChart]);

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
