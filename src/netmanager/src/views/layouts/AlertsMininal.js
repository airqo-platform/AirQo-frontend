import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import TransitionAlerts from "./common/TransitionAlerts";

const useStyles = makeStyles(() => ({
  root: {
    // paddingTop: 64,
    height: "100%",
  },
  content: {
    height: "100%",
  },
}));

const AlertMinimal = ({ children }) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <TransitionAlerts />
      <main className={classes.content}>{children}</main>
    </div>
  );
};

AlertMinimal.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default AlertMinimal;
