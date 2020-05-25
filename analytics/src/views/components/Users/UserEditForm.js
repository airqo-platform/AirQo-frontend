import React from "react";
import { makeStyles } from '@material-ui/styles';
import clsx from 'clsx';

import {
 Button,
 FormGroup,
 FormControlLabel,
 FormControl,
 Input,
 InputLabel
} from '@material-ui/core';


const useStyles = makeStyles(theme => ({
  root: {},
  row: {
    height: '42px',
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(1)
  },
  spacer: {
    flexGrow: 1
  },
  importButton: {
    marginRight: theme.spacing(1)
  },
  exportButton: {
    marginRight: theme.spacing(1)
  },
  searchInput: {
    marginRight: theme.spacing(1)
  }
}));

const UserEditForm = props => {
  const { className,mappeduserState, ...rest } = props;

  const classes = useStyles();

  return (
    <form className="form form-horizontal" id="EditUserForm" onSubmit={props.editUser}>
      <div className={classes.row}>
        <div >
          <FormGroup>
           
            <FormControl >
              <InputLabel> userName:</InputLabel>
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
        <div >
          <FormGroup>
        
            <FormControl >
              <InputLabel> firstName:</InputLabel>
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
        <div >
          <FormGroup>
            <FormControl >
              <InputLabel> lastName:</InputLabel>
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
        <div >
          <FormGroup>
            
            <FormControl >
                <InputLabel> email:</InputLabel>
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
        <Button type="submit" variant="contained" size="large" >Submit</Button>
      </FormGroup>
    </form>
  );
};

export default UserEditForm;
