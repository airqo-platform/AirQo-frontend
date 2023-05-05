/* eslint-disable */
import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import {
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField
} from '@material-ui/core';
import CustomMaterialTable from 'views/components/Table/CustomMaterialTable';
import Chip from '@material-ui/core/Chip';
import ConfirmDialog from 'views/containers/ConfirmDialog';
import {
  deleteUserRoleApi,
  removePermissionsFromRoleApi,
  updateUserRoleApi
} from '../../../apis/accessControl';
import { useDispatch } from 'react-redux';
import { loadUserRoles } from 'redux/AccessControl/operations';
import { updateMainAlert } from 'redux/MainAlert/operations';
import { isEmpty } from 'underscore';
import { RemoveRedEye } from '@material-ui/icons';
import UserPopupTable from './UserPopupTable';
import OutlinedSelect from '../../../components/CustomSelects/OutlinedSelect';

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
  }
}));

const RolesTable = (props) => {
  const { className, roles, loading, ...rest } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const [updatedRole, setUpdatedRole] = useState({});
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [roleDelState, setRoleDelState] = useState({ open: false, role: {} });
  const [selectedRoleUsers, setSelectedRoleUsers] = useState(null);
  const [rolePermissionsOptions, setRolePermissionsOptionsOptions] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState(null);
  const [open, setOpen] = useState(false);

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
    setShowEditPopup(true);
    setUpdatedRole(role);

    const permissionOptions =
      role.role_permissions &&
      role.role_permissions.map((permission) => {
        return {
          value: permission._id,
          label: permission.permission
        };
      });
    setRolePermissionsOptionsOptions(permissionOptions);
  };

  const hideEditDialog = () => {
    setUpdatedRole({});
    setShowEditPopup(false);
  };

  const submitEditRole = (e) => {
    e.preventDefault();
    if (!isEmpty(updatedRole)) {
      const data = { ...updatedRole };
      updateUserRoleApi(updatedRole._id, data)
        .then((res) => {
          // check if selected permissions are same as the role permissions, if not assign the new permissions to the role
          // if (selectedPermissions) {
          //   const newPermissions = selectedPermissions.filter(
          //     (permission) =>
          //       !updatedRole.role_permissions.some(
          //         (rolePermission) => rolePermission._id === permission.value
          //       )
          //   );
          //   if (newPermissions.length > 0) {
          //     const permissionIds = newPermissions.map((permission) => permission.value);
          //     removePermissionsFromRoleApi(updatedRole._id, { permissions: permissionIds })
          //       .then((res) => {
          //         const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork'));
          //         if (!isEmpty(activeNetwork)) {
          //           dispatch(loadUserRoles(activeNetwork._id));
          //         }
          //         dispatch(
          //           updateMainAlert({
          //             message: res.message,
          //             show: true,
          //             severity: 'success'
          //           })
          //         );
          //       })
          //       .catch((error) => {
          //         dispatch(
          //           updateMainAlert({
          //             message: error.response && error.response.data && error.response.data.message,
          //             show: true,
          //             severity: 'error'
          //           })
          //         );
          //       });
          //   }
          // }

          // check for permissions that have been removed and unassign them from role
          // if (rolePermissionsOptions) {
          //   const removedPermissions = rolePermissionsOptions.filter(
          //     (permission) =>
          //       !selectedPermissions.some(
          //         (selectedPermission) => selectedPermission.value === permission.value
          //       )
          //   );
          //   if (removedPermissions.length > 0) {
          //     const permissionIds = removedPermissions.map((permission) => permission.value);
          //     updateUserRoleApi(updatedRole._id, { removePermissions: permissionIds })
          //       .then((res) => {})
          //       .catch((error) => {
          //         dispatch(
          //           updateMainAlert({
          //             message: error.response && error.response.data && error.response.data.message,
          //             show: true,
          //             severity: 'error'
          //           })
          //         );
          //       });
          //   }
          // }

          const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork'));
          if (!isEmpty(activeNetwork)) {
            dispatch(loadUserRoles(activeNetwork._id));
          }
          dispatch(
            updateMainAlert({
              message: res.message,
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
      setUpdatedRole({});
      setShowEditPopup(false);
    } else {
      dispatch(
        updateMainAlert({
          message: 'Please fill the fields you want to update',
          show: true,
          severity: 'error'
        })
      );
    }
  };

  const showDeleteDialog = (role) => {
    setRoleDelState({ open: true, role });
  };

  const hideDeleteDialog = () => {
    setRoleDelState({ open: false, role: {} });
  };

  const deleteRole = () => {
    deleteUserRoleApi(roleDelState.role._id)
      .then((res) => {
        const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork'));
        if (!isEmpty(activeNetwork)) {
          dispatch(loadUserRoles(activeNetwork._id));
        }
        hideDeleteDialog();
        dispatch(
          updateMainAlert({
            message: res.message,
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
            field: 'role_status',
            render: (rowData) => {
              return <Chip label={rowData.role_status} />;
            }
          },
          {
            title: 'Users',
            render: (rowData) => {
              const users = rowData.role_users.length;

              return (
                <div>
                  {rowData.role_users.length > 0 ? (
                    <RemoveRedEye
                      style={{ color: 'green', cursor: 'pointer' }}
                      onClick={() => {
                        setSelectedRoleUsers(rowData.role_users);
                        setOpen(true);
                      }}
                    />
                  ) : (
                    <RemoveRedEye style={{ color: 'grey' }} disabled />
                  )}
                </div>
              );
            }
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
            title: 'Action',
            render: (role) => {
              return (
                <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '90px' }}>
                  <Button color="primary" onClick={() => showEditDialog(role)}>
                    Update
                  </Button>

                  <Button style={{ color: 'red' }} onClick={() => showDeleteDialog(role)}>
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
            />
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
            <h6 style={{ textAlign: 'center' }}>Role Users</h6>
          </DialogTitle>
          <DialogContent>
            <UserPopupTable users={selectedRoleUsers} />
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
