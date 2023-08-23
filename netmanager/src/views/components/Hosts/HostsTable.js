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
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { isEmpty } from 'underscore';
import Alert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/styles';
import CustomMaterialTable from '../Table/CustomMaterialTable';
import HorizontalLoader from 'views/components/HorizontalLoader/HorizontalLoader';
import { getAllDeviceHosts, createDeviceHost } from '../../apis/deviceRegistry';
import { useSitesSummaryData, useSitesData } from 'redux/SiteRegistry/selectors';
import { loadSitesSummary, loadSitesData } from 'redux/SiteRegistry/operations';
import { updateMainAlert } from 'redux/MainAlert/operations';
import Select from 'react-select';

const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork'));

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

const useStyles = makeStyles((theme) => ({
  root: {
    padding: '0px'
  },
  modelWidth: {
    minWidth: 450
  },
  actionButtonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: '20px'
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

const AddHostDialog = ({ addHostDialog, setAddHostDialog, setLoading, onHostAdded }) => {
  const dispatch = useDispatch();
  const sitesData = useSitesData();
  const classes = useStyles();
  const hostInitialState = {
    first_name: '',
    last_name: '',
    phone_number: '',
    email: '',
    site_id: null
  };
  const [errors, setErrors] = useState({
    first_name: false,
    last_name: false,
    phone_number: false,
    email: false,
    site_id: false
  });

  const [host, setHost] = useState(hostInitialState);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

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
      if (!host.site_id) newErrors.site_id = 'Site ID is required.';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setLoading(false);
        return;
      }

      const response = await createDeviceHost(host);
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
        onHostAdded();
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
    setHost({
      ...host,
      [name]: selectedOption.value
    });
    setSelectedOption(selectedOption);
    setErrors({ ...errors, [name]: '' });
  };

  useEffect(() => {
    if (isEmpty(sitesData)) {
      setLoading(true);
      if (!isEmpty(activeNetwork)) {
        dispatch(loadSitesData(activeNetwork.net_name));
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setShowError(false);
        setErrorMessage('');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

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
          <Select
            label="Sites"
            name="site_id"
            options={
              Object.values(sitesData).map((site) => ({
                value: site._id,
                label: site.name
              })) || []
            }
            value={selectedOption}
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

const HostsTable = () => {
  const dispatch = useDispatch();
  const sitesdata = useSitesData();
  const history = useHistory();
  const classes = useStyles();
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [addHostDialog, setAddHostDialog] = useState(false);
  const [refreshData, setRefreshData] = useState(false);

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
    if (isEmpty(sitesdata)) {
      setLoading(true);
      if (!isEmpty(activeNetwork)) {
        dispatch(loadSitesData(activeNetwork.net_name));
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getHosts();
  }, [refreshData]);

  return (
    <>
      <HorizontalLoader loading={loading} />
      <div className={classes.actionButtonContainer}>
        <Button variant="contained" color="primary" onClick={() => setAddHostDialog(true)}>
          Add Host
        </Button>
      </div>

      <CustomMaterialTable
        userPreferencePaginationKey={'hosts-table'}
        title="Hosts List"
        columns={[
          {
            title: 'Hosts Name',
            field: 'first_name',
            render: (rowData) => `${rowData.first_name} ${rowData.last_name}`,
            customSort: (a, b) => a.first_name.localeCompare(b.first_name),
            cellStyle: {
              width: '20%',
              minWidth: '20%'
            }
          },
          {
            title: 'Site ID',
            field: 'site_id',
            render: (rowData) => rowData.site_id,
            cellStyle: {
              width: '20%',
              minWidth: '20%',
              textAlign: 'center'
            },
            headerStyle: {
              textAlign: 'center'
            }
          },
          {
            title: 'Phone Number',
            field: 'phone_number',
            render: (rowData) => rowData.phone_number,
            cellStyle: {
              width: '20%',
              minWidth: '20%',
              textAlign: 'center'
            },
            headerStyle: {
              textAlign: 'center'
            }
          },
          {
            title: 'Email Address',
            field: 'email',
            render: (rowData) => rowData.email,
            cellStyle: {
              width: '20%',
              minWidth: '20%'
            }
          },
          {
            title: 'Date Added',
            field: 'date_added',
            render: (rowData) => {
              const date = new Date(rowData.createdAt);
              const options = { year: 'numeric', month: 'long', day: 'numeric' };
              return date.toLocaleDateString('en-US', options);
            },
            cellStyle: {
              width: '20%',
              minWidth: '20%'
            }
          }
        ]}
        onRowClick={(event, data) => {
          event.preventDefault();
          const matchingSite = Object.values(sitesdata).find((site) => site._id === data.site_id);
          if (matchingSite) {
            const deviceName =
              matchingSite && matchingSite.devices
                ? matchingSite.devices.map((device) => device.name)
                : [];
            const deviceStatus =
              matchingSite && matchingSite.devices
                ? matchingSite.devices.map((device) => device.status)
                : [];
            if (deviceStatus.includes('deployed')) {
              history.push(`/device/${deviceName}/hosts`);
            } else {
              dispatch(
                updateMainAlert({
                  severity: 'error',
                  message: 'Device for this host is not deployed.',
                  show: true
                })
              );
            }
          }
        }}
        data={hosts || []}
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

      <AddHostDialog
        addHostDialog={addHostDialog}
        setAddHostDialog={setAddHostDialog}
        setLoading={setLoading}
        onHostAdded={() => setRefreshData(!refreshData)}
      />
    </>
  );
};

export default HostsTable;
