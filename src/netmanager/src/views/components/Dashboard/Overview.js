import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from "redux/Join/actions";
import NavPills from "../NavPills/NavPills.js";
import { makeStyles } from "@material-ui/core/styles";
import DevicesIcon from "@material-ui/icons/Devices";
import AddBoxIcon from "@material-ui/icons/AddBox";
import PaymentIcon from "@material-ui/icons/Payment";
import CompassCalibrationIcon from "@material-ui/icons/CompassCalibration";
import AddLocationIcon from "@material-ui/icons/AddLocation";
import Schedule from "@material-ui/icons/Schedule";
import { useInitScrollTop } from "utils/customHooks";
import styles from "assets/jss/material-kit-react/views/componentsSections/pillsStyle.js";

const useStyles = makeStyles(styles);

function withMyHook(Component) {
  return function WrappedComponent(props) {
    const classes = useStyles();
    return <Component {...props} classes={classes} />;
  };
}

function Overview(props) {
  useInitScrollTop();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <NavPills
        color="primary"
        tabs={[
          {
            tabButton: "Locate",
            tabIcon: AddLocationIcon,
            tabContent: (
              <span>
                <p>
                  Is an essential tool for the growing network. After specifying
                  the broad region in which devices are to be located eg a
                  specific town or district, users can also specify the location
                  of existing devices, and ‘must-have’ locations. The tool can
                  then recommend final locations based on either the number of
                  devices available or the accuracy required across the network.
                  Locations can then be added to scheduling for deployment in
                  the required timeframe.
                </p>
              </span>
            ),
          },
          {
            tabButton: "Device Management",
            tabIcon: DevicesIcon,
            tabContent: (
              <span>
                <p>
                  Device Management offers a range of integrated tools for use
                  by air quality monitoring network managers. It enables real
                  time monitoring of the network and facilitates expansion,
                  maintenance and troubleshooting. Its ultimate goal to
                  efficiently maximise network uptime given resources available.
                  It also enables accurate logging of maintenance tasks such as
                  cleaning, replacing components and general troubleshooting.
                </p>
              </span>
            ),
          },
          {
            tabButton: "Device Registry",
            tabIcon: AddBoxIcon,
            tabContent: (
              <span>
                <p>
                  This feature provides an easy interface for registering new
                  devices, updating and deleting existing devices on the
                  network. On each device overview-page, further information
                  about the device (location, uptime, deployment status, etc)
                  can obtained.
                </p>
              </span>
            ),
          },

          {
            tabButton: "Scheduling",
            tabIcon: Schedule,
            tabContent: (
              <span>
                <p>
                  As networks grow networks become more difficult to manage with
                  ongoing and emergency maintenance combined with collocation
                  and deployment activities all competing for time. The
                  scheduling tool will provide the manager and their team with a
                  customisable plan of action that takes into account routine
                  works, issues arising and changing priorities
                </p>
              </span>
            ),
          },

          {
            tabButton: "Incentives",
            tabIcon: PaymentIcon,
            tabContent: (
              <span>
                <p>
                  This tool is a means of recording and rewarding hosts, boda
                  drivers and other support teams for their work. It will
                  capture the work that has been done on a monthly basis and
                  coordinate distribution of funds via mobile money. As well as
                  paying standing charges it can also manage one off incentives
                  and compensate hosts for electricity costs incurred etc.
                </p>
              </span>
            ),
          },
          {
            tabButton: "Collocation",
            tabIcon: CompassCalibrationIcon,
            tabContent: (
              <span>
                <p>
                  This feature allows collocation activities to be planned,
                  executed and results reported using times, device names and
                  locations. Following initial trials collocation records can
                  automatically feed into the calibration algorithm
                </p>
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}
Overview.propTypes = {
  logoutUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
};
const mapStateToProps = (state) => ({
  auth: state.auth,
});
export default connect(mapStateToProps, { logoutUser })(withMyHook(Overview));
