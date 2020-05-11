import React, { useState, Component } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { makeStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Badge, Hidden, IconButton } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import NotificationsIcon from '@material-ui/icons/NotificationsOutlined';
import InputIcon from '@material-ui/icons/Input';
import { logoutUser } from "../../../../redux/Join/actions";

const useStyles = makeStyles(theme => ({
  root: {
    boxShadow: 'none'
  },
  flexGrow: {
    flexGrow: 1
  },
  signOutButton: {
    marginLeft: theme.spacing(1)
  }
}));

function withMyHook(Component) {
  return function WrappedComponent(props) {
    const classes = useStyles();
    return <Component {...props} classes={classes} />;
  };
}



const Topbar = props => {
  const divProps = Object.assign({}, props);
  delete divProps.layout;
  const { className, onSidebarOpen, ...rest } = props;
  const { user } = props.auth;

  const classes = useStyles();

  const [notifications] = useState([]);
  const logo_style = {
    'height': '4em',
    'width': '4em',
    'borderRadius': '50%',
    'paddingTop': '.2em',
    'marginRight': '.4em'
  }
  const airqo_logo_style = {
    'height': '4em',
    'width': '4em',
    'paddingTop': '.2em',
    'marginRight': '.4em'
  }
  const onLogoutClick = (e) => {
    e.preventDefault();
    props.logoutUser();
  };
 
  

  return (
    <AppBar
      {...rest}
      className={clsx(classes.root, className)}
    >
      <Toolbar>
        <RouterLink to="/">
          <img
            alt="Logo"
            style = {logo_style}
            src="/images/logos/kcca_logo.jpg"
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
        <div className={classes.flexGrow} />
        <Hidden mdDown>
          <IconButton color="inherit">
            <Badge
              badgeContent={notifications.length}
              color="primary"
              variant="dot"
            >
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton
            className={classes.signOutButton}
            color="inherit"
            onClick={onLogoutClick}
          >
            <InputIcon />
          </IconButton>
        </Hidden>
        <Hidden lgUp>
          <IconButton
            color="inherit"
            onClick={props.onLogoutClick}
          >
            <MenuIcon />
          </IconButton>
        </Hidden>
      </Toolbar>
    </AppBar>
  );
};

Topbar.propTypes = {
  className: PropTypes.string,
  onSidebarOpen: PropTypes.func,
  logoutUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, { logoutUser })(withMyHook(Topbar));

