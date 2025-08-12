import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Divider, Drawer } from '@material-ui/core';
import PeopleIcon from '@material-ui/icons/People';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import MapIcon from '@material-ui/icons/Map';
import SettingsIcon from '@material-ui/icons/Settings';
import LocateIcon from '@material-ui/icons/AddLocation';
import ManageIcon from '@material-ui/icons/Build';
import AddIcon from '@material-ui/icons/Add';
import EditLocationIcon from '@material-ui/icons/EditLocation';
import AspectRatioIcon from '@material-ui/icons/AspectRatio';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import TimelineIcon from '@material-ui/icons/Timeline';
import DataUsageIcon from '@material-ui/icons/DataUsage';
import { Profile, SidebarNav, SidebarWidgets } from './components';
import usersStateConnector from 'views/stateConnectors/usersStateConnector';
import { useDispatch, useSelector } from 'react-redux';
import { isEmpty } from 'underscore';
import { PeopleOutline } from '@material-ui/icons';
import { addUserNetworks } from 'redux/AccessControl/operations';
import NetworkDropdown from './components/NetworkDropdown';
import TapAndPlayIcon from '@material-ui/icons/TapAndPlay';
import GroupWorkIcon from '@material-ui/icons/GroupWork';
import SimCardIcon from '@material-ui/icons/SimCard';
import GrainIcon from '@material-ui/icons/Grain';
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
import AppsIcon from '@material-ui/icons/Apps';
import DeviceHubIcon from '@material-ui/icons/DeviceHub';
import { PERMISSIONS } from '../../../../constants/permissions';
import { hasPermission } from '../../../../utils/permissions';

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

const excludePages = (allPages, unwantedPages) => {
  return allPages.filter((page) => !unwantedPages.includes(page.title));
};

const checkAccess = (pages, rolePermissions) => {
  const accessDenied = [];
  pages.forEach((page) => {
    if (page.permission) {
      const requiredPermission = page.permission;
      if (!hasPermission(rolePermissions, requiredPermission)) {
        accessDenied.push(page.title);
      }
    }
  });
  return accessDenied;
};

const allMainPages = [
  {
    title: 'Overview',
    href: '/overview',
    icon: <AspectRatioIcon />,
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: <TimelineIcon />,
    isNew: true
  },
  {
    title: 'Map',
    href: '/map',
    icon: <MapIcon />,
  },
  {
    title: 'Export data',
    href: '/export-data/options',
    icon: <CloudDownloadIcon />,
  },
  {
    title: 'Deploy Device',
    href: '/deploy-device',
    icon: <DeviceHubIcon />,
    permission: PERMISSIONS.DEVICE.DEPLOY
  },
  {
    title: 'Locate',
    href: '/locate',
    icon: <LocateIcon />,
    permission: PERMISSIONS.SITE.CREATE
  },
  {
    title: 'Network Monitoring',
    href: '/manager',
    icon: <ManageIcon />,
    permission: PERMISSIONS.DEVICE.VIEW,
    collapse: true,
    nested: true,
    nestItems: [
      { title: 'Network Map', href: '/manager/map' },
      { title: 'Network Statistics', href: '/manager/stats' },
      { title: 'Network Activity Logs', href: '/manager/activities' }
    ],
    isNew: true
  },
  {
    title: 'Device Registry',
    href: '/registry',
    icon: <AddIcon />,
    permission: PERMISSIONS.DEVICE.VIEW
  },

  {
    title: 'Site Registry',
    href: '/sites',
    icon: <EditLocationIcon />,
    permission: PERMISSIONS.SITE.VIEW
  },
  {
    title: 'Host Registry',
    href: '/hosts',
    icon: <PeopleOutline />,
    permission: PERMISSIONS.SITE.VIEW,
    isNew: true
  },
  {
    title: 'SIM Registry',
    href: '/sim',
    icon: <SimCardIcon />,
    permission: PERMISSIONS.DEVICE.VIEW,
    isNew: true
  },

  {
    title: 'Cohorts Registry',
    href: '/cohorts',
    icon: <GroupWorkIcon />,
    permission: PERMISSIONS.SITE.VIEW,
    isNew: true
  },
  {
    title: 'Grids Registry',
    href: '/grids',
    icon: <GrainIcon />,
    permission: PERMISSIONS.SITE.VIEW,
    isNew: true
  }
];

const allUserManagementPages = [
  {
    title: 'Logs',
    href: '/logs',
    icon: <DataUsageIcon />,
    permission: PERMISSIONS.DEVICE.VIEW
  },
  {
    title: 'Networks',
    href: '/networks',
    icon: <TapAndPlayIcon />,
    permission: PERMISSIONS.ROLE.VIEW,
    disabled: true
  },
  {
    title: 'Teams',
    href: '/teams',
    icon: <GroupAddIcon />,
    permission: PERMISSIONS.ROLE.VIEW,
    isNew: true
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: <PeopleIcon />,
    permission: PERMISSIONS.ROLE.VIEW,
    collapse: true,
    nested: true,
    nestItems: [
      { title: 'Assigned Users', href: '/admin/users/assigned-users' },
      { title: 'Available Users', href: '/admin/users/available-users' },
      { title: 'User Statistics', href: '/admin/users/users-statistics' },
      { title: 'Preferences', href: '/admin/users/preferences' }
    ]
  },
  {
    title: 'Roles',
    href: '/roles',
    icon: <AssignmentIndIcon />,
    permission: PERMISSIONS.ROLE.VIEW
  },
  {
    title: 'Clients',
    href: '/clients-activation',
    icon: <AppsIcon />,
    permission: PERMISSIONS.ROLE.VIEW
  },
  {
    title: 'Account',
    href: '/account',
    icon: <AccountBoxIcon />
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: <SettingsIcon />,
  }
];

const Sidebar = (props) => {
  const { open, variant, onClose, className, ...rest } = props;
  const classes = useStyles();
  const dispatch = useDispatch();

  const [userPages, setUserPages] = useState([]);
  const [adminPages, setAdminPages] = useState([]);
  const [loading, setLoading] = useState(false);

  const currentRole = useSelector((state) => state.accessControl.currentRole);
  const activeNetwork = useSelector((state) => state.accessControl.activeNetwork);
  const userNetworks = useSelector((state) => state.accessControl.userNetworks);
  const groupData = useSelector((state) => state.accessControl.groupsSummary);

  useEffect(() => {
    if (!userNetworks) {
      const userNetworksStorage = JSON.parse(localStorage.getItem('userNetworks'));
      if (userNetworksStorage) {
        dispatch(addUserNetworks(userNetworksStorage));
      }
    }
  }, [activeNetwork]);

  useEffect(() => {
    // check whether user has a role
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!isEmpty(currentUser)) {
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
        }
      } else {
        const selectedUserPages = excludePages(allMainPages, [
          'Locate',
          'Network Monitoring',
          'Location Registry',
          'Device Registry',
          'Host Registry',
          'SIM Registry',
          'Site Registry',
          'Cohorts Registry',
          'Grids Registry'
        ]);
        const selectedAdminPages = excludePages(allUserManagementPages, [
          'Users',
          'Candidates',
          'Clients',
          'Roles',
          'Logs'
        ]);
        setUserPages(selectedUserPages);
        setAdminPages(selectedAdminPages);
        setLoading(false);
      }
    } else {
      const selectedUserPages = excludePages(allMainPages, [
        'Locate',
        'Network Monitoring',
        'Location Registry',
        'Device Registry',
        'Host Registry',
        'SIM Registry',
        'Site Registry',
        'Cohorts Registry',
        'Grids Registry'
      ]);
      const selectedAdminPages = excludePages(allUserManagementPages, [
        'Users',
        'Candidates',
        'Clients',
        'Roles',
        'Logs'
      ]);
      setUserPages(selectedUserPages);
      setAdminPages(selectedAdminPages);
      setLoading(false);
    }
  }, [currentRole, activeNetwork, userNetworks]);

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
            {userNetworks && <NetworkDropdown userNetworks={userNetworks} groupData={groupData} />}
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
