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
  const { className,mappedAppState, ...rest } = props;
  const userState = mappedAppState;

  const [open, setOpen] = React.useState(false);

  const classes = useStyles();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const onChange = (e) => {
    this.setState({ [e.target.id]: e.target.value });
  };
  const onSubmit = () =>{
    e.preventDefault();
    const userData = {
      userName: userState.userName,
      firstName: userState.firstName,
      lastName: userState.lastName,
      email: userState.email,
      password: userState.password,
      password2: userState.password2
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
                label="Email Address"
                type="email"
                value={userState.newUser.email}
                onChange={onChange}
                fullWidth
              />
              <TextField
                autoFocus
                margin="dense"
                id="userName"
                label="userName"
                type="text"
                value={userState.newUser.userName}
                onChange={onChange}
                fullWidth
              />
               <TextField
                autoFocus
                margin="dense"
                id="firstName"
                label="firstName"
                type="firstName"
                value={userState.newUser.firstName}
                onChange={onChange}
                fullWidth
              />
               <TextField
                autoFocus
                margin="dense"
                id="lastName"
                label="lastName"
                type="lastName"
                value={userState.newUser.lastName}
                onChange={onChange}
                fullWidth
              />
               <TextField
                autoFocus
                margin="dense"
                id="password"
                label="password"
                type="password"
                value={userState.newUser.password}
                onChange={onChange}
                fullWidth
              />
               <TextField
                autoFocus
                margin="dense"
                id="password2"
                label="password2"
                type="password2"
                value={userState.newUser.password2}
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

// AFASEFWE