import React from "react";
import { FormGroup, ControlLabel, FormControl, Button } from "react-bootstrap";

const UserForm = props => {
  return (
    <form className="form form-horizontal" id="addUserForm" onSubmit={props.addUser}>
      <div className="row">
        <h3 className="centerAlign">Add new User</h3>
        <div className="col-md-12">
          <FormGroup>
            <ControlLabel>userName: </ControlLabel>
            <FormControl
              type="text" placeholder="userName"
              name="userName"
            />
          </FormGroup>
        </div>
        <div className="col-md-12">
          <FormGroup>
            <ControlLabel>email: </ControlLabel>
            <FormControl
              type="text" placeholder="email"
              name="email"
            />
          </FormGroup>
        </div>
        <div className="col-md-12">
          <FormGroup>
            <ControlLabel>firstName: </ControlLabel>
            <FormControl
              type="text" placeholder="firstName"
              name="firstName"
            />
          </FormGroup>
        </div>
        <div className="col-md-12">
          <FormGroup>
            <ControlLabel>lastName: </ControlLabel>
            <FormControl
              type="text" placeholder="lastName"
              name="lastName"
            />
          </FormGroup>
        </div>
        <div className="col-md-12">
          <FormGroup>
            <ControlLabel>password: </ControlLabel>
            <FormControl
              type="password" placeholder="password"
              name="password"
            />
          </FormGroup>
        </div>
        <div className="col-md-12">
          <FormGroup>
            <ControlLabel>password confirmation: </ControlLabel>
            <FormControl
              type="password" placeholder="password confirm"
              name="password2"
            />
          </FormGroup>
        </div>
      </div>
      <FormGroup>
        <Button type="submit" bsStyle="success" bsSize="large" block>Submit</Button>
      </FormGroup>
    </form>
  );
};

export default UserForm;
