import React, { useState, useEffect, useCallback } from 'react';
import AuthenticatedSideBar from '@/components/SideBar/AuthenticatedSidebar';
import TopBar from '@/components/TopBar';
import { fetchUserDefaults, clearChartStore } from '@/lib/store/services/charts/userDefaultsSlice';
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
  const SUCCEEDED = 'succeeded';
  const FAILED = 'failed';

  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.login.userInfo);
  const userDefaults = useSelector((state) => state.userDefaults.defaults);
  const status = useSelector((state) => state.userDefaults.status);
  const error = useSelector((state) => state.userDefaults.error);
  const [toggleDrawer, setToggleDrawer] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => JSON.parse(localStorage.getItem('collapsed')) || false,
  );

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

  // fetching user defaults
  useEffect(() => {
    if (userInfo?._id) {
      dispatch(fetchUserDefaults(userInfo._id));
    }
  }, [dispatch, userInfo]);

  // Function to update chart options
  const updateChart = useCallback(
    ({ chartType, frequency, startDate, endDate, period, sites, pollutant, _id }) => {
      dispatch(clearChartStore());
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
    } else if (status === FAILED) {
      console.error(`Error getting user defaults: ${error}`);
      dispatch(resetChartStore());
    }
  }, [status, error, userDefaults, dispatch]);

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
