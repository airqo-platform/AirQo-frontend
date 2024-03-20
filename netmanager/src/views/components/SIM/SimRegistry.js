import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid
} from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { isEmpty } from 'underscore';
import Alert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/styles';
import CustomMaterialTable from '../Table/CustomMaterialTable';
import { updateMainAlert } from 'redux/MainAlert/operations';
import Select from 'react-select';
import RemoveIcon from '@material-ui/icons/Remove';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import Tooltip from '@material-ui/core/Tooltip';
import CloseIcon from '@material-ui/icons/Close';
import { getSimsApi, createSimApi, checkSimStatusApi } from '../../apis/accessControl';
import DeleteIcon from '@material-ui/icons/Delete';
import RefreshIcon from '@material-ui/icons/Refresh';
import { withPermission } from '../../containers/PageAccess';
import { setLoading as loadStatus } from 'redux/HorizontalLoader/index';
import UsersListBreadCrumb from '../../pages/UserList/components/Breadcrumb';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1)
    }
  },
  modelWidth: {
    minWidth: 450,
    [theme.breakpoints.down('sm')]: {
      minWidth: '100%'
    }
  },
  actionButtonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: theme.spacing(2)
  },
  confirm_con: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'left',
    flexDirection: 'column',
    padding: theme.spacing(2)
  },
  confirm_field: {
    margin: theme.spacing(1, 0),
    fontSize: '16px'
  },
  confirm_field_title: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#000000',
    marginRight: theme.spacing(2)
  }
}));

const RegisterSim = ({ setCreateSimDialog, CreateSimDialog, setIsLoading, setRefresh }) => {
  const dispatch = useDispatch();
  const classes = useStyles();

  const [sim, setSim] = useState({
    msisdn: ''
  });

  const [errors, setErrors] = useState({
    msisdn: '',
    showError: false,
    errorMessage: ''
  });

  const handleClose = () => {
    setCreateSimDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setSim({
      msisdn: ''
    });

    setErrors({
      msisdn: '',
      showError: false,
      errorMessage: ''
    });
  };

  const handleChange = (name) => (event) => {
    setSim({ ...sim, [name]: event.target.value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleRegisterSim = () => {
    if (!sim.msisdn) {
      setErrors({
        msisdn: 'MSISDN is required',
        showError: true,
        errorMessage: 'MSISDN is required'
      });
    } else {
      setIsLoading(true);
      dispatch(loadStatus(true));
      createSimApi(sim)
        .then((res) => {
          setIsLoading(false);
          dispatch(loadStatus(false));
          if (res.success) {
            setCreateSimDialog(false);
            resetForm();
            setRefresh(true);
          } else {
            setErrors({
              msisdn: res.data.message,
              showError: true,
              errorMessage: res.data.message
            });
          }
        })
        .catch((err) => {
          setIsLoading(false);
          dispatch(loadStatus(false));
          setErrors({
            msisdn: err.message,
            showError: true,
            errorMessage: err.message
          });
        });
    }
  };

  return (
    <Dialog
      open={CreateSimDialog}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
      aria-describedby="form-dialog-description"
      className={classes.modelWidth}>
      <DialogTitle id="form-dialog-title" style={{ textTransform: 'uppercase' }}>
        Register New SIM
      </DialogTitle>
      <DialogContent style={{ maxHeight: 'auto' }}>
        {errors.showError && (
          <Alert
            style={{ marginBottom: 10 }}
            severity="error"
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  setErrors({ ...errors, showError: false });
                }}>
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }>
            {errors.errorMessage}
          </Alert>
        )}

        <TextField
          fullWidth
          margin="dense"
          label="MSISDN"
          variant="outlined"
          value={sim.msisdn}
          onChange={handleChange('msisdn')}
          required
          error={!!errors.msisdn}
          helperText={errors.msisdn}
        />
      </DialogContent>
      <DialogActions>
        <Grid container alignItems="flex-end" alignContent="flex-end" justify="flex-end">
          <Button variant="contained" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            onClick={handleRegisterSim}
            style={{ margin: '0 15px' }}>
            Register SIM
          </Button>
        </Grid>
        <br />
      </DialogActions>
    </Dialog>
  );
};

const SimRegistry = () => {
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [CreateSimDialog, setCreateSimDialog] = useState(false);
  const [simData, setSimData] = useState([]);
  const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork'));

  useEffect(() => {
    setLoading(true);
    getSimsApi()
      .then((res) => {
        setLoading(false);
        if (res.success) {
          setSimData(res.sims);
        } else {
          dispatch(updateMainAlert({ message: res.message, show: true, severity: 'error' }));
        }
      })
      .catch((err) => {
        setLoading(false);
      });
  }, [refresh]);

  const checkSimStatus = async (id) => {
    setIsLoading(true);
    dispatch(loadStatus(true));
    try {
      const res = await checkSimStatusApi(id);
      setIsLoading(false);
      dispatch(loadStatus(false));
      if (res.success) {
        dispatch(updateMainAlert({ message: res.message, show: true, severity: 'success' }));
        setRefresh(true);
      } else {
        dispatch(updateMainAlert({ message: res.message, show: true, severity: 'error' }));
      }
    } catch (err) {
      setIsLoading(false);
      dispatch(loadStatus(false));
      dispatch(updateMainAlert({ message: err.message, show: true, severity: 'error' }));
    }
  };

  const handleDelete = (id) => {};

  return (
    <>
      <div className={classes.root}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            marginBottom: 20
          }}>
          <Button variant="contained" color="primary" onClick={() => setCreateSimDialog(true)}>
            Register SIM
          </Button>
        </div>
        <UsersListBreadCrumb
          category="SIM Registry"
          usersTable={`${activeNetwork.net_name === 'airqo' ? 'AirQo' : activeNetwork.net_name}`}
        />

        <CustomMaterialTable
          pointerCursor
          userPreferencePaginationKey={'SIM'}
          isLoading={loading}
          title="SIM Registry"
          columns={[
            {
              field: 'name',
              title: 'Name',
              render: (row) => (row.name ? row.name : '')
            },
            {
              field: 'status',
              title: 'Status',
              render: (row) =>
                row.status ? (
                  <span style={{ color: row.status === 'active' ? 'green' : 'red' }}>
                    {row.status}
                  </span>
                ) : (
                  ''
                )
            },
            {
              field: 'plan',
              title: 'Plan',
              render: (row) => (row.plan ? row.plan : '')
            },
            {
              field: 'msisdn',
              title: 'MSISDN',
              render: (row) => (row.msisdn ? row.msisdn : '')
            },
            {
              field: 'activationDate',
              title: 'Activation Date',
              render: (row) =>
                row.activationDate
                  ? new Date(row.activationDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : ''
            },
            {
              field: 'balance',
              title: 'Balance',
              render: (row) => (row.balance ? row.balance : '')
            },
            {
              field: 'action',
              title: 'Actions',
              render: (row) => (
                <div style={{ display: 'flex' }}>
                  <Tooltip title="Delete" placement="bottom" arrow>
                    <IconButton onClick={() => handleDelete(row._id)} disabled>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip
                    title="Refresh"
                    placement="bottom"
                    arrow
                    style={{
                      marginLeft: 10
                    }}>
                    <IconButton onClick={() => checkSimStatus(row._id)}>
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                </div>
              )
            }
          ]}
          onRowClick={(event, row) => {
            return;
          }}
          data={simData}
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

        <RegisterSim
          setCreateSimDialog={setCreateSimDialog}
          CreateSimDialog={CreateSimDialog}
          setIsLoading={setIsLoading}
          setRefresh={setRefresh}
        />
      </div>
    </>
  );
};

export default withPermission(SimRegistry, 'CREATE_UPDATE_AND_DELETE_NETWORK_SITES');
