import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import LocateSave from "./LocateSave";
import LocateForm from "./LocateForm";

const useStyles = makeStyles(theme => ({
    root: {
        zIndex: 999,
        position: "absolute",
        height: "auto",
        width: 250,
        opacity: 0.8,
        backgroundColor: theme.palette.background.paper
  }
  
}));

const MapMenu = props => {
    const classes = useStyles();
    const { user } = props.auth;

    return (
        <div className={classes.root}>
          <LocateForm plan={props.geojson} />
          <LocateSave plan={props.geojson} user_id={user._id} />
        </div>
      );
    };

MapMenu.propTypes = {
    auth: PropTypes.object.isRequired
};
      
const mapStateToProps = state => ({
    auth: state.auth
});
      
export default connect(mapStateToProps)(MapMenu);
