import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Tooltip
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import EditIcon from '@material-ui/icons/EditOutlined';
import SendIcon from '@material-ui/icons/Send';
import { makeStyles } from '@material-ui/styles';
import ErrorBoundary from '../../../ErrorBoundary/ErrorBoundary';
import CustomMaterialTable from 'views/components/Table/CustomMaterialTable';
import HorizontalLoader from '../../HorizontalLoader/HorizontalLoader';
import {
  getAllDeviceHosts,
  createDeviceHost,
  updateDeviceHost,
  sendMoneyToHost
} from 'views/apis/deviceRegistry';

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

const hostColumns = (setEditHostDialog, setMobileMoneyDialog, setSelectedItem) => [
  {
    title: 'Name',
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
    title: 'Email Address',
    field: 'emailAddress',
    render: (rowData) => `${rowData.email}`
  },
  {
    title: 'Actions',
    cellStyle: {
      width: '30%',
      minWidth: '30%'
    },
    render: (rowData) => (
      <div>
        <Tooltip title="Send Mobile money">
          <SendIcon
            className={'hover-blue'}
            style={{ margin: '0 5px', cursor: 'pointer' }}
            onClick={(event) => {
              event.preventDefault();
              setSelectedItem(rowData);
              setMobileMoneyDialog(true);
            }}
          />
        </Tooltip>
        <Tooltip title="Edit">
          <EditIcon
            className={'hover-blue'}
            style={{ margin: '0 5px', cursor: 'pointer' }}
            onClick={(event) => {
              event.preventDefault();
              setSelectedItem(rowData);
              setEditHostDialog(true);
            }}
          />
        </Tooltip>
      </div>
    )
  }
];

const AddHostDialog = ({
  addHostDialog,
  setAddHostDialog,
  deviceData,
  setLoading,
  onHostAdded,
  setSuccessMessage,
  setShowSuccess
}) => {
  const classes = useStyles();
  const hostInitialState = {
    first_name: '',
    last_name: '',
    phone_number: '',
    email: '',
    site_id: deviceData?.site?._id
  };
  const [errors, setErrors] = useState({
    first_name: false,
    last_name: false,
    phone_number: false,
    email: false
  });

  const [host, setHost] = useState(hostInitialState);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setShowError(false);
        setErrorMessage('');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleCloseDialog = () => {
    setAddHostDialog(false);
    setHost(hostInitialState);
  };

  const handleHostChange = (prop) => (event) => {
    setHost({ ...host, [prop]: event.target.value });
    setErrors({ ...errors, [prop]: '' });
  };

  const handleAddHost = async () => {
    try {
      setLoading(true);

      const newErrors = {};
      if (!host.first_name) newErrors.first_name = 'First Name is required.';
      if (!host.last_name) newErrors.last_name = 'Last Name is required.';
      if (!host.phone_number) newErrors.phone_number = 'Phone Number is required.';
      if (!host.email) newErrors.email = 'Email Address is required.';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setLoading(false);
        return;
      }

      const response = await createDeviceHost(host);
      setLoading(false);
      if (response.success === true) {
        handleCloseDialog();
        onHostAdded();
        setShowSuccess(true);
        setSuccessMessage('Host added successfully.');
      } else {
        setErrorMessage(response.errors.message || 'An error occurred. Please try again.');
        setShowError(true);
      }
    } catch (error) {
      console.log(error);
      setErrorMessage('An error occurred. Please try again.');
      setShowError(true);
    }
  };

  return (
    <Dialog
      open={addHostDialog}
      onClose={handleCloseDialog}
      aria-labelledby="form-dialog-title"
      aria-describedby="form-dialog-description">
      <DialogTitle id="form-dialog-title" style={{ textTransform: 'uppercase' }}>
        Add a new host
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
            placeholder='e.g. "+256xxxxxxxxx"'
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
            onClick={handleAddHost}
            style={{ margin: '0 15px' }}>
            Add Host
          </Button>
        </Grid>
        <br />
      </DialogActions>
    </Dialog>
  );
};

const EditHostDialog = ({
  editHostDialog,
  setEditHostDialog,
  data,
  deviceData,
  setLoading,
  onHostEdited,
  setSuccessMessage,
  setShowSuccess
}) => {
  const classes = useStyles();
  const [host, setHost] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    email: '',
    site_id: deviceData?.site?._id
  });
  const [errors, setErrors] = useState({
    first_name: false,
    last_name: false,
    phone_number: false,
    email: false
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const hostID = data?._id;

  useEffect(() => {
    if (data) {
      setHost({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone_number: data.phone_number || '',
        email: data.email || '',
        site_id: deviceData?.site?._id
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

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setLoading(false);
        return;
      }

      const response = await updateDeviceHost(hostID, host);
      setLoading(false);
      if (response.success === true) {
        handleCloseDialog();
        onHostEdited();
        setShowSuccess(true);
        setSuccessMessage('Host updated successfully.');
      } else {
        setErrorMessage(response.errors.message || 'An error occurred. Please try again.');
        setShowError(true);
      }
    } catch (error) {
      console.log(error);
      setErrorMessage('An error occurred. Please try again.');
      setShowError(true);
    }
  };

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
            value={'+' + host.phone_number}
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

const MobileMoneyDialog = ({
  mobileMoneyDialog,
  setMobileMoneyDialog,
  data,
  setLoading,
  setSuccessMessage,
  setShowSuccess
}) => {
  const classes = useStyles();
  const [amount, setAmount] = useState({
    amount: 0
  });
  const [confirmation, setConfirmation] = useState(false);
  const mobileMoneyInitialState = {
    firstName: '',
    lastName: '',
    phoneNumber: ''
  };
  const [mobileMoney, setMobileMoney] = useState(mobileMoneyInitialState);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const hostID = data?._id;

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

  const handleAmountChange = (prop) => (event) => {
    setAmount({ ...amount, [prop]: event.target.value });
  };

  const handleCloseDialog = () => {
    setMobileMoneyDialog(false);
    setConfirmation(false);
  };

  const handleMobileMoneyConfirmation = () => {
    if (amount.amount > 500) {
      setConfirmation(true);
      setMobileMoneyDialog(false);
    } else {
      setErrorMessage('Please enter a valid amount. Minimum amount is UGX 500.');
      setShowError(true);
    }
  };

  const handleMobileMoney = async () => {
    try {
      setLoading(true);
      const response = await sendMoneyToHost(hostID, amount);
      setLoading(false);
      console.log(response);
      if (response.success === true) {
        handleCloseDialog();
        setShowSuccess(true);
        setSuccessMessage('Mobile money sent successfully.');
      } else {
        setErrorMessage(response.errors.message || 'An error occurred. Please try again.');
        setShowError(true);
      }
    } catch (error) {
      console.log(error);
      setErrorMessage('An error occurred. Please try again.');
      setShowError(true);
    }
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
              value={amount.amount}
              type="number"
              onChange={handleAmountChange('amount')}
              fullWidth
              required
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
              onClick={handleMobileMoneyConfirmation}
              style={{ margin: '0 15px' }}>
              Next
            </Button>
          </Grid>
          <br />
        </DialogActions>
      </Dialog>
      {/* confirmation dialog */}
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
                <span className={classes.confirm_field_title}>Amount:</span> UGX {amount.amount}
              </span>
            </div>
          </form>
        </DialogContent>

        <DialogActions>
          <Grid container alignItems="flex-end" alignContent="flex-end" justify="flex-end">
            <Button
              variant="contained"
              type="button"
              onClick={() => {
                setConfirmation(false);
                setMobileMoneyDialog(true);
              }}>
              Edit
            </Button>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              onClick={handleMobileMoney}
              style={{ margin: '0 15px' }}>
              Send
            </Button>
          </Grid>
          <br />
        </DialogActions>
      </Dialog>
    </>
  );
};

const DeviceHosts = ({ deviceData }) => {
  const classes = useStyles();
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [addHostDialog, setAddHostDialog] = useState(false);
  const [editHostDialog, setEditHostDialog] = useState(false);
  const [mobileMoneyDialog, setMobileMoneyDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState([]);
  const [refreshData, setRefreshData] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const columns = hostColumns(setEditHostDialog, setMobileMoneyDialog, setSelectedItem);

  const getHosts = async () => {
    try {
      setIsLoading(true);
      const response = await getAllDeviceHosts();
      const { hosts } = response;
      const deviceHosts = hosts.filter((host) => host.site_id === deviceData?.site?._id);
      setHosts(deviceHosts);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setShowSuccess(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    getHosts();
  }, [refreshData]);

  return (
    <ErrorBoundary>
      <HorizontalLoader loading={loading} />
      {showSuccess && (
        <Alert style={{ marginTop: 10 }} severity="success">
          {successMessage}
        </Alert>
      )}
      <div className={classes.root}>
        <div className={classes.actionButtonContainer}>
          <Button variant="contained" color="primary" onClick={() => setAddHostDialog(true)}>
            Add Host
          </Button>
        </div>
      </div>
      <br />

      <CustomMaterialTable
        title="Hosts"
        userPreferencePaginationKey={'hosts'}
        columns={columns}
        data={hosts}
        isLoading={isLoading}
        options={{
          search: true,
          exportButton: false,
          searchFieldAlignment: 'left',
          showTitle: false,
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

      <AddHostDialog
        addHostDialog={addHostDialog}
        setAddHostDialog={setAddHostDialog}
        setLoading={setLoading}
        deviceData={deviceData}
        onHostAdded={() => setRefreshData(!refreshData)}
        setSuccessMessage={setSuccessMessage}
        setShowSuccess={setShowSuccess}
      />

      <MobileMoneyDialog
        mobileMoneyDialog={mobileMoneyDialog}
        setMobileMoneyDialog={setMobileMoneyDialog}
        setLoading={setLoading}
        data={selectedItem}
        setSuccessMessage={setSuccessMessage}
        setShowSuccess={setShowSuccess}
      />

      <EditHostDialog
        editHostDialog={editHostDialog}
        setEditHostDialog={setEditHostDialog}
        setLoading={setLoading}
        data={selectedItem}
        deviceData={deviceData}
        onHostEdited={() => setRefreshData(!refreshData)}
        setSuccessMessage={setSuccessMessage}
        setShowSuccess={setShowSuccess}
      />
    </ErrorBoundary>
  );
};

export default DeviceHosts;
