import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/styles';
import { useMediaQuery } from '@material-ui/core';

import { Topbar, Footer } from './common';
import { useDispatch, useSelector } from 'react-redux';

import Sidebar from './common/Sidebar';
import HorizontalLoader from '../components/HorizontalLoader/HorizontalLoader';
import { isEmpty } from 'underscore';
import { getUserDetails } from '../../redux/Join/actions';
import {
  addActiveNetwork,
  addCurrentUserRole,
  addUserGroupSummary,
  addUserNetworks
} from '../../redux/AccessControl/operations';
import { LargeCircularLoader } from '../components/Loader/CircularLoader';
import { updateMainAlert } from '../../redux/MainAlert/operations';

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: 56,
    height: '100%',
    [theme.breakpoints.up('sm')]: {
      paddingTop: 64
    }
  },
  shiftContent: {
    paddingLeft: 240
  },
  content: {
    minHeight: 'calc(100vh - 114px)'
  }
}));

const Main = (props) => {
  const { children } = props;
  const loaderStatus = useSelector((state) => state.HorizontalLoader.loading);

  const classes = useStyles();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'), {
    defaultMatches: true
  });

  const [openSidebar, setOpenSidebar] = useState(false);

  const toggleSidebar = () => {
    setOpenSidebar(!openSidebar);
  };

  const handleSidebarClose = () => {
    setOpenSidebar(false);
  };

  const shouldOpenSidebar = isDesktop ? true : openSidebar;

  const dispatch = useDispatch();
  const activeNetwork = useSelector((state) => state.accessControl.activeNetwork);
  const currentRole = useSelector((state) => state.accessControl.currentRole);
  const userNetworks = useSelector((state) => state.accessControl.userNetworks);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    const activeNetworkStorage = localStorage.getItem('activeNetwork');
    const currentUserRoleStorage = localStorage.getItem('currentUserRole');
    const userNetworksStorage = localStorage.getItem('userNetworks');

    if (activeNetworkStorage && currentUserRoleStorage && userNetworksStorage) {
      if (isEmpty(activeNetwork)) {
        dispatch(addActiveNetwork(JSON.parse(activeNetworkStorage)));
      }
      if (isEmpty(currentRole)) {
        dispatch(addCurrentUserRole(currentUserRoleStorage));
      }
      if (isEmpty(userNetworks)) {
        dispatch(addUserNetworks(JSON.parse(userNetworksStorage)));
      }
      return;
    }

    if (isEmpty(user)) {
      return;
    }

    setLoading(true);

    const fetchUserDetails = async () => {
      try {
        const res = await getUserDetails(JSON.parse(user)._id);
        if (res.success && res.users && res.users.length > 0) {
          dispatch(addUserNetworks(res.users[0].networks));
          localStorage.setItem('userNetworks', JSON.stringify(res.users[0].networks));
          dispatch(addUserGroupSummary(res.users[0].groups));

          if (!isEmpty(user)) {
            const airqoNetwork = res.users[0].networks.find(
              (network) => network.net_name === 'airqo'
            );

            if (!activeNetwork && airqoNetwork) {
              dispatch(addActiveNetwork(airqoNetwork));
              localStorage.setItem('activeNetwork', JSON.stringify(airqoNetwork));
              dispatch(addCurrentUserRole(airqoNetwork.role));
              localStorage.setItem('currentUserRole', JSON.stringify(airqoNetwork.role));
            }
          }
        }
      } catch (err) {
        console.error(err);
        dispatch(
          updateMainAlert({
            message: err.message,
            show: true,
            severity: 'error'
          })
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  useEffect(() => {
    if (!isEmpty(activeNetwork)) {
      dispatch(addCurrentUserRole(activeNetwork.role));
      localStorage.setItem('currentUserRole', JSON.stringify(activeNetwork.role));
    }
  }, [activeNetwork]);

  if (!activeNetwork || loading || !currentRole) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100vw'
        }}
      >
        <LargeCircularLoader loading={loading} size={50} height={50} />
      </div>
    );
  }

  return (
    <div
      className={clsx({
        [classes.root]: true,
        [classes.shiftContent]: isDesktop
      })}
    >
      <Topbar toggleSidebar={toggleSidebar} />
      <div style={{ position: 'relative' }}>
        <HorizontalLoader loading={loaderStatus} />
      </div>

      <Sidebar
        onClose={handleSidebarClose}
        open={shouldOpenSidebar}
        variant={isDesktop ? 'persistent' : 'temporary'}
      />
      <main className={classes.content}>{children}</main>
      <Footer />
    </div>
  );
};

Main.propTypes = {
  children: PropTypes.node
};

export default Main;
