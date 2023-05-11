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
import { addRoleApi, assignPermissionsToRoleApi } from '../../../apis/accessControl';
import OutlinedSelect from '../../../components/CustomSelects/OutlinedSelect';
import { loadRolesSummary } from 'redux/AccessControl/operations';

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
  },
  modelWidth: {
    minWidth: 450
  }
}));

const RolesToolbar = (props) => {
  const classes = useStyles();
  const { className, mappeduserState, mappedErrors, permissions, ...rest } = props;
  const dispatch = useDispatch();
  const initialState = {
    roleName: ''
  };
  const [form, setState] = useState(initialState);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork'));

  const permissionOptions =
    permissions &&
    permissions.map((permission) => {
      return {
        value: permission._id,
        label: permission.permission
      };
    });

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

    setState({
      ...form,
      [id]: value
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setOpen(false);
    const body = {
      role_code: form.roleName,
      role_name: form.roleName,
      network_id: activeNetwork._id
    };
    // add new role
    addRoleApi(body)
      .then((resData) => {
        // assign permissions to role
        const permissions = selectedPermissions.map((permission) => permission.value);
        assignPermissionsToRoleApi(resData.created_role._id, { permissions })
          .then((resData) => {
            setState(initialState);
            setSelectedPermissions([]);
            dispatch(loadRolesSummary(activeNetwork._id));
            dispatch(
              updateMainAlert({
                message: 'New role added successfully',
                show: true,
                severity: 'success'
              })
            );
            setLoading(false);
          })
          .catch((error) => {
            dispatch(
              updateMainAlert({
                message: 'Unable to create new role. Please try again.',
                show: true,
                severity: 'error'
              })
            );
            setLoading(false);
          });
      })
      .catch((error) => {
        dispatch(
          updateMainAlert({
            message: error.response && error.response.data && error.response.data.message,
            show: true,
            severity: 'error'
          })
        );
        setLoading(false);
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
          <Button variant="contained" color="primary" onClick={handleClickOpen} disabled={loading}>
            Add Role
          </Button>
          <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">Add Role</DialogTitle>
            <DialogContent>
              <div className={classes.modelWidth}>
                <TextField
                  margin="dense"
                  id="roleName"
                  name="role_name"
                  type="text"
                  label="Role"
                  onChange={onChange}
                  variant="outlined"
                  value={form.roleName}
                  fullWidth
                  style={{ marginBottom: '30px' }}
                  required
                />

                <OutlinedSelect
                  className="reactSelect"
                  label="Permissions"
                  onChange={(options) => setSelectedPermissions(options)}
                  options={permissionOptions}
                  value={selectedPermissions}
                  fullWidth
                  isMulti
                  scrollable
                  height={'100px'}
                  required
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
