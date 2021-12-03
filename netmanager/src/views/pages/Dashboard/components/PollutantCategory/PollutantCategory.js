import React, { useEffect, useState, useRef } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { Card, CardContent, Grid, Typography, Avatar } from "@material-ui/core";

// styles
import "assets/css/pollutant-category.css";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
  },
  content: {
    alignItems: "center",
    display: "flex",
  },
  title: {
    fontWeight: 700,
  },
  avatar: {
    //backgroundColor: theme.palette.success.main,
    height: 56,
    width: 56,
  },
  icon: {
    height: 32,
    width: 32,
  },
  difference: {
    marginTop: theme.spacing(2),
    display: "flex",
    alignItems: "center",
  },
  differenceIcon: {
    color: theme.palette.success.dark,
  },
  differenceValue: {
    color: theme.palette.success.dark,
    marginRight: theme.spacing(1),
  },
}));

const PollutantCategory = (props) => {
  const ref = useRef();
  const { className, pm25level, pm25levelCount, iconClass, ...rest } = props;
  const [show, setShow] = useState(false);

  const classes = useStyles();

  const toggleShow = () => {
    setShow(!show);
  };

  useEffect(() => {
    const checkIfClickedOutside = (e) => {
      // If the menu is open and the clicked target is not within the menu,
      // then close the menu
      if (show && ref.current && !ref.current.contains(e.target))
        setShow(false);
    };

    document.addEventListener("mousedown", checkIfClickedOutside);

    return () => {
      // Cleanup the event listener
      document.removeEventListener("mousedown", checkIfClickedOutside);
    };
  }, [show]);

  return (
    <label className="pc-dropdown" ref={ref} onClick={toggleShow}>
      <Card
        {...rest}
        className={clsx(classes.root, className)}
        onClick={toggleShow}
      >
        <CardContent>
          <Grid container justify="space-between">
            <Grid item style={{ maxWidth: "50%" }}>
              <Typography
                className={classes.title}
                color="textSecondary"
                gutterBottom
                variant="body2"
              >
                {pm25level}
              </Typography>
              {/* <Typography variant="h3">{pm25levelCount}</Typography> */}
            </Grid>
            <Grid item>
              <Avatar className={classes.avatar + " " + iconClass}>
                {/* <PeopleIcon className={classes.icon} /> */}
                {pm25levelCount}
              </Avatar>
            </Grid>
          </Grid>
          {/* <div className={classes.difference}>
          <ArrowUpwardIcon className={classes.differenceIcon} />
          <Typography
            className={classes.differenceValue}
            variant="body2"
          ></Typography>
          <Typography className={classes.caption} variant="caption">
            Since last hour
          </Typography>
        </div> */}
        </CardContent>
      </Card>
      <ul className={`pc-dd-menu ${(!show && "dd-input") || ""}`}>
        <li className="pc-empty">no sites</li>
      </ul>
    </label>
  );
};

PollutantCategory.propTypes = {
  className: PropTypes.string,
};

export default PollutantCategory;
