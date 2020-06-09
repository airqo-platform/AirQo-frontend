import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { AppBar, Toolbar } from '@material-ui/core';

const useStyles = makeStyles(() => ({
  root: {
    boxShadow: 'none'
  }
}));

const logo_style = {
    'height': '4em',
    'width': '4em',
    'borderRadius': '50%',
    'paddingTop': '.2em'
  }

const Topbar = props => {
  const { className, ...rest } = props;

  const classes = useStyles();
  const airqo_logo_style = {
    'height': '4em',
    'width': '4em',
    'paddingTop': '.2em',
    'marginRight': '.4em'
  }

  return (
    <AppBar
      {...rest}
      className={clsx(classes.root, className)}
      color="primary"
      position="fixed"
    >
      <Toolbar>
        <RouterLink to="/">
          <img
            alt="Logo"
            style = {logo_style}
            src="images/logos/kcca_logo.jpg"
          />
        </RouterLink>
        <RouterLink to="/">
          <img
            alt="airqo.net"
            style={airqo_logo_style}
            src="/images/logos/airqo_logo.png"
          />
        </RouterLink>
        <RouterLink to="/">
          <img
            alt="mak.ac.ug"
            style={logo_style}
            src="/images/logos/mak_logo.jpg"
          />
        </RouterLink>
      </Toolbar>
    </AppBar>
  );
};

Topbar.propTypes = {
  className: PropTypes.string
};

export default Topbar;
