import React from "react";
import { makeStyles } from "@material-ui/styles";
import { AirQloudToolbar, AirQloudsTable } from "./index";
import ErrorBoundary from "views/ErrorBoundary/ErrorBoundary";

// styles
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

const AirQloudRegistry = () => {
  const classes = useStyles();

  return (
    <ErrorBoundary>
      <div className={classes.root}>
        <AirQloudToolbar />
        <div className={classes.content}>
          <AirQloudsTable />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default AirQloudRegistry;
