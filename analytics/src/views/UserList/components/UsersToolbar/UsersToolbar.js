/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import { Button, TextField } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import { SearchInput } from 'components';

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

/***func starts here....... */
const UsersToolbar = props => {
  const { className,mappeduserState, ...rest } = props;

  console.log('the mapped state for UsersToolsbar is here:')
  console.dir(mappeduserState);
  
  const userState = mappeduserState;
  const newUser = userState.newUser;

  const [open, setOpen] = React.useState(false);

  const classes = useStyles();

  const handleClickOpen = () => {
    setOpen(true);
    //I also need to trigger something here which enables updates the newUser state variable
    //update the user action for opening the dialog box of adding a new user.
    //I could now update the state using actions
    props.mappedShowAddDialog();
  };

  const handleClose = () => {
    setOpen(false);
    props.mappedHideAddDialog();
  };

  const onChange = (e) => {
    this.setState({ [e.target.id]: e.target.value });
  };

  const onSubmit = (e) =>{
    e.preventDefault();
    const userData = {
      userName: userState.newUser.userName,
      firstName: userState.newUser.firstName,
      lastName: userState.newUser.lastName,
      email: userState.newUser.email,
      password: userState.newUser.password,
      password2: userState.newUser.password2
    };
    console.log(userData);
    props.mappedAddUser(userData);
  }

  return (
    <div
      {...rest}
      className={clsx(classes.root, className)}
    >
      <div className={classes.row}>
        <SearchInput
          className={classes.searchInput}
          placeholder="Search user"
        />
        <span className={classes.spacer} />
        <div>
          <Button variant="contained" color="primary" onClick={handleClickOpen}>
            Add User
      </Button>
          <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">

            <DialogTitle id="form-dialog-title">Add User</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                id="email"
                name="Email Address"
                type="email"
                onChange={onChange}
                fullWidth
              />
              <TextField
                autoFocus
                margin="dense"
                id="userName"
                name="userName"
                type="text"
                onChange={onChange}
                fullWidth
              />
               <TextField
                autoFocus
                margin="dense"
                id="firstName"
                name="firstName"
                type="firstName"
                onChange={onChange}
                fullWidth
              />
               <TextField
                autoFocus
                margin="dense"
                id="lastName"
                name="lastName"
                type="lastName"
                onChange={onChange}
                fullWidth
              />
               <TextField
                autoFocus
                margin="dense"
                id="password"
                name="password"
                type="password"
                onChange={onChange}
                fullWidth
              />
               <TextField
                autoFocus
                margin="dense"
                id="password2"
                name="password2"
                type="password2"
                onChange={onChange}
                fullWidth
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="primary">
                Cancel
          </Button>
              <Button onClick={onSubmit} color="primary">
                Submit
          </Button>
            </DialogActions>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

UsersToolbar.propTypes = {
  className: PropTypes.string
};

export default UsersToolbar;