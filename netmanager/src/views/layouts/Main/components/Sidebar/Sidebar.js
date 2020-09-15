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
import EditLocationIcon from "@material-ui/icons/EditLocation";
import AspectRatioIcon from "@material-ui/icons/AspectRatio";
import SupervisedUserCircleIcon from "@material-ui/icons/SupervisedUserCircle";

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
      title: "Overview",
      href: "/overview",
      icon: <AspectRatioIcon />,
    },
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
      icon: <EditLocationIcon />,
    },
  ];
  const userManagementPages = [
    {
      title: "Users",
      href: "/admin/users",
      icon: <PeopleIcon />,
    },
    {
      title: "Candidates",
      href: "/candidates",
      icon: <SupervisedUserCircleIcon />,
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

  const { mappedAuth } = props;
  let { user } = mappedAuth;
  let userPages = [];

  try {
    if (user.privilege === "super") {
      userPages = userManagementPages;
    } else if (user.privilege === "admin") {
      userPages = userManagementPages.filter(function (element) {
        return element.title !== "Candidates";
      });
    } else {
      userPages = userManagementPages.filter(function (element) {
        return (
          element.title !== "Users" &&
          element.title !== "Candidates" &&
          element.title !== "Locate" &&
          element.title !== "Device Management" &&
          element.title !== "Location Registry" &&
          element.title !== "Device Registry"
        );
      });
    }
  } catch (e) {
    console.log(e);
  }

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
        <SidebarNav className={classes.nav} pages={userPages} />
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
