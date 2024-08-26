import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import Head from 'next/head';
import PropTypes from 'prop-types';

import AuthenticatedSideBar from '@/components/SideBar/AuthenticatedSidebar';
import TopBar from '../TopBar';
import SideBarDrawer from '../SideBar/SideBarDrawer';

import {
  fetchUserChecklists,
  updateUserChecklists,
} from '@/lib/store/services/checklists/CheckData';
import { updateCards } from '@/lib/store/services/checklists/CheckList';
import SetChartDetails from '@/core/utils/SetChartDetails';
import LogoutUser from '@/core/utils/LogoutUser';

const INACTIVITY_TIMEOUT = 3600000; // 1 hour in milliseconds
const CHECK_INTERVAL = 10000; // 10 seconds

const Layout = ({
  pageTitle = 'AirQo Analytics',
  children,
  topbarTitle,
  noBorderBottom,
  noTopNav = true,
}) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.login.userInfo);
  const preferenceData =
    useSelector((state) => state.defaults.individual_preferences) || [];
  const cardCheckList = useSelector((state) => state.cardChecklist.cards);
  const isCollapsed = useSelector((state) => state.sidebar.isCollapsed);

  useEffect(() => {
    SetChartDetails(dispatch, preferenceData);
  }, [dispatch, preferenceData]);

  const fetchUserData = useCallback(() => {
    if (userInfo?._id && !localStorage.getItem('dataFetched')) {
      dispatch(fetchUserChecklists(userInfo._id)).then((action) => {
        if (fetchUserChecklists.fulfilled.match(action)) {
          const { payload } = action;
          if (payload?.length > 0) {
            dispatch(updateCards(payload[0].items));
          }
          localStorage.setItem('dataFetched', 'true');
        }
      });
    }
  }, [dispatch, userInfo]);

  useEffect(fetchUserData, [fetchUserData]);

  useEffect(() => {
    let timer;
    if (userInfo?._id && cardCheckList) {
      timer = setTimeout(() => {
        dispatch(
          updateUserChecklists({ user_id: userInfo._id, items: cardCheckList }),
        );
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [dispatch, userInfo, cardCheckList]);

  useEffect(() => {
    let lastActivity = Date.now();
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
    ];
    const resetTimer = () => {
      lastActivity = Date.now();
    };

    activityEvents.forEach((event) =>
      window.addEventListener(event, resetTimer),
    );

    const intervalId = setInterval(() => {
      if (Date.now() - lastActivity > INACTIVITY_TIMEOUT && userInfo?._id) {
        LogoutUser(dispatch, router);
      }
    }, CHECK_INTERVAL);

    return () => {
      activityEvents.forEach((event) =>
        window.removeEventListener(event, resetTimer),
      );
      clearInterval(intervalId);
    };
  }, [dispatch, router, userInfo]);

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta property="og:title" content={pageTitle} key="title" />
      </Head>
      <div className="flex bg-[#f6f6f7] h-auto" data-testid="layout">
        <aside className="fixed left-0 top-0 text-[#1C1D20] z-50 transition-all duration-300 ease-in-out">
          <AuthenticatedSideBar />
        </aside>
        <main
          className={`${isCollapsed ? 'lg:ml-[88px]' : 'lg:ml-[256px]'} flex-1 transition-all duration-300 ease-in-out`}
        >
          <div
            className={`${router.pathname === '/map' ? '' : 'max-w-[1600px] mx-auto py-6 space-y-8 px-4 sm:px-6 lg:px-8'} `}
          >
            {noTopNav && (
              <TopBar
                topbarTitle={topbarTitle}
                noBorderBottom={noBorderBottom}
              />
            )}
            <div
              className={`text-[#1C1D20] transition-all duration-300 ease-in-out overflow-hidden h-auto`}
            >
              {children}
            </div>
          </div>
        </main>
      </div>
      <SideBarDrawer />
    </>
  );
};

Layout.propTypes = {
  pageTitle: PropTypes.string,
  children: PropTypes.node.isRequired,
  topbarTitle: PropTypes.string,
  noBorderBottom: PropTypes.bool,
  noTopNav: PropTypes.bool,
};

export default Layout;
