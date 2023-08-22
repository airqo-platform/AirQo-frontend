import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/styles';
import EditIcon from '@material-ui/icons/EditOutlined';
import Alert from '@material-ui/lab/Alert';
import Select from 'react-select';
import { get, isEmpty } from 'underscore';

import ErrorBoundary from '../../../ErrorBoundary/ErrorBoundary';
import CustomMaterialTable from 'views/components/Table/CustomMaterialTable';
import HorizontalLoader from '../../HorizontalLoader/HorizontalLoader';

import {
  getTransactionDetails,
  getAllDeviceHosts,
  updateDeviceHost,
  sendMoneyToHost
} from 'views/apis/deviceRegistry';

import { useSitesSummaryData } from 'redux/SiteRegistry/selectors';
import { loadSitesSummary } from 'redux/SiteRegistry/operations';
import { updateMainAlert } from 'redux/MainAlert/operations';

const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork'));

const useStyles = makeStyles((theme) => ({
  root: {
    padding: '10px 20px'
  },
  modelWidth: {
    minWidth: 450
  },
  actionButtonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  confirm_con: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'left',
    flexDirection: 'column',
    padding: '20px'
  },
  confirm_field: {
    margin: '10px 0',
    fontSize: '16px'
  },
  confirm_field_title: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#000000',
    marginRight: '20px'
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

const EditHostDialog = ({ editHostDialog, setEditHostDialog, data, setLoading, onHostEdited }) => {
  const dispatch = useDispatch();
  const sites = useSitesSummaryData();
  const classes = useStyles();
  const [host, setHost] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    email: '',
    site_id: null
  });
  const [errors, setErrors] = useState({
    first_name: false,
    last_name: false,
    phone_number: false,
    email: false,
    site_id: false
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    if (data) {
      setHost({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone_number: data.phone_number || '',
        email: data.email || '',
        site_id: data.site_id || null
      });
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

  const handleHostChange = (prop) => (event) => {
    const updatedHost = { ...host, [prop]: event.target.value };
    setHost(updatedHost);
    setErrors({ ...errors, [prop]: '' });
  };

  const handleCloseDialog = () => {
    setEditHostDialog(false);
  };

  const handleEditHost = async () => {
    try {
      setLoading(true);

      const newErrors = {};
      if (!host.first_name) newErrors.first_name = 'First Name is required.';
      if (!host.last_name) newErrors.last_name = 'Last Name is required.';
      if (!host.phone_number) newErrors.phone_number = 'Phone Number is required.';
      if (!host.email) newErrors.email = 'Email Address is required.';
      if (!host.site_id) newErrors.site_id = 'Site is required.';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setLoading(false);
        return;
      }

      const response = await updateDeviceHost(data._id, host);
      setLoading(false);
      if (response.success === true) {
        handleCloseDialog();
        onHostEdited();
        dispatch(
          updateMainAlert({
            severity: 'success',
            message: response.message,
            show: true
          })
        );
      } else {
        setErrorMessage(response.errors.message || 'An error occurred. Please try again.');
        setShowError(true);
      }
    } catch (error) {
      console.log(error);
      setErrorMessage(error.message || 'An error occurred. Please try again.');
      setShowError(true);
    }
  };

  const onChangeDropdown = (selectedOption, { name }) => {
    setSelectedOption(selectedOption);
    setHost({ ...host, [name]: selectedOption.value });
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
    <Dialog
      open={editHostDialog}
      onClose={handleCloseDialog}
      aria-labelledby="form-dialog-title"
      aria-describedby="form-dialog-description">
      <DialogTitle id="form-dialog-title" style={{ textTransform: 'uppercase' }}>
        Edit host
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
            label="First Name"
            variant="outlined"
            value={host.first_name}
            onChange={handleHostChange('first_name')}
            fullWidth
            required
            error={!!errors.first_name}
            helperText={errors.first_name}
          />

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

          <TextField
            fullWidth
            margin="dense"
            label="Phone Number"
            variant="outlined"
            type="tel"
            value={host.phone_number}
            onChange={handleHostChange('phone_number')}
            required
            error={!!errors.phone_number}
            helperText={errors.phone_number}
          />

          <TextField
            fullWidth
            margin="dense"
            label="Email Address"
            variant="outlined"
            type="email"
            value={host.email}
            onChange={handleHostChange('email')}
            required
            error={!!errors.email}
            helperText={errors.email}
          />

          <Select
            label="Sites"
            name="site_id"
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
            placeholder="Select site"
          />
        </form>
      </DialogContent>

      <DialogActions>
        <Grid container alignItems="flex-end" alignContent="flex-end" justify="flex-end">
          <Button variant="contained" type="button" onClick={handleCloseDialog}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            onClick={handleEditHost}
            style={{ margin: '0 15px' }}>
            Edit Host
          </Button>
        </Grid>
        <br />
      </DialogActions>
    </Dialog>
  );
};

const MobileMoneyDialog = ({ mobileMoneyDialog, setMobileMoneyDialog, data, setLoading }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [amount, setAmount] = useState(0);
  const [confirmation, setConfirmation] = useState(false);
  const [mobileMoney, setMobileMoney] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    setMobileMoney({
      firstName: data.first_name,
      lastName: data.last_name,
      phoneNumber: data.phone_number
    });
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
      setLoading(true);
      const response = await sendMoneyToHost(data?._id, amount);
      setLoading(false);
      if (response.success === true) {
        handleCloseDialog();
        dispatch(
          updateMainAlert({
            severity: 'success',
            message: response.message,
            show: true
          })
        );
      } else {
        setError(response.errors?.message || 'An error occurred. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      setLoading(false);
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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'left' }}>
              <span className={classes.confirm_field}>
                <span className={classes.confirm_field_title}>Recipient:</span>
                {mobileMoney.firstName} {mobileMoney.lastName}
              </span>
              <span className={classes.confirm_field}>
                <span className={classes.confirm_field_title}>Phone Number:</span>+
                {mobileMoney.phoneNumber}
              </span>
              <span className={classes.confirm_field}>
                <span className={classes.confirm_field_title}>Amount:</span> UGX {amount}
              </span>
            </div>
          </form>
        </DialogContent>
        <DialogActions>
          <Grid container alignItems="flex-end" alignContent="flex-end" justify="flex-end">
            <Button
              variant="contained"
              onClick={() => {
                setConfirmation(false);
                setMobileMoneyDialog(true);
              }}>
              Edit
            </Button>
            <Button
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

const DeviceHosts = ({ deviceData }) => {
  const dispatch = useDispatch();
  const sites = useSitesSummaryData();
  const classes = useStyles();
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editHostDialog, setEditHostDialog] = useState(false);
  const [mobileMoneyDialog, setMobileMoneyDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState([]);
  const [refreshData, setRefreshData] = useState(false);
  const [transactions, setTransactions] = useState([]);

  const matchingHosts = hosts.filter((host) => host.site_id === deviceData?.site?._id);
  const hostsIds = matchingHosts.map((host) => host._id);

  const getTransactions = async () => {
    try {
      const response = await getTransactionDetails(hostsIds);
      setTransactions(response);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const getHosts = async () => {
    try {
      setIsLoading(true);
      const response = await getAllDeviceHosts();
      const { hosts } = response;
      setHosts(hosts);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isEmpty(sites)) {
      setLoading(true);
      if (!isEmpty(activeNetwork)) {
        dispatch(loadSitesSummary(activeNetwork.net_name));
      }
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    getHosts();
    getTransactions();
  }, [refreshData]);

  return (
    <ErrorBoundary>
      <HorizontalLoader loading={loading} />
      <div className={classes.root}>
        <h5
          style={{
            margin: '0 0 20px 0',
            width: '100%',
            textAlign: 'center',
            color: '#3f51b5',
            textTransform: 'uppercase',
            fontWeight: 'bold'
          }}>
          Hosts Details
        </h5>
        <div className={classes.actionButtonContainer}>
          <Table style={{ backgroundColor: 'white', boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.2)' }}>
            <TableHead style={{ backgroundColor: 'white' }}>
              <TableRow>
                <TableCell style={{ padding: '10px' }}>Host Name</TableCell>
                <TableCell style={{ padding: '10px' }}>Phone Number</TableCell>
                <TableCell style={{ padding: '10px' }}>Email Address</TableCell>
                <TableCell style={{ padding: '10px' }}>Edit</TableCell>
                <TableCell style={{ padding: '10px' }}>Mobile Money</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {matchingHosts.length > 0 ? (
                matchingHosts.map((host) => (
                  <TableRow key={host._id}>
                    <TableCell style={{ padding: '10px' }}>
                      {host.first_name} {host.last_name}
                    </TableCell>
                    <TableCell style={{ padding: '10px' }}>{host.phone_number}</TableCell>
                    <TableCell style={{ padding: '10px' }}>{host.email}</TableCell>
                    <TableCell style={{ padding: '10px' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          setSelectedItem(host);
                          setEditHostDialog(true);
                        }}>
                        <EditIcon />
                      </Button>
                    </TableCell>
                    <TableCell style={{ padding: '10px' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          setSelectedItem(host);
                          setMobileMoneyDialog(true);
                        }}>
                        Send
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No hosts found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <br />
        <CustomMaterialTable
          pointerCursor
          title="Host transactions"
          userPreferencePaginationKey={'hosts'}
          columns={[
            {
              title: 'Host Name',
              render: (rowData) => `${rowData.first_name} ${rowData.last_name}`,
              customSort: (a, b) => a.first_name.localeCompare(b.first_name),
              cellStyle: {
                width: '40%',
                minWidth: '40%'
              }
            },
            {
              title: 'Phone Number',
              field: 'phoneNumber',
              render: (rowData) => `${rowData.phone_number}`
            },
            {
              title: 'Amount Sent',
              field: 'amount',
              render: (rowData) => `${rowData.amount}`
            },
            {
              title: 'Date',
              field: 'date',
              render: (rowData) => `${rowData.date}`
            }
          ]}
          data={transactions}
          isLoading={isLoading}
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
              fontSize: 14,
              fontWeight: 600
            }
          }}
        />

        <MobileMoneyDialog
          mobileMoneyDialog={mobileMoneyDialog}
          setMobileMoneyDialog={setMobileMoneyDialog}
          setLoading={setLoading}
          data={selectedItem}
        />

        <EditHostDialog
          editHostDialog={editHostDialog}
          setEditHostDialog={setEditHostDialog}
          setLoading={setLoading}
          data={selectedItem}
          deviceData={deviceData}
          onHostEdited={() => setRefreshData(!refreshData)}
        />
      </div>
    </ErrorBoundary>
  );
};

export default DeviceHosts;
