import React from 'react';
import { useHistory, useRouteMatch } from "react-router-dom"
import { makeStyles } from "@material-ui/styles";
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab'


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

const LinkTab = (props) => {
    const classes = useStyles();

    return (
        <Tab
            className={classes.tab}
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
    const [value, setValue] = React.useState(`${match.url}/overview`);

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
                  <LinkTab label="Overview" value={`${match.url}/overview`}/>
                  <LinkTab label="Edit" value={`${match.url}/edit`} />
                  <LinkTab label="Maintenance logs" value={`${match.url}/maintenance-logs`} />
                  <LinkTab label="Deploy status" value={`${match.url}/deploy-status`} />
                  <LinkTab label="Components" value={`${match.url}/components`} />
                  <LinkTab label="Photos" value={`${match.url}/photos`} />
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