import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { Divider, Drawer } from "@material-ui/core";
import DashboardIcon from "@material-ui/icons/Dashboard";
import PeopleIcon from "@material-ui/icons/People";
import BarChartIcon from "@material-ui/icons/BarChart";
import TimelineIcon from "@material-ui/icons/Timeline";
import PaymentIcon from "@material-ui/icons/Payment";
import AccountBoxIcon from "@material-ui/icons/AccountBox";
import SettingsIcon from "@material-ui/icons/Settings";
import LocateIcon from "@material-ui/icons/AddLocation";
import ManageIcon from "@material-ui/icons/Build";
import AddIcon from "@material-ui/icons/Add";
import EditLocationIcon from '@material-ui/icons/EditLocation';

import { Profile, SidebarNav } from "./components";

const useStyles = makeStyles((theme) => ({
  drawer: {
    width: 240,
    [theme.breakpoints.up("lg")]: {
      marginTop: 64,
      height: "calc(100% - 64px)",
    },
  },
  root: {
    backgroundColor: theme.palette.white,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: theme.spacing(2),
  },
  divider: {
    margin: theme.spacing(2, 0),
  },
  nav: {
    marginBottom: theme.spacing(2),
  },
}));

const Sidebar = (props) => {
  const { open, variant, onClose, className, ...rest } = props;

  const classes = useStyles();

  const pages = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <DashboardIcon />,
    },
    {
      title: "Locate",
      href: "/locate",
      icon: <LocateIcon />,
    },
    {
      title: "Incentives",
      href: "/incentives",
      icon: <PaymentIcon />,
    },
    {
      title: "Device Management",
      href: "/manager",
      icon: <ManageIcon />,
      collapse: true,
    },
    {
      title: "Device Registry",
      href: "/registry",
      icon: <AddIcon />,
    },
    {
      title: "Location Registry",
      href: "/location",
      icon: < EditLocationIcon /> ,
   },
  ];
  const userManagementPages = [
    {
      title: "Users",
      href: "/admin/users",
      icon: <PeopleIcon />,
    },
    {
      title: "Account",
      href: "/account",
      icon: <AccountBoxIcon />,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <SettingsIcon />,
    },
  ];

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
        <SidebarNav className={classes.nav} pages={pages} />
        <Divider className={classes.divider} />
        <SidebarNav className={classes.nav} pages={userManagementPages} />
        {/* <UpgradePlan /> */}
      </div>
    </Drawer>
  );
};

Sidebar.propTypes = {
  className: PropTypes.string,
  onClose: PropTypes.func,
  open: PropTypes.bool.isRequired,
  variant: PropTypes.string.isRequired,
};

export default Sidebar;
