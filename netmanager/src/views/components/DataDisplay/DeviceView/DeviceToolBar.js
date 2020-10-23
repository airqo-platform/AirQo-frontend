import React from 'react';
import { useHistory, useRouteMatch } from "react-router-dom"
import { makeStyles } from "@material-ui/styles";
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import {
  Update,
  AddOutlined,
  EditOutlined,
  CloudUploadOutlined,
  UndoOutlined,
  PageviewOutlined,
  EventBusy, PhotoOutlined
} from "@material-ui/icons";


const a11yProps = (index) => {
    return {
        id: `nav-tab-${index}`,
        "aria-controls": `nav-tabpanel-${index}`,
    }
}

const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
    },
    wrapper: {
        flexDirection: "row",
    },
    margin: {
        width: '98%',
        margin: '2vh 1%',
    },
    appBar: {
        position: "relative",
    },
    tabs: {
        margin: "0 auto",
    },
    tab: {
        width: '220px',
        fontSize: "14px",
    },
    title: {
        color: "#3f51b5",
        width: "20%",
    }
}))

const iconStyles = {
    marginRight: "2px",
}

const LinkTab = (props) => {
    const classes = useStyles();

    return (
        <Tab
            classes={{
                root: classes.tab,
                wrapper: classes.wrapper,
            }}
            component='a'
            wrapped
            onClick={event => event.preventDefault()}
            { ...props }
        />
    )
}


export const DeviceToolBar = ({ deviceName }) => {
    const classes = useStyles();
    const match = useRouteMatch();
    const history = useHistory()
    const [value, setValue] = React.useState(history.location.pathname);

    const handleChange = (event, newValue) => {
        setValue(newValue);
        history.push(newValue);
    };

    return (
        <div className={`${classes.root} ${classes.margin}`}>
            <AppBar className={classes.appBar} color="default" >
              <Toolbar>
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
                      { ...a11yProps(0) }
                  />
                  <LinkTab
                      label="Edit"
                      icon={<EditOutlined style={iconStyles} />}
                      value={`${match.url}/edit`}
                      { ...a11yProps(1) }
                  />
                  <LinkTab
                      label="Maintenance logs"
                      icon={<Update style={iconStyles} />}
                      value={`${match.url}/maintenance-logs`}
                      { ...a11yProps(2) }
                  />
                  <LinkTab
                      label="Deploy status"
                      icon={<CloudUploadOutlined style={iconStyles} />}
                      value={`${match.url}/deploy-status`}
                      { ...a11yProps(3) }
                  />
                  <LinkTab
                      label="Components"
                      icon={<AddOutlined style={iconStyles} />}
                      value={`${match.url}/components`}
                      { ...a11yProps(4) }
                  />
                  <LinkTab
                      label="Photos"
                      icon={<PhotoOutlined style={iconStyles} />}
                      value={`${match.url}/photos`}
                      { ...a11yProps(5) }
                  />
                </Tabs>
              </Toolbar>
            </AppBar>
        </div>
    )
}

export const DeviceToolBarContainer = ({ children }) => {
    const classes = useStyles();
    return (
        <div className={classes.margin}>{children}</div>
    )
}