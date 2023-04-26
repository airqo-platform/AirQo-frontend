/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import {
  Button,
  TextField,
  DialogTitle,
  DialogContent,
  Dialog,
  DialogActions
} from '@material-ui/core';
import { updateMainAlert } from 'redux/MainAlert/operations';
import { createAlertBarExtraContentFromObject } from 'utils/objectManipulators';
import { addUserRoleApi } from '../../../apis/accessControl';
import { loadUserRoles } from 'redux/AccessControl/operations';

const useStyles = makeStyles((theme) => ({
  root: {
    '&$error': {
      color: 'red'
    }
  },
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
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit
  },
  dense: {
    marginTop: 16
  },
  menu: {
    width: 200
  }
}));

const RolesToolbar = (props) => {
  const classes = useStyles();
  const { className, mappeduserState, mappedErrors, ...rest } = props;
  const dispatch = useDispatch();
  const initialState = {
    roleName: ''
  };
  const [form, setState] = useState(initialState);
  const [open, setOpen] = useState(false);

  const clearState = () => {
    setState({ ...initialState });
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setState(initialState);
  };

  const onChange = (e) => {
    e.preventDefault();
    const { id, value } = e.target;

    setState(
      {
        ...form,
        [id]: value
      },
      () => {
        console.log(errors);
      }
    );
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setOpen(false);
    const body = {
      role_code: form.roleName,
      role_name: form.roleName
    };
    addUserRoleApi(body)
      .then((resData) => {
        dispatch(loadUserRoles());
        setState(initialState);
        dispatch(
          updateMainAlert({
            message: resData.message,
            show: true,
            severity: 'success'
          })
        );
      })
      .catch((error) => {
        dispatch(
          updateMainAlert({
            message: error.response && error.response.data && error.response.data.message,
            show: true,
            severity: 'error'
          })
        );
      });
  };

  useEffect(() => {
    clearState();
  }, []);

  return (
    <div className={clsx(classes.root, className)}>
      <div className={classes.row}>
        <span className={classes.spacer} />
        <div>
          <Button variant="contained" color="primary" onClick={handleClickOpen}>
            Add Role
          </Button>
          <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">Add Role</DialogTitle>
            <DialogContent>
              <div>
                <TextField
                  autoFocus
                  margin="dense"
                  id="roleName"
                  name="role_name"
                  type="text"
                  label="Role"
                  onChange={onChange}
                  variant="outlined"
                  value={form.roleName}
                  fullWidth
                />
              </div>
            </DialogContent>

            <DialogActions>
              <div>
                <Button onClick={handleClose} color="primary" variant="outlined">
                  Cancel
                </Button>
                <Button
                  style={{ margin: '0 15px' }}
                  onClick={onSubmit}
                  color="primary"
                  variant="contained"
                >
                  Submit
                </Button>
              </div>
            </DialogActions>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default RolesToolbar;
