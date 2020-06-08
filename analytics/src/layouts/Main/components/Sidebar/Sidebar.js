import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Divider, Drawer } from '@material-ui/core';
import DashboardIcon from '@material-ui/icons/Dashboard';
import PeopleIcon from '@material-ui/icons/People';
import BarChartIcon from '@material-ui/icons/BarChart';
import TuneIcon from '@material-ui/icons/Tune';
import TimelineIcon from '@material-ui/icons/Timeline';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import SettingsIcon from '@material-ui/icons/Settings';
import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle';

import { Profile, SidebarNav } from './components';

const useStyles = makeStyles(theme => ({
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

const Sidebar = props => {
  const { open, variant, onClose, className, ...rest } = props;

  const classes = useStyles();

  const pages = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: <DashboardIcon />
    },
    {
      title: 'Graphs',
      href: '/graphs',
      icon: <BarChartIcon />
    },
    {
      title: 'Custom Reports',
      href: '/reports',
      icon: <TimelineIcon />
    }
  ];
  const userManagementPages = [
    {
      title: 'Users',
      href: '/admin/users',
      icon: <PeopleIcon />
    },
    // {
    //   title: 'Candidates',
    //   href: '/candidates',
    //   icon: <SupervisedUserCircleIcon />
    // },
    {
      title: 'Account',
      href: '/account',
      icon: <AccountBoxIcon />
    },
    {
      title: 'Defaults',
      href: '/defaults',
      icon: <TuneIcon />
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: <SettingsIcon />
    }
  ];

  const { mappedAuth } = props;
  let { user } = mappedAuth;
  let userPages = [];

  if (user.privilege == 'admin') {
    userPages = userManagementPages;
  } 

  
  // else if (user.privilege == 'admin') {
  //   userPages = userManagementPages.filter(function(element) {
  //     return element.title != 'Candidates';
  //   });
  // } 
  
  
  else {
    userPages = userManagementPages.filter(function(element) {
      return element.title != 'Users';
    });
  }
  return (
    <Drawer
      anchor="left"
      classes={{ paper: classes.drawer }}
      onClose={onClose}
      open={open}
      variant={variant}>
      <div {...rest} className={clsx(classes.root, className)}>
        <Profile />
        <Divider className={classes.divider} />
        <SidebarNav className={classes.nav} pages={pages} />
        <Divider className={classes.divider} />
        <SidebarNav className={classes.nav} pages={userPages} />
        {/* <UpgradePlan /> */}
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

export default Sidebar;
