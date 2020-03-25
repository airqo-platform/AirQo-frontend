import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Grid, Card } from '@material-ui/core';

import { Pm25Levels, Map} from './components';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(4)
  }
}));

const Dashboard = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Grid
        container
        spacing={0.1}
      >
        <Grid
          item
          lg={12}
          sm={12}
          xl={12}
          xs={12}
        >
          <Map />
        </Grid>
        <Grid
          item
          lg={2}
          sm={4}
          xl={2}
          xs={12}
        >
          <Pm25Levels pm25level="Good"/>
        </Grid>
        <Grid
          item
          lg={2}
          sm={4}
          xl={2}
          xs={12}
        >
          <Pm25Levels pm25level="Moderate"/>
        </Grid>
        <Grid
          item
          lg={2}
          sm={4}
          xl={2}
          xs={12}
        >
          <Pm25Levels pm25level="Unhealthy for sensitive groups" />
        </Grid>
        <Grid
          item
          lg={2}
          sm={4}
          xl={2}
          xs={12}
        >
          <Pm25Levels pm25level="Unhealthy"/>
        </Grid>
        <Grid
          item
          lg={2}
          sm={4}
          xl={2}
          xs={12}
        >
          <Pm25Levels pm25level="Very unhealthy"/>
        </Grid>
        <Grid
          item
          lg={2}
          sm={4}
          xl={2}
          xs={12}
        >
          <Pm25Levels pm25level="Hazardous"/>
        </Grid>
        <p>PM2.5 - Particulate Matter</p>
      </Grid>
    </div>
  );
};

export default Dashboard;
