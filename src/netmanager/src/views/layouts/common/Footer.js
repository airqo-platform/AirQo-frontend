import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Typography, Link } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(4),
  },
}));

let currentYear = new Date().getFullYear();

const Footer = (props) => {
  const { className, ...rest } = props;

  const classes = useStyles();

  return (
    <footer {...rest} className={clsx(classes.root, className)}>
      <Typography variant="body1">
        &copy;{" "}
        <Link component="a" href="https://airqo.net" target="_blank">
          AirQo
        </Link>
        . {currentYear}
      </Typography>
      <Typography variant="caption">Air Quality Initiative</Typography>
    </footer>
  );
};

Footer.propTypes = {
  className: PropTypes.string,
};

export default Footer;
