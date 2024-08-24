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
import { useRouter } from 'next/router';
import SideBarDrawer from '../SideBar/SideBarDrawer';
import SetChartDetails from '@/core/utils/SetChartDetails';
import LogoutUser from '@/core/utils/LogoutUser';
import PropTypes from 'prop-types';

const Layout = ({
  pageTitle = 'AirQo Analytics',
  children,
  topbarTitle,
  noBorderBottom,
  noTopNav = true,
}) => {
  // Constants
  const router = useRouter();

  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.login.userInfo);
  const preferenceData =
    useSelector((state) => state.defaults.individual_preferences) || [];
  const cardCheckList = useSelector((state) => state.cardChecklist.cards);
  const [lastActivity, setLastActivity] = useState(Date.now());

  /**
   * Set chart details
   */
  useEffect(() => {
    SetChartDetails(dispatch, preferenceData);
  }, []);

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
        dispatch(
          updateUserChecklists({ user_id: userInfo._id, items: cardCheckList }),
        );
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [cardCheckList]);

  /**
   * Log out user after 1 hour of inactivity
   */
  useEffect(() => {
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
    ];

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
        <meta property="og:title" content={pageTitle} key="title" />
      </Head>
      <>
        <div className="flex overflow-hidden bg-[#f6f6f7]" data-testid="layout">
          <div className="text-[#1C1D20]">
            <AuthenticatedSideBar />
          </div>

          <div
            className={`w-full h-dvh ${
              router.pathname === '/map' ? 'overflow-hidden' : 'overflow-y-auto'
            } transition-all duration-300 ease-in-out`}
          >
            {noTopNav && (
              <TopBar
                topbarTitle={topbarTitle}
                noBorderBottom={noBorderBottom}
              />
            )}
            <div className="overflow-hidden w-full text-[#1C1D20]">
              {children}
            </div>
          </div>
        </div>
        <SideBarDrawer />
      </>
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
