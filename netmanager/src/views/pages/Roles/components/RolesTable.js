/* eslint-disable */
import React, { useState } from 'react';
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
import { deleteUserRoleApi, updateUserRoleApi } from '../../../apis/accessControl';
import { useDispatch } from 'react-redux';
import { loadUserRoles } from 'redux/AccessControl/operations';
import { updateMainAlert } from 'redux/MainAlert/operations';
import { isEmpty } from 'underscore';

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
  const { className, roles, ...rest } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const [updatedRole, setUpdatedRole] = useState({});
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [roleDelState, setRoleDelState] = useState({ open: false, role: {} });

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
          dispatch(loadUserRoles());
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
        dispatch(loadUserRoles());
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
    <>
      {roles && (
        <Card {...rest} className={clsx(classes.root, className)}>
          <CustomMaterialTable
            title={'role'}
            userPreferencePaginationKey={'roles'}
            data={roles}
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
                  return rowData.role_users.map((user) => {
                    return <div>{user}</div>;
                  });
                }
              },
              {
                title: 'Network',
                render: (rowData) => {
                  return rowData.network.map((network) => {
                    return <div>{network}</div>;
                  });
                }
              },
              {
                title: 'Permissions',
                render: (rowData) => {
                  return rowData.role_permissions.map((permission) => {
                    return <div>{permission}</div>;
                  });
                }
              },
              {
                title: 'Action',
                render: (role) => {
                  return (
                    <div>
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
                />
                <TextField
                  margin="dense"
                  id="role_status"
                  name="role_status"
                  type="text"
                  label="Status"
                  variant="outlined"
                  value={updatedRole && updatedRole.role_status}
                  onChange={handleUpdateRole('role_status')}
                  fullWidth
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
        </Card>
      )}
    </>
  );
};

export default RolesTable;
