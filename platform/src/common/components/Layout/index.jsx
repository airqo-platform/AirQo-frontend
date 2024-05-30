import React, { useEffect, useState } from 'react';
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
import LogoutUser from '@/core/utils/LogoutUser';

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
  const userInfo = useSelector((state) => state.login.userInfo);
  const cardCheckList = useSelector((state) => state.cardChecklist.cards);
  const [lastActivity, setLastActivity] = useState(Date.now());

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

  useEffect(fetchData, [dispatch, userInfo]);

  /**
   * Update user checklists in the database when there is a change in the checklists data at any point
   * in the application
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (userInfo?._id && cardCheckList) {
        dispatch(updateUserChecklists({ user_id: userInfo._id, items: cardCheckList }));
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [cardCheckList]);

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

  /**
   * Log out user after 1 hour of inactivity
   */
  useEffect(() => {
    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];

    const resetTimer = () => setLastActivity(Date.now());

    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, []);

  useEffect(() => {
    const checkActivity = () => {
      const currentTime = Date.now();
      const timeElapsed = currentTime - lastActivity;

      // 3600000 milliseconds = 1 hour
      if (timeElapsed > 3600000 && userInfo?._id) {
        LogoutUser(dispatch, router);
      }
    };

    const intervalId = setInterval(checkActivity, 10000);

    return () => clearInterval(intervalId);
  }, [lastActivity, userInfo, dispatch, router]);

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta property='og:title' content={pageTitle} key='title' />
      </Head>
      <>
        <div className='flex overflow-hidden' data-testid='layout'>
          {router.pathname === '/map' ? (
            <div className='hidden lg:block'>
              <CollapsedSidebar />
            </div>
          ) : (
            <div>
              <AuthenticatedSideBar />
            </div>
          )}
          <div
            className={`w-full h-dvh ${
              router.pathname === '/map' ? 'overflow-hidden' : 'overflow-y-auto'
            } transition-all duration-300 ease-in-out`}>
            {noTopNav && <TopBar topbarTitle={topbarTitle} noBorderBottom={noBorderBottom} />}
            <div className='overflow-hidden w-full'>{children}</div>
          </div>
        </div>
        <SideBarDrawer />
      </>
    </>
  );
};

export default Layout;
