import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Divider, Drawer } from '@material-ui/core';
import DashboardIcon from '@material-ui/icons/Dashboard';
import PeopleIcon from '@material-ui/icons/People';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import MapIcon from '@material-ui/icons/Map';
import SettingsIcon from '@material-ui/icons/Settings';
import LocateIcon from '@material-ui/icons/AddLocation';
import ManageIcon from '@material-ui/icons/Build';
import AddIcon from '@material-ui/icons/Add';
import EditLocationIcon from '@material-ui/icons/EditLocation';
import AspectRatioIcon from '@material-ui/icons/AspectRatio';
import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import AirQloudIcon from '@material-ui/icons/FilterDrama';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import { Profile, SidebarNav, SidebarWidgets } from './components';
import usersStateConnector from 'views/stateConnectors/usersStateConnector';
import { useDispatch, useSelector } from 'react-redux';
import { isEmpty } from 'underscore';
import { getUserDetails } from 'redux/Join/actions';
import {
  addCurrentUserRole,
  addUserNetworks,
  addActiveNetwork
} from 'redux/AccessControl/operations';
import NetworkDropdown from './components/NetworkDropdown';

const useStyles = makeStyles((theme) => ({
  drawer: {
    width: 240,
    [theme.breakpoints.up('lg')]: {
      marginTop: 64,
      height: 'calc(100% - 64px)'
    }
  },
  root: {
    backgroundColor: theme.palette.white,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: theme.spacing(2)
  },
  divider: {
    margin: theme.spacing(2, 0)
  },
  nav: {
    marginBottom: theme.spacing(2)
  }
}));

const excludePages = (pages, excludedArr) => {
  return pages.filter((element) => {
    return !excludedArr.includes(element.title);
  });
};

const checkAccess = (pages, rolePermissions) => {
  const accessDenied = [];
  pages.forEach((page) => {
    if (page.permission) {
      const requiredPermission = page.permission;
      // the role permissions is an array of permission objects
      // we need to extract the permission names from the objects
      const permissions = rolePermissions.map((permission) => permission.permission);

      if (!permissions.includes(requiredPermission)) {
        accessDenied.push(page);
      }
    }
  });
  return accessDenied;
};

const allMainPages = [
  {
    title: 'Overview',
    href: '/overview',
    icon: <AspectRatioIcon />
  },
  {
    title: 'Map',
    href: '/map',
    icon: <MapIcon />,
    permission: 'VIEW_AIR_QUALITY_FOR_NETWORK'
  },
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: <DashboardIcon />
  },

  {
    title: 'Export',
    href: '/download',
    icon: <CloudDownloadIcon />
  },
  {
    title: 'Locate',
    href: '/locate',
    icon: <LocateIcon />
  },
  {
    title: 'Network Monitoring',
    href: '/manager',
    icon: <ManageIcon />,
    permission: 'CREATE_UPDATE_AND_DELETE_NETWORK_DEVICES',
    collapse: true,
    nested: true,
    nestItems: [
      { title: 'Network Map', href: '/manager/map' },
      { title: 'Network Statistics', href: '/manager/stats' }
    ]
  },
  {
    title: 'Device Registry',
    href: '/registry',
    icon: <AddIcon />,
    permission: 'CREATE_UPDATE_AND_DELETE_NETWORK_DEVICES'
  },
  {
    title: 'Site Registry',
    href: '/sites',
    icon: <EditLocationIcon />,
    permission: 'CREATE_UPDATE_AND_DELETE_NETWORK_SITES'
  },
  {
    title: 'AirQloud Registry',
    href: '/airqlouds',
    icon: <AirQloudIcon />,
    permission: 'CREATE_UPDATE_AND_DELETE_AIRQLOUDS'
  }
];

const allUserManagementPages = [
  {
    title: 'Users',
    href: '/admin/users',
    icon: <PeopleIcon />,
    permission: 'CREATE_UPDATE_AND_DELETE_NETWORK_USERS'
  },
  {
    title: 'Candidates',
    href: '/candidates',
    icon: <SupervisedUserCircleIcon />,
    permission: 'APPROVE_AND_DECLINE_NETWORK_CANDIDATES'
  },
  {
    title: 'Roles',
    href: '/roles',
    icon: <SupervisorAccountIcon />,
    permission: 'CREATE_UPDATE_AND_DELETE_NETWORK_ROLES'
  },
  {
    title: 'Account',
    href: '/account',
    icon: <AccountBoxIcon />
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: <SettingsIcon />
  }
];

const Sidebar = (props) => {
  const { open, variant, onClose, className, ...rest } = props;
  const classes = useStyles();
  const { mappedAuth } = props;
  let { user } = mappedAuth;

  const [userPages, setUserPages] = useState([]);
  const [adminPages, setAdminPages] = useState([]);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const currentRole = useSelector((state) => state.accessControl.currentRole);
  const userNetworks = useSelector((state) => state.accessControl.userNetworks);

  useEffect(() => {
    if (!isEmpty(user)) {
      const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork'));
      getUserDetails(user._id).then((res) => {
        dispatch(addCurrentUserRole(res.users[0].role));
        dispatch(addUserNetworks(res.users[0].networks));
        localStorage.setItem('userNetworks', JSON.stringify(res.users[0].networks));
        localStorage.setItem('currentUser', JSON.stringify(res.users[0]));

        if (isEmpty(activeNetwork)) {
          localStorage.setItem('activeNetwork', JSON.stringify(res.users[0].networks[0]));
          dispatch(addActiveNetwork(res.users[0].networks[0]));
        }
      });
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    // check whether user has a role
    if (!isEmpty(user)) {
      if (!isEmpty(currentRole)) {
        if (currentRole.role_permissions) {
          // get pages that the user doesn't have access to
          const accessDeniedForUserPages = checkAccess(allMainPages, currentRole.role_permissions);
          const accessDeniedForAdminPages = checkAccess(
            allUserManagementPages,
            currentRole.role_permissions
          );

          // exclude those pages from the main pages to hide their visibility
          const selectedUserPages = excludePages(allMainPages, accessDeniedForUserPages);
          const selectedAdminPages = excludePages(
            allUserManagementPages,
            accessDeniedForAdminPages
          );

          setUserPages(selectedUserPages);
          setAdminPages(selectedAdminPages);
          setLoading(false);
        }
      }
    }

    // if user has no role or organisation, show default pages
    if (isEmpty(user) || isEmpty(currentRole)) {
      const selectedUserPages = excludePages(allMainPages, [
        'Locate',
        'Network Monitoring',
        'Location Registry',
        'Device Registry',
        'Site Registry',
        'AirQloud Registry'
      ]);
      const selectedAdminPages = excludePages(allUserManagementPages, [
        'Users',
        'Candidates',
        'Roles'
      ]);
      setUserPages(selectedUserPages);
      setAdminPages(selectedAdminPages);
      setLoading(false);
    }
  }, [user, currentRole]);

  return (
    <Drawer
      anchor="left"
      classes={{ paper: classes.drawer }}
      onClose={onClose}
      open={open}
      variant={variant}
    >
      <div {...rest} className={clsx(classes.root, className)}>
        <Profile />
        <Divider className={classes.divider} />
        {loading ? (
          <>
            <div
              style={{
                width: '100%',
                backgroundColor: '#EEE',
                height: '30px',
                marginBottom: '12px'
              }}
            />
            <div
              style={{
                width: '100%',
                backgroundColor: '#EEE',
                height: '30px',
                marginBottom: '12px'
              }}
            />
            <div
              style={{
                width: '100%',
                backgroundColor: '#EEE',
                height: '30px',
                marginBottom: '12px'
              }}
            />
            <div style={{ width: '100%', backgroundColor: '#EEE', height: '30px' }} />
            <Divider className={classes.divider} />
            <div
              style={{
                width: '100%',
                backgroundColor: '#EEE',
                height: '30px',
                marginBottom: '12px'
              }}
            />
            <div style={{ width: '100%', backgroundColor: '#EEE', height: '30px' }} />
          </>
        ) : (
          <>
            {userNetworks && <NetworkDropdown userNetworks={userNetworks} />}
            <SidebarNav className={classes.nav} pages={userPages} />
            <Divider className={classes.divider} />
            <SidebarNav className={classes.nav} pages={adminPages} />
            <Divider className={classes.divider} />
            <SidebarWidgets className={classes.nav} />
          </>
        )}
      </div>
    </Drawer>
  );
};

Sidebar.propTypes = {
  className: PropTypes.string,
  onClose: PropTypes.func,
  open: PropTypes.bool.isRequired,
  variant: PropTypes.string.isRequired
};

export default usersStateConnector(Sidebar);
