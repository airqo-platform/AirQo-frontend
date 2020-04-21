import React from "react";
import { Link as RouterLink, withRouter } from "react-router-dom";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { Avatar, Typography } from "@material-ui/core";
import { connect } from "react-redux";
import avatar from "assets/img/faces/profile-placeholder.jpg";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minHeight: "fit-content",
  },
  avatar: {
    width: 60,
    height: 60,
  },
  name: {
    marginTop: theme.spacing(1),
  },
}));

const Profile = (props) => {
  const { className, ...rest } = props;

  const classes = useStyles();

  const { user } = props.auth;

  return (
    <div {...rest} className={clsx(classes.root, className)}>
      <Avatar
        alt="Person"
        className={classes.avatar}
        component={RouterLink}
        src={avatar}
        to="/settings"
      />
      <Typography className={classes.name} variant="h4">
        {user.firstName}
      </Typography>
      <Typography variant="body2">{user.lastName}</Typography>
    </div>
  );
};

Profile.propTypes = {
  className: PropTypes.string,
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, {})(withRouter(Profile));
