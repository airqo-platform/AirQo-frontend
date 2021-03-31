import React from "react";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import Fade from "@material-ui/core/Fade";
import CircularProgress from "@material-ui/core/CircularProgress";
import PropTypes from "prop-types";

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    button: {
      margin: theme.spacing(2),
    },
    placeholder: {
      minHeight: 30,
    },
  })
);

export const CircularLoader = ({ loading, size }) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.placeholder}>
        <Fade
          in={loading}
          style={{
            transitionDelay: loading ? "500ms" : "0ms",
          }}
          unmountOnExit
        >
          <CircularProgress size={size || 30} />
        </Fade>
      </div>
    </div>
  );
};

CircularLoader.propTypes = {
  loading: PropTypes.bool.isRequired,
  size: PropTypes.number,
};

export const LargeCircularLoader = ({ loading, size, height }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: height || "100vh",
      }}
    >
      <CircularLoader loading={loading} size={size} />
    </div>
  );
};

export default CircularLoader;
