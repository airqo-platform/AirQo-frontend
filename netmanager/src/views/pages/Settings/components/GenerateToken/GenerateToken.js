import React, { useState, useEffect } from 'react';
import Alert from '@material-ui/lab/Alert';
import { CircularLoader } from 'views/components/Loader/CircularLoader';
import PropTypes from 'prop-types';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import DeleteIcon from '@material-ui/icons/DeleteOutlineOutlined';
import usersStateConnector from 'views/stateConnectors/usersStateConnector';
import { makeStyles } from '@material-ui/core/styles';
import { createClientApi, getClientsApi, generateTokenApi } from '../../../../apis/analytics';
import { useDispatch } from 'react-redux';
import { updateMainAlert } from 'redux/MainAlert/operations';
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
import { getUserDetails } from '../../../../../redux/Join/actions';
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

const RegisterClient = (props) => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const { open, onClose, data, onRegister } = props;
  const [clientName, setClientName] = useState('');
  const [clientNameError, setClientNameError] = useState(false);
  const userID = data.user._id;

  const handleSubmit = async () => {
    if (!clientName) {
      setClientNameError(true);
      return;
    }
    try {
      const data = {
        name: clientName,
        user_id: userID
      };
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
      } else {
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
      dispatch(
        updateMainAlert({
          message: 'Client registration failed',
          show: true,
          severity: 'error'
        })
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle className={classes.DialogTitle}>Register Client</DialogTitle>
      <DialogContent className={classes.DialogContent}>
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
      </DialogContent>
      <DialogActions className={classes.DialogActions}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          color="primary"
          variant="contained"
          onClick={handleSubmit}
          className={classes.DialogButton}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const GenerateToken = (props) => {
  const dispatch = useDispatch();
  const { className, mappedAuth, ...rest } = props;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [clientData, setClientData] = useState([]);
  const [clientStaffData, setClientStaffData] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [generated, setGenerated] = useState(false);
  const userID = mappedAuth?.user?._id;

  useEffect(() => {
    if (!isEmpty(mappedAuth?.user)) {
      getUserDetails(userID).then((res) => {
        setClientData(res.users[0].clients);
      });
    }
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
      clientName: token?.name,
      createdAt: token?.createdAt,
      expiresAt: token?.expires,
      token: token?.token
    }));

  const handleTokenGeneration = async (res) => {
    try {
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

  // future implementation
  const handleDeleteToken = async (token) => {};

  // future implementation
  const handleDeleteClient = async (clientId) => {};

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      {clientData.length === 0 ? (
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
                            client_id: rowData._id
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
                }
                // {
                //   id: 'actions',
                //   label: 'Actions',
                //   format: (value, rowData) => {
                //     return (
                //       <Button variant="outlined" color="primary" onClick={() => {}}>
                //         <DeleteIcon />
                //       </Button>
                //     );
                //   }
                // }
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
                // {
                //   id: 'delete',
                //   label: 'Delete',
                //   format: (value, rowData) => {
                //     return (
                //       <Button
                //         variant="outlined"
                //         color="primary"
                //         onClick={() => {
                //           handleDeleteToken(rowData._id);
                //         }}>
                //         <DeleteIcon />
                //       </Button>
                //     );
                //   }
                // }
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
    </>
  );
};

GenerateToken.propTypes = {
  className: PropTypes.string,
  mappedAuth: PropTypes.object.isRequired,
  mappeduserState: PropTypes.object.isRequired
};

export default usersStateConnector(GenerateToken);
