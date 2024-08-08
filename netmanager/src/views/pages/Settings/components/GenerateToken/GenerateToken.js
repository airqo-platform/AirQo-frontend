import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import EditIcon from '@material-ui/icons/EditOutlined';
import usersStateConnector from 'views/stateConnectors/usersStateConnector';
import { makeStyles } from '@material-ui/core/styles';
import {
  createClientApi,
  getClientsApi,
  updateClientApi,
  generateTokenApi,
  activationRequestApi
} from 'views/apis/analytics';
import { useDispatch } from 'react-redux';
import { updateMainAlert } from 'reducer/MainAlert/operations';
import DataTable from './Table';
import {
  Card,
  CardHeader,
  Divider,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  CircularProgress
} from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import { getUserDetails } from '../../../../../reducer/Join/actions';
import { isEmpty, isEqual } from 'underscore';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2)
  },
  DialogTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  DialogContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '380px'
  },
  DialogActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  DialogButton: {
    margin: theme.spacing(1)
  },
  DialogButtonContainer: {
    display: 'flex',
    justifyContent: 'flex-end'
  }
}));

// Inactive clients are not allowed to generate tokens so show a modal to the user
const InactiveClientModal = (props) => {
  const { open, onClose, selectedClient } = props;
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const handleActivationRequest = async () => {
    setIsLoading(true);
    try {
      const clientID = selectedClient?.client_id;
      const response = await activationRequestApi(clientID);
      if (response.success === true) {
        dispatch(
          updateMainAlert({
            message: 'Activation request sent successfully',
            show: true,
            severity: 'success'
          })
        );
      } else {
        dispatch(
          updateMainAlert({
            message: 'Activation request failed',
            show: true,
            severity: 'error'
          })
        );
      }
    } catch (error) {
      console.error(error);
      dispatch(
        updateMainAlert({
          message: 'Activation request failed',
          show: true,
          severity: 'error'
        })
      );
    }
    setIsLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Client Inactive</DialogTitle>
      <DialogContent>
        <p>
          You cannot generate a token for an inactive client, reach out to support for assistance at
          <a href="mailto:support@airqo.net"> support@airqo.net</a> or send an activation request.
        </p>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button onClick={handleActivationRequest} color="primary" variant="contained">
          {isLoading ? <CircularProgress size={24} /> : 'Activation Request'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const RegisterClient = (props) => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const { open, onClose, data, onRegister } = props;
  const [clientName, setClientName] = useState('');
  const [clientIP, setClientIP] = useState('');
  const [clientNameError, setClientNameError] = useState(false);
  const userID = data.user._id;
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!clientName) {
      setClientNameError(true);
      return;
    }
    setIsLoading(true);
    try {
      const data = {
        name: clientName,
        user_id: userID
      };

      if (clientIP) {
        data.ip_address = clientIP;
      }

      const response = await createClientApi(data);
      if (response.success === true) {
        dispatch(
          updateMainAlert({
            message: 'Client registered successfully',
            show: true,
            severity: 'success'
          })
        );
        onClose();
        onRegister();
        setClientName('');
        setClientIP('');
      } else {
        onClose();
        dispatch(
          updateMainAlert({
            message: 'Client registration failed',
            show: true,
            severity: 'error'
          })
        );
      }
    } catch (error) {
      console.error(error);
      onClose();
      dispatch(
        updateMainAlert({
          message: 'Client registration failed',
          show: true,
          severity: 'error'
        })
      );
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle className={classes.DialogTitle}>Register Client</DialogTitle>
      <DialogContent className={classes.DialogContent}>
        <div style={{ marginBottom: '10px', width: '100%' }}>
          <TextField
            label="Client Name"
            value={clientName}
            variant="outlined"
            onChange={(e) => {
              setClientName(e.target.value);
              setClientNameError(false);
            }}
            error={clientNameError}
            helperText={clientNameError && 'Please enter a client name'}
            fullWidth
          />
        </div>
        <div style={{ width: '100%' }}>
          <TextField
            label="Client IP (Optional)"
            value={clientIP}
            variant="outlined"
            onChange={(e) => {
              setClientIP(e.target.value);
            }}
            fullWidth
          />
        </div>
      </DialogContent>
      <DialogActions className={classes.DialogActions}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          color="primary"
          variant="contained"
          onClick={handleSubmit}
          className={classes.DialogButton}
          disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} /> : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const EditClient = (props) => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const { open, onClose, data, onEdit } = props;
  const [clientName, setClientName] = useState('');
  const [clientIP, setClientIP] = useState('');
  const [clientNameError, setClientNameError] = useState(false);
  const [clientIPError, setClientIPError] = useState(false);
  const client_id = data._id;
  const [isLoading, setIsLoading] = useState(false);

  const handleInitialData = () => {
    setClientName(data.name ? data.name : '');
    setClientIP(data.ip_address ? data.ip_address : '');
    setClientIPError(false);
    setClientNameError(false);
  };

  useEffect(() => {
    handleInitialData();
  }, [data]);

  const isValidIP = (ip) => {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  };

  const handleSubmit = async () => {
    if (!clientName) {
      setClientNameError(true);
      return;
    }
    if (clientIP && !isValidIP(clientIP)) {
      setClientIPError(true);
      return;
    }
    setIsLoading(true);
    try {
      const data = {
        name: clientName
      };

      // Add clientIP to the data if it's provided
      if (clientIP) {
        data.ip_address = clientIP;
      }

      const response = await updateClientApi(data, client_id);
      if (response.success === true) {
        dispatch(
          updateMainAlert({
            message: 'Client details updated successfully',
            show: true,
            severity: 'success'
          })
        );
        onClose();
        onEdit();
      } else {
        onClose();
        dispatch(
          updateMainAlert({
            message: 'Client details update failed',
            show: true,
            severity: 'error'
          })
        );
      }
    } catch (error) {
      console.error(error);
      onClose();
      dispatch(
        updateMainAlert({
          message: 'Client details update failed',
          show: true,
          severity: 'error'
        })
      );
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle className={classes.DialogTitle}>Edit Client</DialogTitle>
      <DialogContent className={classes.DialogContent}>
        <div style={{ marginBottom: '10px', width: '100%' }}>
          <TextField
            label="Client Name"
            defaultValue={clientName}
            variant="outlined"
            onChange={(e) => {
              setClientName(e.target.value);
              setClientNameError(false);
            }}
            error={clientNameError}
            helperText={clientNameError && 'Please enter a client name'}
            fullWidth
          />
        </div>
        <div style={{ width: '100%' }}>
          <TextField
            label="Client IP (Optional)"
            value={clientIP}
            variant="outlined"
            onChange={(e) => {
              setClientIP(e.target.value);
              setClientIPError(false);
            }}
            error={clientIPError}
            helperText={clientIPError && 'Please enter a valid client IP'}
            fullWidth
          />
        </div>
      </DialogContent>
      <DialogActions className={classes.DialogActions}>
        <Button
          onClick={() => {
            handleInitialData();
            onClose();
          }}>
          Cancel
        </Button>
        <Button
          color="primary"
          variant="contained"
          onClick={() => handleSubmit()}
          className={classes.DialogButton}
          disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} /> : 'Edit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const GenerateToken = (props) => {
  const dispatch = useDispatch();
  const { className, mappedAuth, ...rest } = props;
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [clientData, setClientData] = useState([]);
  const [clientStaffData, setClientStaffData] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [editData, setEditData] = useState({});
  const [isInactiveModalOpen, setIsInactiveModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  let userID = '';
  if (mappedAuth && mappedAuth.user) {
    userID = mappedAuth.user._id;
  }

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        if (!isEmpty(mappedAuth) && mappedAuth.user) {
          const res = await getUserDetails(userID);
          setClientData(res.users[0].clients);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, [refresh, mappedAuth]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await getClientsApi();
        if (response.success === true) {
          setClientStaffData(response.clients);
        }
      } catch (error) {
        console.error(error);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [refresh]);

  const result = clientStaffData
    .filter((item) => clientData.map((item) => item._id).includes(item._id))
    .flatMap((item) => item.access_token || [])
    .map((token) => ({
      clientName: token && token.name ? token.name : undefined,
      createdAt: token && token.createdAt ? token.createdAt : undefined,
      expiresAt: token && token.expires ? token.expires : undefined,
      token: token && token.token ? token.token : undefined
    }));

  const handleTokenGeneration = async (res) => {
    try {
      if (!res.isActive) {
        setIsInactiveModalOpen(true);
        return;
      }

      setLoading((prevLoading) => ({ ...prevLoading, [res.client_id]: true }));
      const response = await generateTokenApi(res);
      dispatch(
        updateMainAlert({
          message: response.message,
          show: true,
          severity: 'success'
        })
      );
      setGenerated((prevGenerated) => ({ ...prevGenerated, [res.client_id]: true }));
      setRefresh(!refresh);
    } catch (error) {
      console.error(error);
      dispatch(
        updateMainAlert({
          message: 'Token generation failed',
          show: true,
          severity: 'error'
        })
      );
    } finally {
      setLoading((prevLoading) => ({ ...prevLoading, [res.client_id]: false }));
    }
  };

  // Using the result variable above, check if for the given client the token has been generated or not and display the appropriate button
  useEffect(() => {
    if (!isEmpty(clientData) && !isEmpty(clientStaffData)) {
      clientStaffData
        .filter((item) => clientData.map((item) => item._id).includes(item._id))
        .flatMap((item) => item.access_token || [])
        .forEach((token) => {
          setGenerated((prevGenerated) => ({ ...prevGenerated, [token.client_id]: true }));
        });
    }
  }, [clientData, clientStaffData]);

  // TODO: future implementation
  const handleDeleteToken = async (token) => {};

  // TODO: future implementation
  const handleDeleteClient = async (clientId) => {};

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpenEdit = () => {
    setOpenEdit(true);
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
  };

  return (
    <>
      {clientData.length === 0 && isLoading ? (
        <CircularProgress />
      ) : clientData.length === 0 ? (
        <Card>
          <CardHeader
            title="API Access"
            subheader="Register your application to get an API access token."
          />
          <Divider />
          <CardActions>
            <Button color="primary" variant="outlined" onClick={handleOpen}>
              Register Client
            </Button>
          </CardActions>
        </Card>
      ) : (
        <>
          <Card>
            <DataTable
              title="Registered Clients"
              onButtonClick={handleOpen}
              ButtonText="Add Client"
              refreshButton={true}
              onRefreshClick={() => setRefresh(!refresh)}
              columns={[
                {
                  id: 'name',
                  label: 'Client Name'
                },
                {
                  id: '_id',
                  label: 'Client ID'
                },
                {
                  id: 'ip_address',
                  label: 'Client IP Address'
                },
                {
                  id: 'isActive',
                  label: 'Client Status',
                  format: (value, rowData) => {
                    return (
                      <div>
                        {rowData.isActive === true ? (
                          <span
                            style={{
                              color: 'white',
                              padding: '6px',
                              borderRadius: '10px',
                              background: 'green'
                            }}>
                            Activated
                          </span>
                        ) : rowData.isActive === false ? (
                          <span
                            style={{
                              color: 'white',
                              padding: '6px',
                              borderRadius: '10px',
                              background: 'red'
                            }}>
                            Not Activated
                          </span>
                        ) : generated[rowData._id] ? (
                          <span
                            style={{
                              color: 'white',
                              padding: '6px',
                              borderRadius: '10px',
                              background: 'green'
                            }}>
                            Activated
                          </span>
                        ) : (
                          <span
                            style={{
                              color: 'white',
                              padding: '6px',
                              borderRadius: '10px',
                              background: 'red'
                            }}>
                            Not Activated
                          </span>
                        )}
                      </div>
                    );
                  }
                },
                {
                  id: 'createdAt',
                  label: 'Registered Date',
                  format: (value, rowData) => {
                    const date = new Date(rowData.createdAt);
                    return date.toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    });
                  }
                },
                {
                  id: 'generateToken',
                  label: 'Generate Token',
                  cellStyle: { textAlign: 'center' },
                  headerStyle: { textAlign: 'center' },
                  format: (value, rowData) => {
                    return (
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => {
                          let res = {
                            name: rowData.name,
                            client_id: rowData._id,
                            isActive: rowData.isActive ? rowData.isActive : false
                          };
                          if (generated[rowData._id]) {
                            dispatch(
                              updateMainAlert({
                                message: 'Token already generated',
                                show: true,
                                severity: 'info'
                              })
                            );
                            return;
                          } else {
                            handleTokenGeneration(res);
                            setSelectedClient(res);
                          }
                        }}>
                        {loading[rowData._id] ? (
                          <CircularProgress size={24} />
                        ) : generated[rowData._id] ? (
                          <CheckIcon />
                        ) : (
                          'Generate Token'
                        )}
                      </Button>
                    );
                  }
                },
                {
                  id: 'actions',
                  label: 'Actions',
                  format: (value, rowData) => {
                    return (
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => {
                          handleOpenEdit();
                          setEditData(rowData);
                        }}>
                        <EditIcon />
                      </Button>
                    );
                  }
                }
              ]}
              rows={clientData}
              loading={isLoading}
            />
          </Card>
          <br />
          <Card>
            <DataTable
              title="Access Tokens"
              columns={[
                {
                  id: 'clientName',
                  label: 'Client Name'
                },
                {
                  id: 'token',
                  label: 'Token'
                },
                {
                  id: 'createdAt',
                  label: 'Created Date',
                  format: (value, rowData) => {
                    const date = new Date(rowData.createdAt);
                    return date.toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    });
                  }
                },
                {
                  id: 'expiresAt',
                  label: 'Expires At',
                  format: (value, rowData) => {
                    const date = new Date(rowData.expiresAt);
                    return date.toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    });
                  }
                },
                {
                  id: 'copy',
                  label: 'Copy',
                  format: (value, rowData) => {
                    return (
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => {
                          navigator.clipboard.writeText(rowData.token);
                          dispatch(
                            updateMainAlert({
                              message: 'Token copied to clipboard',
                              show: true,
                              severity: 'success'
                            })
                          );
                        }}>
                        <FileCopyIcon />
                      </Button>
                    );
                  }
                }
              ]}
              rows={result}
              loading={isLoading}
            />
          </Card>
        </>
      )}
      <RegisterClient
        open={open}
        onClose={handleClose}
        data={mappedAuth}
        onRegister={() => setRefresh(!refresh)}
      />
      <EditClient
        open={openEdit}
        onClose={handleCloseEdit}
        data={editData}
        onEdit={() => setRefresh(!refresh)}
      />
      <InactiveClientModal
        open={isInactiveModalOpen}
        onClose={() => setIsInactiveModalOpen(false)}
        selectedClient={selectedClient}
      />
    </>
  );
};

GenerateToken.propTypes = {
  className: PropTypes.string,
  mappedAuth: PropTypes.object.isRequired,
  mappeduserState: PropTypes.object.isRequired
};

export default usersStateConnector(GenerateToken);
