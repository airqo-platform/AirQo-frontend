import React, { useState, useEffect } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import { CardActions, Divider } from "@material-ui/core";
import { withStyles } from "@material-ui/styles";
import PropTypes from "prop-types";
import axios from "axios";
import { render } from "enzyme";

const styles = theme => ({
  nested: {
    paddingLeft: theme.spacing(4)
  },
  root: {
    backgroundColor: theme.palette.background.paper,
    height: "auto",
    marginLeft: "1em"
  }
});

class LocateForm extends React.Component {
  // Master location form controls
  constructor(props) {
    super(props);
    this.state = {
      numberOfDevices: "",
      mustHaveCoord: "",
      btnSubmit: false
    };
    this.changeHandler = this.changeHandler.bind(this);
    this.submitHandler = this.submitHandler.bind(this);
  }

  changeHandler = e => {
    this.setState({ [e.target.name]: e.target.value });
    // toggle submit button ON and OFF
    if (e.target.name == "numberOfDevices") {
      if (e.target.value != "") {
        this.setState({ btnSubmit: true });
      } else {
        this.setState({ btnSubmit: false });
      }
    }
  };

  submitHandler = e => {
    e.preventDefault();
    //functionality after submitting form.
    // make api call
    axios
      .post(
        `http://localhost:4000/api/v1/map/parishes`,
        {
          sensor_number: parseInt(this.state.numberOfDevices, 10),
          polygon: this.props.plan.geometry["coordinates"]
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      )
      .then(res => {
        console.log(res);
        console.log(
          "Must have: ",
          this.state.mustHaveCoord == "" ? "None" : this.state.mustHaveCoord
        );
        //this.setState(prevState => ({ openConfirm: !prevState.openConfirm })); //
        console.log(this.state, this.props.plan);
      })
      .catch(e => console.log(e));
  };
  render() {
    const { numberOfDevices, mustHaveCoord } = this.state;
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <form noValidate autoComplete="off" onSubmit={this.submitHandler}>
          <Divider />
          <TextField
            name="numberOfDevices"
            label="Number of Devices"
            placeholder="No. of devices"
            required
            value={numberOfDevices}
            onChange={this.changeHandler}
            fullWidth
            margin="normal"
          />
          <TextField
            name="mustHaveCoord"
            label="'Must Have' Locations"
            placeholder="Longitude, Latitude"
            onChange={this.changeHandler}
            value={mustHaveCoord}
            fullWidth
            margin="normal"
          />
          <CardActions>
            <Button
              type="submit"
              name="submit"
              disabled={this.state.btnSubmit == false ? "true" : ""}
              color="secondary"
              variant="contained"
              size="small"
            >
              Submit
            </Button>
          </CardActions>
        </form>
      </div>
    );
  }
}
LocateForm.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(LocateForm);