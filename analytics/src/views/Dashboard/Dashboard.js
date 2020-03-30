import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Grid, Card } from '@material-ui/core';

import { Pm25Levels, Map} from './components';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(4)
  },
  differenceIcon: {
    color: theme.palette.text.secondary,
  },
}));

const Dashboard = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Grid
        container
        spacing={0}
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
          <Pm25Levels
            pm25level="Good"
            pm25levelText = "(0 - 12)"
            background="#45e50d"
          />
        </Grid>
        <Grid
          item
          lg={2}
          sm={4}
          xl={2}
          xs={12}
        >
          <Pm25Levels
            pm25level="Moderate"
            pm25levelText="(12.1 - 35.4)"
            background="#f8fe28"
          />
        </Grid>
        <Grid
          item
          lg={2}
          sm={4}
          xl={2}
          xs={12}
        >
          <Pm25Levels
            pm25level="Unhealthy for sensitive groups"
            pm25levelText="(35.6 - 55.4)"
            background="#ee8310"
            pm25levelColor="#FFFFFF"
          />
        </Grid>
        <Grid
          item
          lg={2}
          sm={4}
          xl={2}
          xs={12}
        >
          <Pm25Levels
            pm25level="Unhealthy"
            pm25levelText="(55.5 - 150.4)"
            background="#fe0000"
            pm25levelColor="#FFFFFF"
          />
        </Grid>
        <Grid
          item
          lg={2}
          sm={4}
          xl={2}
          xs={12}
        >
          <Pm25Levels
            pm25level="Very unhealthy"
            pm25levelText="(150.5 - 250.4)"
            background="#8639c0"
            pm25levelColor="#FFFFFF"
          />
        </Grid>
        <Grid
          item
          lg={2}
          sm={4}
          xl={2}
          xs={12}
        >
          <Pm25Levels
            pm25level="Hazardous"
            pm25levelText="(250.5 - 500.4)"
            background="#81202e"
            pm25levelColor="#FFFFFF"
          />
        </Grid>
        <p className={classes.differenceIcon}>PM <sub>2.5</sub> - Particulate Matter</p>
      </Grid>
    </div>
  );
};

export default Dashboard;
