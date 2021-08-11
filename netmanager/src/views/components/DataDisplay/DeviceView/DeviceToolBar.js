import React, { useEffect } from "react";
import { useHistory, useRouteMatch, useLocation } from "react-router-dom";
import { makeStyles } from "@material-ui/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import {
  ArrowBackIosRounded,
  Update,
  AddOutlined,
  EditOutlined,
  CloudUploadOutlined,
  PageviewOutlined,
  PhotoOutlined,
  ExpandLess,
  ExpandMore,
} from "@material-ui/icons";
import Collapse from "@material-ui/core/Collapse";
import Link from "@material-ui/core/Link";
import Hidden from "@material-ui/core/Hidden";
import { useDeviceOverviewBackUrlsData } from "redux/Urls/selectors";
import { last } from "underscore";

const a11yProps = (index) => {
  return {
    id: `nav-tab-${index}`,
    "aria-controls": `nav-tabpanel-${index}`,
  };
};

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
  },
  wrapper: {
    flexDirection: "row",
  },
  margin: {
    width: "96%",
    margin: "2vh 0",
  },
  appBar: {
    position: "relative",
    zIndex: 20,
  },
  tabs: {
    width: "100%",
    margin: "0 auto",
  },
  tab: {
    width: "220px",
    fontSize: "14px",
  },
  title: {
    color: "#3f51b5",
    width: "20%",
    textTransform: "uppercase",
  },
}));

const iconStyles = {
  marginRight: "2px",
};

const iconMiniStyles = {
  marginRight: "10px",
};

const LinkTab = (props) => {
  const classes = useStyles();

  return (
    <Tab
      classes={{
        root: classes.tab,
        wrapper: classes.wrapper,
      }}
      component="a"
      wrapped
      onClick={(event) => event.preventDefault()}
      {...props}
    />
  );
};

export const DeviceToolBar = ({ deviceName }) => {
  const classes = useStyles();
  const match = useRouteMatch();
  const history = useHistory();
  const goBackUrl = useDeviceOverviewBackUrlsData();
  const [value, setValue] = React.useState(history.location.pathname);
  const [miniValue, setMiniValue] = React.useState(
    last(history.location.pathname.split("/"))
  );
  const [show, setShow] = React.useState(false);

  const { pathname } = useLocation();

  const iconMapper = {
    overview: <PageviewOutlined style={iconMiniStyles} />,
    edit: <EditOutlined style={iconMiniStyles} />,
    "maintenance-logs": <Update style={iconMiniStyles} />,
    "deploy-status": <CloudUploadOutlined style={iconMiniStyles} />,
    components: <AddOutlined style={iconMiniStyles} />,
    photos: <PhotoOutlined style={iconMiniStyles} />,
  };

  useEffect(() => {
    setValue(pathname);
    setMiniValue(last(pathname.split("/")));
  }, [pathname]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    history.push(newValue);
  };

  const handleDropdownChange = (url, value) => () => {
    setShow(!show);
    setMiniValue(value);
    history.push(url);
  };

  return (
    <div className={`${classes.root} ${classes.margin}`}>
      <Hidden lgUp>
        <div className={"device-dropdown"}>
          <div
            className={"device-dropdown-title"}
            onClick={() => setShow(!show)}
          >
            <span style={{ display: "flex", alignItems: "center" }}>
              {iconMapper[miniValue]} {miniValue.replace("-", " ")}
            </span>
            {show ? <ExpandLess /> : <ExpandMore />}
          </div>
          <Collapse in={show} timeout="auto" unmountOnExit>
            <div className={"device-dropdown-list"}>
              <Link
                onClick={handleDropdownChange(
                  `${match.url}/overview`,
                  "overview"
                )}
              >
                <span>
                  <PageviewOutlined style={iconMiniStyles} /> Overview
                </span>
              </Link>
              <Link onClick={handleDropdownChange(`${match.url}/edit`, "edit")}>
                <span>
                  <EditOutlined style={iconMiniStyles} /> Edit
                </span>
              </Link>
              <Link
                onClick={handleDropdownChange(
                  `${match.url}/maintenance-logs`,
                  "maintenance-logs"
                )}
              >
                <span>
                  <Update style={iconMiniStyles} /> Maintenance logs
                </span>
              </Link>
              <Link
                onClick={handleDropdownChange(`${match.url}/photos`, "photos")}
              >
                <span>
                  <PhotoOutlined style={iconMiniStyles} /> Photos
                </span>
              </Link>
            </div>
          </Collapse>
        </div>
      </Hidden>
      <Hidden mdDown>
        <AppBar className={classes.appBar} color="default">
          <Toolbar>
            <ArrowBackIosRounded
              style={{ color: "#3f51b5", cursor: "pointer" }}
              onClick={() => history.push(goBackUrl)}
            />
            <Typography variant="h2" className={classes.title}>
              {deviceName}
            </Typography>
            <Tabs
              variant="fullWidth"
              className={classes.tabs}
              value={value}
              onChange={handleChange}
              textColor="primary"
              aria-label="nav tabs example"
            >
              <LinkTab
                label="Overview"
                icon={<PageviewOutlined style={iconStyles} />}
                value={`${match.url}/overview`}
                {...a11yProps(0)}
              />
              <LinkTab
                label="Edit"
                icon={<EditOutlined style={iconStyles} />}
                value={`${match.url}/edit`}
                {...a11yProps(1)}
              />
              <LinkTab
                label="Maintenance logs"
                icon={<Update style={iconStyles} />}
                value={`${match.url}/maintenance-logs`}
                {...a11yProps(2)}
              />
              <LinkTab
                label="Photos"
                icon={<PhotoOutlined style={iconStyles} />}
                value={`${match.url}/photos`}
                {...a11yProps(5)}
              />
            </Tabs>
          </Toolbar>
        </AppBar>
      </Hidden>
    </div>
  );
};

export const DeviceToolBarContainer = ({ children }) => {
  const classes = useStyles();
  return <div className={classes.margin}>{children}</div>;
};
