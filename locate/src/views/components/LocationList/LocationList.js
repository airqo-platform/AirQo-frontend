import React, { useState } from "react";
import { makeStyles } from "@material-ui/styles";

import { LocationsToolbar, LocationsTable } from "./index";
import mockData from "./data";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  content: {
    marginTop: theme.spacing(2),
  },
}));

const LocationList = () => {
  const classes = useStyles();

  const [users] = useState(mockData);

  return (
    <div className={classes.root}>
      <LocationsToolbar />
      <div className={classes.content}>
        <LocationsTable users={users} />
      </div>
    </div>
  );
};

export default LocationList;
