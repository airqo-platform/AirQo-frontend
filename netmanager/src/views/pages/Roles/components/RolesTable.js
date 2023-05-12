/* eslint-disable */
import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography
} from '@material-ui/core';
import CustomMaterialTable from 'views/components/Table/CustomMaterialTable';
import ConfirmDialog from 'views/containers/ConfirmDialog';
import {
  assignPermissionsToRoleApi,
  deleteRoleApi,
  getUsersWithRole,
  removePermissionsFromRoleApi,
  updateRoleApi
} from '../../../apis/accessControl';
import { useDispatch } from 'react-redux';
import { updateMainAlert } from 'redux/MainAlert/operations';
import { isEmpty } from 'underscore';
import { RemoveRedEye } from '@material-ui/icons';
import UserPopupTable from './UserPopupTable';
import OutlinedSelect from '../../../components/CustomSelects/OutlinedSelect';
import { loadRolesSummary } from 'redux/AccessControl/operations';

const useStyles = makeStyles((theme) => ({
  root: {},
  content: {
    padding: 0
  },
  inner: {
    minWidth: 1050
  },
  nameContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  avatar: {
    marginRight: theme.spacing(2)
  },
  actions: {
    justifyContent: 'flex-end'
  },
  menu: {
    width: 400
  }
}));

const RolesTable = (props) => {
  const { className, roles, permissions, loading, ...rest } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const [updatedRole, setUpdatedRole] = useState({});
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [roleDelState, setRoleDelState] = useState({ open: false, role: {} });
  const [selectedRoleUsers, setSelectedRoleUsers] = useState(null);
  const [rolePermissionsOptions, setRolePermissionsOptionsOptions] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState(null);
  const [open, setOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork'));

  const handleClose = () => {
    setOpen(false);
    setSelectedRoleUsers(null);
  };

  const handleUpdateRole = (field) => (event) => {
    event.preventDefault();
    if (field === 'role_name') {
      setUpdatedRole({
        ...updatedRole,
        role_name: event.target.value.toUpperCase(),
        role_code: event.target.value.toUpperCase()
      });
    } else {
      setUpdatedRole({ ...updatedRole, [field]: event.target.value });
    }
  };

  const showEditDialog = (role) => {
    const permissionOptions =
      permissions &&
      permissions.map((permission) => {
        return {
          value: permission._id,
          label: permission.permission
        };
      });
    setRolePermissionsOptionsOptions(permissionOptions);

    // set selected permissions to the role permissions
    const selectedPermissions =
      role.role_permissions &&
      role.role_permissions.map((rolePermission) => {
        return {
          value: rolePermission._id,
          label: rolePermission.permission
        };
      });
    setSelectedPermissions(selectedPermissions);
    setShowEditPopup(true);
    setUpdatedRole(role);
  };

  const hideEditDialog = () => {
    setUpdatedRole({});
    setShowEditPopup(false);
  };

  const submitEditRole = (e) => {
    e.preventDefault();
    setLoading(true);
    if (!isEmpty(updatedRole)) {
      const data = {
        role_name: updatedRole.role_name,
        role_status: updatedRole.role_status,
        role_code: updatedRole.role_name
      };
      updateRoleApi(updatedRole._id, data)
        .then((res) => {
          // update role permissions
          if (selectedPermissions) {
            const newPermissions =
              updatedRole.role_permissions &&
              selectedPermissions.map((permission) => permission.value);

            if (newPermissions.length > 0) {
              const permissionIds = newPermissions.map((permission) => permission.value);

              assignPermissionsToRoleApi(updatedRole._id, { permissions: permissionIds })
                .then((res) => {
                  if (!isEmpty(activeNetwork)) {
                    dispatch(loadRolesSummary(activeNetwork._id));
                  }

                  dispatch(
                    updateMainAlert({
                      message: res.message,
                      show: true,
                      severity: 'success'
                    })
                  );
                  setLoading(false);
                  setUpdatedRole({});
                  setShowEditPopup(false);
                })
                .catch((error) => {
                  setLoading(false);
                  setUpdatedRole({});
                  setShowEditPopup(false);
                  dispatch(
                    updateMainAlert({
                      message: 'Error: Unable to update role permissions',
                      show: true,
                      severity: 'error'
                    })
                  );
                });
            }
          }
        })
        .catch((error) => {
          dispatch(
            updateMainAlert({
              message: 'Error: Unable to update role details',
              show: true,
              severity: 'error'
            })
          );
          setLoading(false);
          setUpdatedRole({});
          setShowEditPopup(false);
        });
    } else {
      dispatch(
        updateMainAlert({
          message: 'Please fill the fields you want to update',
          show: true,
          severity: 'error'
        })
      );
      setLoading(false);
    }
  };

  const showDeleteDialog = (role) => {
    setRoleDelState({ open: true, role });
  };

  const hideDeleteDialog = () => {
    setRoleDelState({ open: false, role: {} });
  };

  const deleteRole = () => {
    setLoading(true);
    deleteRoleApi(roleDelState.role._id)
      .then((res) => {
        if (!isEmpty(activeNetwork)) {
          dispatch(loadRolesSummary(activeNetwork._id));
        }
        hideDeleteDialog();
        dispatch(
          updateMainAlert({
            message: res.message,
            show: true,
            severity: 'success'
          })
        );
        setLoading(false);
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

    setRoleDelState({ open: false, role: {} });
  };

  return (
    <Card {...rest} className={clsx(classes.root, className)}>
      <CustomMaterialTable
        title={'role'}
        userPreferencePaginationKey={'roles'}
        data={!isEmpty(roles) ? roles : []}
        loading={loading}
        columns={[
          {
            title: 'Role Name',
            field: 'role_name'
          },
          {
            title: 'Status',
            field: 'role_status'
          },
          {
            title: 'Permissions',
            render: (rowData) => {
              return (
                <>
                  {rowData.role_permissions &&
                    rowData.role_permissions.map((permission) => (
                      <div>{permission.permission}</div>
                    ))}
                </>
              );
            }
          },
          {
            title: 'More',
            render: (rowData) => {
              return (
                <RemoveRedEye
                  style={{ color: 'green', cursor: 'pointer' }}
                  onClick={() => {
                    setLoading(true);
                    // get role users
                    getUsersWithRole(rowData._id)
                      .then((res) => {
                        setSelectedRoleUsers(res.users_with_role);
                        setOpen(true);
                        setLoading(false);
                      })
                      .catch((error) => {
                        dispatch(
                          updateMainAlert({
                            message:
                              error.response && error.response.data && error.response.data.message,
                            show: true,
                            severity: 'error'
                          })
                        );
                        setLoading(false);
                      });
                  }}
                />
              );
            }
          },
          {
            title: 'Action',
            render: (role) => {
              return (
                <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '90px' }}>
                  <Button color="primary" onClick={() => showEditDialog(role)} disabled={isLoading}>
                    Update
                  </Button>

                  <Button
                    style={{ color: 'red' }}
                    onClick={() => showDeleteDialog(role)}
                    disabled={isLoading}
                  >
                    Delete
                  </Button>
                </div>
              );
            }
          }
        ]}
        options={{
          search: true,
          searchFieldAlignment: 'left',
          showTitle: false
        }}
      />
      <Dialog open={showEditPopup} onClose={hideEditDialog} aria-labelledby="form-dialog-title">
        <DialogTitle>Edit Role</DialogTitle>
        <DialogContent>
          <div>
            <TextField
              margin="dense"
              id="role_name"
              name="role_name"
              type="text"
              label="role"
              variant="outlined"
              value={updatedRole && updatedRole.role_name}
              onChange={handleUpdateRole('role_name')}
              fullWidth
              required
            />
            <TextField
              margin="dense"
              id="role_status"
              name="role_status"
              type="text"
              label="Status"
              variant="outlined"
              fullWidth
              value={updatedRole && updatedRole.role_status}
              onChange={handleUpdateRole('role_status')}
              select
              SelectProps={{
                native: true,
                style: { width: '100%', height: '50px' },
                MenuProps: {
                  className: classes.menu
                }
              }}
            >
              <option value={'active'}>Active</option>
              <option value={'inactive'}>Inactive</option>
            </TextField>
            <OutlinedSelect
              className="reactSelect"
              label="Permissions"
              onChange={(options) => setSelectedPermissions(options)}
              options={rolePermissionsOptions}
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
            <Button color="primary" variant="outlined" onClick={hideEditDialog}>
              Cancel
            </Button>
            <Button
              style={{ margin: '0 15px' }}
              onClick={submitEditRole}
              color="primary"
              variant="contained"
            >
              Submit
            </Button>
          </div>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        title={'Delete Role'}
        open={roleDelState.open}
        message={
          <span>
            Are you sure you want to delete this role —
            <strong>{roleDelState.role.role_name}</strong>?
          </span>
        }
        confirm={deleteRole}
        close={hideDeleteDialog}
        error
      />

      {selectedRoleUsers && (
        <Dialog open={open} onClose={handleClose} aria-labelledby="users-dialog-title">
          <DialogTitle id="users-dialog-title">
            <heading style={{ textAlign: 'center' }}>Role Users</heading>
          </DialogTitle>
          <DialogContent>
            {!isEmpty(selectedRoleUsers) ? (
              <UserPopupTable users={selectedRoleUsers} />
            ) : (
              <Card>
                <CardContent>
                  <Typography variant="h5" component="h2">
                    No users found
                  </Typography>
                </CardContent>
              </Card>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Card>
  );
};

export default RolesTable;
