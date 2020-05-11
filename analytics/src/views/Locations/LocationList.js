import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { IconButton, Grid, Typography } from '@material-ui/core';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';

import { LocationsToolbar, LocationCard } from './components';
//import mockData from './data';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3)
  },
  content: {
    marginTop: theme.spacing(2)
  },
  pagination: {
    marginTop: theme.spacing(3),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end'
  }
}));

const LocationList = () => {
  const classes = useStyles();

  //const [locations] = useState(mockData);
  const [locations,setLocations ] = useState([]);

  useEffect(() => {
    //fetch('https://analytcs-bknd-service-dot-airqo-250220.uc.r.appspot.com/api/v1/dashboard/monitoringsites?organisation_name=KCCA')
    fetch('http://127.0.0.1:5000/api/v1/dashboard/monitoringsites?organisation_name=KCCA')
      .then(res => res.json())
      .then((locationData) => {
        setLocations(locationData.airquality_monitoring_sites)
      })
      .catch(console.log)
  },[]);

  return (
    <div className={classes.root}>
      <LocationsToolbar />
      <div className={classes.content}>
        <Grid
          container
          spacing={3}
        >
          {locations.map(location => (
            <Grid
              item
              key={location.id}
              lg={4}
              md={6}
              xs={12}
            >
              <LocationCard location={location} />
            </Grid>
          ))}
        </Grid>
      </div>
      <div className={classes.pagination}>
        <Typography variant="caption">1-6 of 20</Typography>
        <IconButton>
          <ChevronLeftIcon />
        </IconButton>
        <IconButton>
          <ChevronRightIcon />
        </IconButton>
      </div>
    </div>
  );
};

export default LocationList;
