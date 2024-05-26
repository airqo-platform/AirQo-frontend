import React, { useEffect } from 'react';
import AuthenticatedSideBar from '@/components/SideBar/AuthenticatedSidebar';
import TopBar from '../TopBar';
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
import { useRouter } from 'next/router';
import CollapsedSidebar from '../SideBar/CollapsedSidebar';
import SideBarDrawer from '../SideBar/SideBarDrawer';

const Layout = ({
  pageTitle = 'AirQo Analytics',
  children,
  topbarTitle,
  noBorderBottom,
  noTopNav = true,
}) => {
  // Constants
  const router = useRouter();
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
      <>
        <div className='flex w-full h-dvh overflow-hidden' data-testid='layout'>
          {router.pathname === '/map' ? (
            <div className='hidden lg:block'>
              <CollapsedSidebar />
            </div>
          ) : (
            <AuthenticatedSideBar />
          )}
          <div className='w-full h-full overflow-hidden transition-all duration-300 ease-in-out'>
            {noTopNav && (
              <div className='sticky top-0 z-50'>
                <TopBar topbarTitle={topbarTitle} noBorderBottom={noBorderBottom} />
              </div>
            )}
            <div className='overflow-y-auto h-dvh w-full'>{children}</div>
          </div>
        </div>
        <SideBarDrawer />
      </>
    </>
  );
};

export default Layout;
