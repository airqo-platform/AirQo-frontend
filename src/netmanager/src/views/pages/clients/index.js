import React, { useState, useEffect } from 'react';
import ErrorBoundary from '../../ErrorBoundary/ErrorBoundary';
import { makeStyles } from '@material-ui/styles';
import CustomMaterialTable from '../../components/Table/CustomMaterialTable';
import Alert from '@material-ui/lab/Alert';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton
} from '@material-ui/core';
import { activateUserClientApi, getClientsApi } from '../../apis/analytics';
import { Close as CloseIcon } from '@material-ui/icons';
import { updateMainAlert } from 'redux/MainAlert/operations';
import { useDispatch } from 'react-redux';
import { withPermission } from '../../containers/PageAccess';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1)
    }
  },
  statsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[1]
  },
  statsItem: {
    ...theme.typography.body1,
    color: theme.palette.text.primary,
    fontWeight: 600,
    fontSize: 16
  }
}));

const ConfirmDialog = ({ open, handleClose, handleConfirm, loading, title, content }) => {
  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <p>{content}</p>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleConfirm} color="primary" disabled={loading} variant="contained">
          {loading ? <CircularProgress size={24} /> : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Index = () => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [openActivate, setOpenActivate] = useState(false);
  const [openDeactivate, setOpenDeactivate] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [error, setError] = useState({
    type: '',
    message: ''
  });

  const activatedClients = data.filter((client) => client.isActive).length;
  const deactivatedClients = data.filter((client) => !client.isActive).length;

  useEffect(() => {
    setLoading(true);
    getClientsApi()
      .then((response) => {
        setData(response.clients);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
      });
  }, [refresh]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setError({ type: '', message: '' });
    }, 5000);
    return () => clearTimeout(timer);
  }, [error]);

  const handleActivate = () => {
    setIsLoading(true);
    const data = {
      _id: selectedClient._id,
      isActive: true
    };
    activateUserClientApi(data)
      .then((response) => {
        setRefresh(!refresh);
        dispatch(
          updateMainAlert({
            message: 'Client activated successfully',
            show: true,
            severity: 'success'
          })
        );
      })
      .catch((error) => {
        dispatch(
          updateMainAlert({
            message: 'Failed to activate client',
            show: true,
            severity: 'error'
          })
        );
      })
      .finally(() => {
        setIsLoading(false);
        setOpenActivate(false);
        setOpenDeactivate(false);
      });
  };

  const handleDeactivate = () => {
    setIsLoading(true);
    const data = {
      _id: selectedClient._id,
      isActive: false
    };
    activateUserClientApi(data)
      .then((response) => {
        setRefresh(!refresh);
        dispatch(
          updateMainAlert({
            message: 'Client deactivated successfully',
            show: true,
            severity: 'success'
          })
        );
      })
      .catch((error) => {
        dispatch(
          updateMainAlert({
            message: 'Failed to deactivate client',
            show: true,
            severity: 'error'
          })
        );
      })
      .finally(() => {
        setIsLoading(false);
        setOpenActivate(false);
        setOpenDeactivate(false);
      });
  };

  return (
    <ErrorBoundary>
      <div className={classes.root}>
        {/* Panel to show the number of activated clients and Deactivated clients from the data show on table as summary*/}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20
          }}>
          <div>
            <h3
              style={{
                fontSize: window.innerWidth < 600 ? '1.5rem' : '2rem'
              }}>
              Client Management
            </h3>
          </div>
          <div>
            <Button
              variant="contained"
              color="primary"
              style={{ marginRight: 10 }}
              onClick={() => setRefresh(!refresh)}>
              Refresh
            </Button>
          </div>
        </div>

        {/* statistics */}
        <div className={classes.statsContainer}>
          <h3 className={classes.statsItem}>Activated Clients: {activatedClients}</h3>
          <h3 className={classes.statsItem}>
            Not Activated Clients:
            {deactivatedClients}
          </h3>
        </div>

        <CustomMaterialTable
          title="Clients"
          columns={[
            { title: 'Client Name', field: 'name' },
            { title: 'Client ID', field: '_id' },
            { title: 'Client IP', field: 'ip_address' },
            {
              title: 'Status',
              field: 'status',
              render: (row) => (
                <div>
                  {row.isActive ? (
                    <div
                      style={{
                        color: 'white',
                        padding: '6px',
                        borderRadius: '10px',
                        background: 'green',
                        textAlign: 'center',
                        maxWidth: '130px'
                      }}>
                      Activated
                    </div>
                  ) : (
                    <div
                      style={{
                        color: 'white',
                        padding: '6px',
                        borderRadius: '10px',
                        background: 'red',
                        textAlign: 'center',
                        maxWidth: '130px'
                      }}>
                      Not Activated
                    </div>
                  )}
                </div>
              )
            },
            {
              field: 'actions',
              title: 'Actions',
              render: (row) => (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                  <div
                    style={{
                      margin: 2
                    }}>
                    <Button
                      disabled={row.isActive}
                      variant="contained"
                      size="small"
                      style={{
                        background: row.isActive ? 'grey' : 'green',
                        color: 'white'
                      }}
                      onClick={() => {
                        setOpenActivate(true);
                        setSelectedClient(row);
                      }}>
                      Activate
                    </Button>
                  </div>
                  <div
                    style={{
                      margin: 2
                    }}>
                    <Button
                      disabled={!row.isActive}
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => {
                        setOpenDeactivate(true);
                        setSelectedClient(row);
                      }}>
                      Deactivate
                    </Button>
                  </div>
                </div>
              )
            }
          ]}
          data={data}
          onRowClick={(event, row) => {
            event.preventDefault();
          }}
          isLoading={loading}
          options={{
            search: true,
            exportButton: false,
            searchFieldAlignment: 'right',
            showTitle: true,
            searchFieldStyle: {
              fontFamily: 'Open Sans'
            },
            headerStyle: {
              fontFamily: 'Open Sans',
              fontSize: 16,
              fontWeight: 600
            }
          }}
        />

        <ConfirmDialog
          open={openActivate}
          handleClose={() => setOpenActivate(false)}
          handleConfirm={handleActivate}
          loading={isLoading}
          title="Activate Client"
          content="Are you sure you want to activate this client?"
        />

        <ConfirmDialog
          open={openDeactivate}
          handleClose={() => setOpenDeactivate(false)}
          handleConfirm={handleDeactivate}
          loading={isLoading}
          title="Deactivate Client"
          content="Are you sure you want to deactivate this client?"
        />
      </div>
    </ErrorBoundary>
  );
};

export default withPermission(Index, 'CREATE_UPDATE_AND_DELETE_NETWORK_DEVICES');
