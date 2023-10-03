import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Paper,
  Typography
} from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/styles';
import Alert from '@material-ui/lab/Alert';
import Select from 'react-select';
import { isEmpty } from 'underscore';
import ErrorBoundary from '../../ErrorBoundary/ErrorBoundary';
import HorizontalLoader from '../HorizontalLoader/HorizontalLoader';
import { useHistory, useParams } from 'react-router-dom';
import { ArrowBackIosRounded } from '@material-ui/icons';
import {
  getTransactionDetails,
  getAllDeviceHosts,
  updateDeviceHost,
  sendMoneyToHost
} from 'views/apis/deviceRegistry';

import { useSitesSummaryData, useSitesData } from 'redux/SiteRegistry/selectors';
import { loadSitesSummary, loadSitesData } from 'redux/SiteRegistry/operations';
import { updateMainAlert } from 'redux/MainAlert/operations';
import DataTable from './Table';

const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork'));

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

const customStyles = {
  control: (base, state) => ({
    ...base,
    height: '50px',
    marginTop: '10px',
    marginBottom: '10px',
    borderColor: state.isFocused ? '#3f51b5' : '#9a9a9a',
    '&:hover': {
      borderColor: state.isFocused ? 'black' : 'black'
    },
    boxShadow: state.isFocused ? '0 0 1px 1px #3f51b5' : null
  }),
  option: (provided, state) => ({
    ...provided,
    borderBottom: '1px dotted pink',
    color: state.isSelected ? 'white' : 'blue',
    textAlign: 'left'
  }),
  input: (provided, state) => ({
    ...provided,
    height: '40px',
    borderColor: state.isFocused ? '#3f51b5' : 'black'
  }),
  placeholder: (provided, state) => ({
    ...provided,
    color: '#000'
  }),
  menu: (provided, state) => ({
    ...provided,
    zIndex: 9999
  })
};

const EditHost = ({ data, setLoading, onHostEdited }) => {
  const dispatch = useDispatch();
  const sites = useSitesSummaryData();
  const classes = useStyles();
  const [host, setHost] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    phone_number_2: '',
    phone_number_3: '',
    phone_number_4: '',
    site_id: null
  });
  const [errors, setErrors] = useState({
    first_name: false,
    last_name: false,
    phone_number: false,
    phone_number_2: false,
    phone_number_3: false,
    phone_number_4: false,
    site_id: false
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isChanged, setIsChanged] = useState(false);
  const hosts_id = data.map((item) => item._id);
  const [reset, setReset] = useState(false);

  useEffect(() => {
    if (data) {
      data.forEach((item) => {
        setHost({
          first_name: item.first_name,
          last_name: item.last_name,
          phone_number: item.phone_number,
          phone_number_2: item.phone_number_2,
          phone_number_3: item.phone_number_3,
          phone_number_4: item.phone_number_4,
          site_id: item.site_id
        });
      });
    }
  }, [data, reset]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setShowError(false);
        setErrorMessage('');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleHostChange = (prop) => (event) => {
    const updatedHost = { ...host, [prop]: event.target.value };
    setHost(updatedHost);
    setErrors({ ...errors, [prop]: '' });
    setIsChanged(true);
    setReset(false);
  };

  const handleEditHost = async () => {
    try {
      setLoading(true);

      const response = await updateDeviceHost(hosts_id, host);
      setLoading(false);
      if (response.success === true) {
        onHostEdited();
        dispatch(
          updateMainAlert({
            severity: 'success',
            message: response.message,
            show: true
          })
        );
        setIsChanged(false);
      } else {
        setErrorMessage(response.errors.message || 'An error occurred. Please try again.');
        setShowError(true);
        setIsChanged(false);
      }
    } catch (error) {
      console.log(error);
      setErrorMessage(error.message || 'An error occurred. Please try again.');
      setIsChanged(false);
      setShowError(true);
    }
  };

  const onChangeDropdown = (selectedOption, { name }) => {
    setSelectedOption(selectedOption);
    setHost({ ...host, [name]: selectedOption.value });
    setIsChanged(true);
    setReset(false);
  };

  useEffect(() => {
    if (isEmpty(sites)) {
      setLoading(true);
      if (!isEmpty(activeNetwork)) {
        dispatch(loadSitesSummary(activeNetwork.net_name));
      }
      setLoading(false);
    }
  }, []);

  return (
    <Paper
      style={{
        margin: '0 auto',
        padding: '20px 20px'
      }}>
      <Typography
        style={{
          margin: '0 0 20px 0',
          color: '#3f51b5',
          textTransform: 'uppercase',
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'flex-start'
        }}>
        Hosts Details
      </Typography>
      <form className={classes.modelWidth}>
        {showError && (
          <Alert style={{ marginBottom: 10 }} severity="error">
            {errorMessage}
          </Alert>
        )}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              autoFocus
              margin="dense"
              label="First Name"
              variant="outlined"
              value={host.first_name}
              onChange={handleHostChange('first_name')}
              fullWidth
              required
              error={!!errors.first_name}
              helperText={errors.first_name}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              margin="dense"
              label="Last Name"
              variant="outlined"
              value={host.last_name}
              onChange={handleHostChange('last_name')}
              required
              error={!!errors.last_name}
              helperText={errors.last_name}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              margin="dense"
              label="Primary Phone Number"
              variant="outlined"
              type="tel"
              value={host.phone_number}
              onChange={handleHostChange('phone_number')}
              required
              error={!!errors.phone_number}
              helperText={errors.phone_number}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              margin="dense"
              label="Phone Number 2"
              variant="outlined"
              type="tel"
              value={host.phone_number_2}
              onChange={handleHostChange('phone_number_2')}
              required
              error={!!errors.phone_number_2}
              helperText={errors.phone_number_2}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              margin="dense"
              label="Phone Number 3"
              variant="outlined"
              type="tel"
              value={host.phone_number_3}
              onChange={handleHostChange('phone_number_3')}
              required
              error={!!errors.phone_number_3}
              helperText={errors.phone_number_3}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              margin="dense"
              label="Phone Number 4"
              variant="outlined"
              type="tel"
              value={host.phone_number_4}
              onChange={handleHostChange('phone_number_4')}
              required
              error={!!errors.phone_number_4}
              helperText={errors.phone_number_4}
            />
          </Grid>
          <Grid item xs={12}>
            <Select
              label="Sites"
              name="site_id"
              isLoading={isEmpty(sites)}
              options={sites.map((site) => ({ value: site._id, label: site.name }))}
              value={
                selectedOption || {
                  value: host.site_id,
                  label: sites.find((site) => site._id === host.site_id)?.name || ''
                }
              }
              onChange={onChangeDropdown}
              styles={customStyles}
              isMulti={false}
              fullWidth
              menuPlacement="auto"
              menuPosition="fixed"
              placeholder="Select site"
              required
            />
          </Grid>
        </Grid>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              setReset(true);
              setIsChanged(false);
            }}
            style={{ marginRight: '8px' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!isChanged}
            onClick={handleEditHost}>
            Save Changes
          </Button>
        </div>
      </form>
    </Paper>
  );
};

const MobileMoney = ({ mobileMoneyDialog, setMobileMoneyDialog, data, setLoading, onSent }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [amount, setAmount] = useState(0);
  const [confirmation, setConfirmation] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [host_id, setHostId] = useState([]);

  useEffect(() => {
    if (data) {
      let newHostId = [];
      data.forEach((item) => {
        newHostId.push(item._id);
      });
      setHostId(newHostId);
    }
  }, [data]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setShowError(false);
        setErrorMessage('');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
  };

  const handleCloseDialog = () => {
    setMobileMoneyDialog(false);
    setConfirmation(false);
  };

  const handleMobileMoneyConfirmation = () => {
    if (amount >= 500) {
      setConfirmation(true);
      setMobileMoneyDialog(false);
    } else {
      setError('Please enter a valid amount. Minimum amount is UGX 500.');
    }
  };

  const handleMobileMoney = async () => {
    try {
      setDisabled(true);
      setLoading(true);
      const response = await sendMoneyToHost(host_id[0], amount);
      if (response.success === true) {
        handleCloseDialog();
        dispatch(
          updateMainAlert({
            severity: 'success',
            message: response.message,
            show: true
          })
        );
        onSent();
      } else {
        setError(response.errors?.message || 'An error occurred. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    } finally {
      setLoading(false);
      setDisabled(false);
    }
  };

  const setError = (message) => {
    setErrorMessage(message);
    setShowError(true);
  };

  return (
    <>
      <Dialog
        open={mobileMoneyDialog}
        onClose={handleCloseDialog}
        aria-labelledby="form-dialog-title"
        aria-describedby="form-dialog-description">
        <DialogTitle id="form-dialog-title" style={{ textTransform: 'uppercase' }}>
          Send Mobile Money
        </DialogTitle>
        <DialogContent>
          {showError && (
            <Alert style={{ marginBottom: 10 }} severity="error">
              {errorMessage}
            </Alert>
          )}
          <form className={classes.modelWidth}>
            <TextField
              autoFocus
              margin="dense"
              label="Amount"
              variant="outlined"
              value={amount}
              type="number"
              onChange={handleAmountChange}
              fullWidth
              required
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Grid container alignItems="flex-end" alignContent="flex-end" justify="flex-end">
            <Button variant="contained" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleMobileMoneyConfirmation}
              style={{ margin: '0 15px' }}>
              Next
            </Button>
          </Grid>
        </DialogActions>
      </Dialog>
      <Dialog
        open={confirmation}
        onClose={handleCloseDialog}
        aria-labelledby="form-dialog-title"
        aria-describedby="form-dialog-description">
        <DialogTitle id="form-dialog-title" style={{ textTransform: 'uppercase' }}>
          Confirmation
        </DialogTitle>
        <DialogContent>
          {showError && (
            <Alert style={{ marginBottom: 10 }} severity="error">
              {errorMessage}
            </Alert>
          )}
          <form className={classes.modelWidth}>
            {data.map((item) => (
              <div
                key={item._id}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'left' }}>
                <span className={classes.confirm_field}>
                  <span className={classes.confirm_field_title}>Recipient:</span>
                  {item.first_name} {item.last_name}
                </span>
                <span className={classes.confirm_field}>
                  <span className={classes.confirm_field_title}>Primary Phone Number:</span>+
                  {item.phone_number}
                </span>
                <span className={classes.confirm_field}>
                  <span className={classes.confirm_field_title}>Amount:</span>UGX {amount}
                </span>
              </div>
            ))}
          </form>
        </DialogContent>
        <DialogActions>
          <Grid container alignItems="flex-end" alignContent="flex-end" justify="flex-end">
            <Button
              variant="contained"
              disabled={disabled}
              onClick={() => {
                setConfirmation(false);
                setMobileMoneyDialog(true);
              }}>
              Edit
            </Button>
            <Button
              disabled={disabled}
              variant="contained"
              color="primary"
              onClick={handleMobileMoney}
              style={{ margin: '0 15px' }}>
              Send
            </Button>
          </Grid>
        </DialogActions>
      </Dialog>
    </>
  );
};

const HostView = () => {
  let params = useParams();
  const dispatch = useDispatch();
  const history = useHistory();
  const classes = useStyles();
  const sites = useSitesData();
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mobileMoneyDialog, setMobileMoneyDialog] = useState(false);
  const [refreshData, setRefreshData] = useState(false);
  const [transactions, setTransactions] = useState([]);

  const filteredData = [];
  Object.values(sites).map((site) => {
    hosts.forEach((host) => {
      if (host.site_id === site._id) {
        site.devices.forEach((device) => {
          filteredData.push({
            siteId: host.site_id,
            deviceId: device._id,
            deviceName: device.name,
            deviceStatus: device.status,
            createdAt: device.createdAt
          });
        });
      }
    });
  });

  useEffect(() => {
    const getTransactions = async () => {
      try {
        const response = await getTransactionDetails(params.id);
        const { transaction } = response;
        const hostsData = transaction.map((transaction) => {
          const host = hosts.find((host) => transaction.host_id === host._id);
          return {
            ...transaction,
            hostFirstName: host?.first_name || '',
            hostLastName: host?.last_name || ''
          };
        });
        setTransactions(hostsData);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };
    getTransactions();
  }, [hosts]);

  useEffect(() => {
    const getHosts = async () => {
      try {
        const response = await getAllDeviceHosts();
        const { hosts } = response;
        let hostsData = [];
        hosts.forEach((host) => {
          if (host._id === params.id) {
            hostsData.push(host);
          }
        });
        setHosts(hostsData);
      } catch (error) {
        console.log(error);
      }
    };
    getHosts();
  }, [refreshData]);

  useEffect(() => {
    if (isEmpty(sites)) {
      if (!isEmpty(activeNetwork)) {
        dispatch(loadSitesData(activeNetwork.net_name));
      }
    }
  }, []);

  return (
    <ErrorBoundary>
      <HorizontalLoader loading={loading} />
      <div className={classes.root}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20
          }}>
          <ArrowBackIosRounded
            style={{ color: '#3f51b5', cursor: 'pointer' }}
            onClick={() => history.push('/hosts')}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              const isDeployed = filteredData.some((item) => item.deviceStatus === 'deployed');
              if (isDeployed) {
                setMobileMoneyDialog(true);
              } else {
                dispatch(
                  updateMainAlert({
                    severity: 'error',
                    message: 'No deployed devices for this host.',
                    show: true
                  })
                );
              }
            }}>
            Send Money
          </Button>
        </div>

        <EditHost
          setLoading={setLoading}
          data={hosts}
          onHostEdited={() => setRefreshData(!refreshData)}
        />

        <br />
        <DataTable
          title="Host Transaction Details"
          columns={[
            {
              id: 'hostName',
              label: 'Host Name',
              format: (value, row) => `${row.hostFirstName} ${row.hostLastName}`
            },
            {
              id: 'amount',
              label: 'Amount',
              format: (value, row) => `UGX ${row.amount}`
            },
            {
              id: 'createdAt',
              label: 'Date',
              format: (value) => {
                const date = new Date(value);
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                return date.toLocaleDateString('en-US', options);
              }
            }
          ]}
          rows={transactions}
          loading={isLoading}
        />

        <br />
        <DataTable
          title="Host Device Details"
          onRowClick={(rowData) => {
            return history.push(`/device/${rowData.deviceName}/overview`);
          }}
          columns={[
            {
              id: 'deviceName',
              label: 'Device Name'
            },
            {
              id: 'siteId',
              label: 'Site ID'
            },
            {
              id: 'deviceStatus',
              label: 'Device Status',
              format: (value, row) => (
                <span style={{ color: row.deviceStatus === 'deployed' ? 'green' : 'red' }}>
                  {row.deviceStatus}
                </span>
              )
            },
            {
              id: 'createdAt',
              label: 'Registered Date',
              format: (value) => {
                const date = new Date(value);
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                return date.toLocaleDateString('en-US', options);
              }
            }
          ]}
          rows={filteredData}
          loading={isLoading}
        />

        <MobileMoney
          mobileMoneyDialog={mobileMoneyDialog}
          setMobileMoneyDialog={setMobileMoneyDialog}
          setLoading={setLoading}
          data={hosts}
          onSent={() => setRefreshData(!refreshData)}
        />
      </div>
    </ErrorBoundary>
  );
};

export default HostView;
