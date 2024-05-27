import React, { useEffect } from 'react';
import AuthenticatedSideBar from '@/components/SideBar/AuthenticatedSidebar';
import TopBar from '../TopBar';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUserChecklists,
  updateUserChecklists,
} from '@/lib/store/services/checklists/CheckData';
import { updateCards } from '@/lib/store/services/checklists/CheckList';
import Head from 'next/head';
import { toggleSidebar } from '@/lib/store/services/sideBar/SideBarSlice';
import { useRouter } from 'next/router';
import CollapsedSidebar from '../SideBar/CollapsedSidebar';
import SideBarDrawer from '../SideBar/SideBarDrawer';
import SetChartDetails from '@/core/utils/SetChartDetails';

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
  const cardCheckList = useSelector((state) => state.cardChecklist.cards);

  /**
   * Set chart details
   */
  useEffect(() => {
    SetChartDetails(dispatch, chartData, userInfo, preferenceData);
  }, [userInfo, preferenceData, dispatch]);

  /**
   * Fetch user checklists from the database
   * if the user is logged in and the data has not been fetched before
   * then update the checklists in the store
   * and set the dataFetched flag in the local storage to true
   * so that the data is not fetched again
   * on subsequent page reloads
   * */
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

  useEffect(fetchData, [dispatch, userInfo, cardCheckList]);

  /**
   * Update user checklists in the database when there is a change in the checklists data at any point
   * in the application
   */
  useEffect(() => {
    if (userInfo?._id && cardCheckList) {
      dispatch(updateUserChecklists({ user_id: userInfo._id, items: cardCheckList }));
    }
  }, [cardCheckList, userInfo, dispatch]);

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
