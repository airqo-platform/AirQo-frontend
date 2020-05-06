import React from "react";
import { FormGroup, ControlLabel, FormControl, Button } from "react-bootstrap";

const UserEditForm = props => {
  return (
    <form className="form form-horizontal" id="EditUserForm" onSubmit={props.editUser}>
      <div className="row">
        <div className="col-md-12">
          <FormGroup>
            <ControlLabel>userName: </ControlLabel>
            <FormControl
              type="text" placeholder="Enter userName"
              name="userName" defaultValue={props.productData.userName}
            />
          </FormGroup>
        </div>
        <div className="col-md-12">
          <FormGroup>
            <ControlLabel>firstName: </ControlLabel>
            <FormControl
              type="text" placeholder="Enter firstName"
              name="firstName" defaultValue={props.productData.firstName}
            />
          </FormGroup>
        </div>
        <div className="col-md-12">
          <FormGroup>
            <ControlLabel>lastName: </ControlLabel>
            <FormControl
              type="text" placeholder="Enter lastName"
              name="lastName" defaultValue={props.productData.lastName}
            />
          </FormGroup>
        </div>
        <div className="col-md-12">
          <FormGroup>
            <ControlLabel>email: </ControlLabel>
            <FormControl
              type="email" placeholder="Enter email"
              name="email" defaultValue={props.productData.email}
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

export default UserEditForm;
