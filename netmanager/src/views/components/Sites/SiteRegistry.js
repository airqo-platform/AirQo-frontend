import React from "react";
import { makeStyles } from "@material-ui/styles";

import { SiteToolbar, SitesTable } from "./index";
import "assets/css/location-registry.css";

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
    color: "#000000",
    fontSize: 24,
    fontFamily: "Open Sans",
  },
}));

const SiteRegistry = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <SiteToolbar />
      <div className={classes.content}>
        <SitesTable />
      </div>
    </div>
  );
};

export default SiteRegistry;
