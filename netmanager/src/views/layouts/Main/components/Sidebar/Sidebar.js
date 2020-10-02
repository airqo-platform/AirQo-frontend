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
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";
import { useOrgData } from "redux/Join/selectors";

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

const excludePages = (pages, excludedArr) => {
  return pages.filter((element) => {
    return !excludedArr.includes(element.title);
  });
};

const Sidebar = (props) => {
  const { open, variant, onClose, className, ...rest } = props;

  const classes = useStyles();

  const orgData = useOrgData();

  let pages = [
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
      title: "Export",
      href: "/download",
      icon: <CloudDownloadIcon />,
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
      userPages = excludePages(userManagementPages, ["Candidates"]);
    } else {
      userPages = excludePages(userManagementPages, [
        "Users",
        "Candidates",
        "Locate",
        "Device Management",
        "Location Registry",
        "Device Registry",
      ]);
      pages = excludePages(pages, [
        "Users",
        "Candidates",
        "Locate",
        "Device Management",
        "Location Registry",
        "Device Registry",
      ]);
    }
  } catch (e) {
    console.log(e);
  }

  if (orgData.name.toLowerCase() === "airqo") {
    pages = excludePages(pages, ["Dashboard", "Export"]);
  } else {
    pages = excludePages(pages, ["Device Management", "Locate"]);
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
