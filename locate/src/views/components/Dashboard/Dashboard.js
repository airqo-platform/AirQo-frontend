import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from "../../../redux/Join/actions";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import GridContainer from "../Grid/GridContainer.js";
import GridItem from "../Grid/GridItem.js";
import CustomInput from "../CustomInput/CustomInput.js";

import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
// core components

import Button from "../CustomButtons/Button.js";
import Card from "../Card/Card";
import CardHeader from "../Card/CardHeader.js";
import CardAvatar from "../Card/CardAvatar.js";
import CardBody from "../Card/CardBody.js";
import CardFooter from "../Card/CardFooter.js";

import Box from "@material-ui/core/Box";

const styles = {
  cardCategoryWhite: {
    color: "rgba(255,255,255,.62)",
    margin: "0",
    fontSize: "14px",
    marginTop: "0",
    marginBottom: "0"
  },
  cardTitleWhite: {
    color: "#FFFFFF",
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: "300",
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none"
  }
};

const useStyles = makeStyles(styles);

const locations = [
  { title: "location 1" },
  { title: "location 2" },
  { title: "location 3" },
  { title: "location 4" },
  { title: "location 5" },
  { title: "location 6" },
  { title: "location 7" },
  { title: "location 8" },
  { title: "location 9" }
];

const defaultProps = {
  options: locations,
  getOptionLabel: option => option.title
};

function withMyHook(Component) {
  return function WrappedComponent(props) {
    const classes = useStyles();
    return <Component {...props} classes={classes} />;
  };
}

class Dashboard extends Component {
  onLogoutClick = e => {
    e.preventDefault();
    this.props.logoutUser();
  };

  render() {
    const { user } = this.props.auth;
    return (
      <div style={{ height: "75vh" }} className="container valign-wrapper">
        <Box
          display="flex"
          flexDirection="row"
          p={1}
          m={1}
          bgcolor="background.paper"
        >
          <Box p={1}>
            <Autocomplete
              {...defaultProps}
              id="region"
              debug
              renderInput={params => (
                <TextField
                  {...params}
                  label="Filter by Region"
                  margin="normal"
                />
              )}
            />
          </Box>
          <Box p={1}>
            <Autocomplete
              {...defaultProps}
              id="district"
              debug
              renderInput={params => (
                <TextField
                  {...params}
                  label="Filter by District"
                  margin="normal"
                />
              )}
            />
          </Box>

          <Box p={1}>
            <Autocomplete
              {...defaultProps}
              id="district"
              debug
              renderInput={params => (
                <TextField
                  {...params}
                  label="Filter by County"
                  margin="normal"
                />
              )}
            />
          </Box>

          <Box p={1}>
            <Autocomplete
              {...defaultProps}
              id="parish"
              debug
              renderInput={params => (
                <TextField
                  {...params}
                  label="Filter by Parish"
                  margin="normal"
                />
              )}
            />
          </Box>
        </Box>

        <div className="row">
          <div className="col s12 center-align">
            <h4>
              {/* <b>Hey there,</b> {user.name.split(" ")[0]} */}
              <p className="flow-text grey-text text-darken-1">
                You are logged into{" "}
                <span style={{ fontFamily: "monospace" }}>AirQo Locate</span>{" "}
                app 👏
              </p>
            </h4>
            <button
              style={{
                width: "150px",
                borderRadius: "3px",
                letterSpacing: "1.5px",
                marginTop: "1rem"
              }}
              onClick={this.onLogoutClick}
              className="btn btn-large waves-effect waves-light hoverable blue accent-3"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }
}
Dashboard.propTypes = {
  logoutUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
};
const mapStateToProps = state => ({
  auth: state.auth
});
export default connect(mapStateToProps, { logoutUser })(withMyHook(Dashboard));
