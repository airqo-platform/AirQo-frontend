import React, { useState } from "react";
import { makeStyles } from "@material-ui/styles";

import { LocationsToolbar, LocationsTable } from "./index";
import mockData from "./data";
//import './assets/css/location-registry.css';
import '../../../assets/css/location-registry.css';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  content: {
    marginTop: theme.spacing(2),
    //fontFamily: 'Open Sans'
  },
  title: {
    fontWeight: 700,
    color: '#000000',
    fontSize: 24,
    fontFamily: 'Open Sans'
  },
}));

const LocationList = () => {
  const classes = useStyles();

  const [users] = useState(mockData);

  return (
    <div className={classes.root}>
      <LocationsToolbar />
      <div className={classes.content}>
        {/*<LocationsTable users={users} />*/}
        <h5 className = {classes.title}> Location Registry </h5>
        <LocationsTable/>
      </div>
    </div>
  );
};

export default LocationList;
