import React from "react";

import {
 Button,
 FormGroup,
 FormControlLabel,
 FormControl,
 Input
} from '@material-ui/core';

const UserEditForm = props => {
  return (
    <form className="form form-horizontal" id="EditUserForm" onSubmit={props.editUser}>
      <div className="row">
        <div className="col-md-12">
          <FormGroup>
           
            <FormControl
             type="text" placeholder="Enter userName"
             name="userName" defaultValue={props.userData.userName}
            >
            <Input 
            defaultValue={props.userData.userName} 
            placeholder="Enter userName"
            inputProps={{ 'aria-label': 'description' }}
            name="userName"
            type="text">
            </Input>
          </FormControl>
          </FormGroup>
        </div>
        <div className="col-md-12">
          <FormGroup>
        
            <FormControl
             type="text" placeholder="Enter firstName"
             name="firstName" defaultValue={props.userData.firstName}
            >
            <Input 
            defaultValue={props.userData.firstName} 
            placeholder="Enter firstName"
            inputProps={{ 'aria-label': 'description' }}
            name="firstName"
            type="text">
            </Input>
            </FormControl>
          </FormGroup>
        </div>
        <div className="col-md-12">
          <FormGroup>
         
            <FormControl
             type="text" placeholder="Enter lastName"
             name="lastName" defaultValue={props.userData.lastName}
            >
            <Input 
            defaultValue={props.userData.lastName} 
            placeholder="Enter lastName"
            inputProps={{ 'aria-label': 'description' }}
            name="lastName"
            type="text">
            </Input>
              </FormControl>
          </FormGroup>
        </div>
        <div className="col-md-12">
          <FormGroup>
            
            <FormControl
             type="text" placeholder="Enter email"
             name="email" defaultValue={props.userData.email}
            >
                  <Input 
            defaultValue={props.userData.email} 
            placeholder="Enter email"
            inputProps={{ 'aria-label': 'description' }}
            name="email"
            type="email">
            </Input>
              </FormControl>
          </FormGroup>
        </div>
      </div>
      <FormGroup>
        <Button type="submit" variant="contained" size="large" block>Submit</Button>
      </FormGroup>
    </form>
  );
};

export default UserEditForm;
