import React from 'react';
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
        width: '98%',
        margin: '2vh 1%',
        backgroundColor: theme.palette.background.paper,
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
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => { setValue(newValue); };

    return (
        <div className={classes.root}>
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
                  <LinkTab label="Overview" href="/drafts" {...a11yProps(0)} />
                  <LinkTab label="Edit" href="/trash" {...a11yProps(1)} />
                  <LinkTab label="Maintenance logs" href="/spam" {...a11yProps(2)} />
                  <LinkTab label="Deploy status" href="/spam" {...a11yProps(3)} />
                  <LinkTab label="Components" href="/spam" {...a11yProps(4)} />
                  <LinkTab label="Photos" href="/spam" {...a11yProps(5)} />
                </Tabs>
              </Toolbar>
            </AppBar>
        </div>
    )
}