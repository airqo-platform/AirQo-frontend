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
import { setLoading as loadStatus } from 'redux/HorizontalLoader/index';
import { getAllDeviceHosts, createDeviceHost } from '../../apis/deviceRegistry';
import { useSitesData } from 'redux/SiteRegistry/selectors';
import { loadSitesData } from 'redux/SiteRegistry/operations';
import { updateMainAlert } from 'redux/MainAlert/operations';
import Select from 'react-select';
import RemoveIcon from '@material-ui/icons/Remove';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import Tooltip from '@material-ui/core/Tooltip';
import UsersListBreadCrumb from '../../pages/UserList/components/Breadcrumb';

const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork'));

const customStyles = {
  control: (base, state) => ({
    ...base,
    position: 'relative',
    height: '50px',
    marginTop: '10px',
    marginBottom: '10px',
    borderColor: state.isFocused ? '#3f51b5' : '#9a9a9a',
    '&:hover': {
      borderColor: state.isFocused ? 'black' : 'black'
    },
    boxShadow: state.isFocused ? '0 0 1px 1px #3f51b5' : null,
    zIndex: 999
  }),
  option: (provided, state) => ({
    ...provided,
    borderBottom: '1px dotted pink',
    color: state.isSelected ? 'white' : 'blue',
    textAlign: 'left',
    cursor: 'pointer',
    zIndex: 999
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
    width: '100%',
    zIndex: 999999
  })
};

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1)
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

const AddHostDialog = ({ addHostDialog, setAddHostDialog, setLoading, onHostAdded }) => {
  const dispatch = useDispatch();
  const sitesData = useSitesData();
  const [host, setHost] = useState({
    first_name: '',
    last_name: '',
    phone_numbers: [''],
    site_id: null,
    network: activeNetwork.net_name
  });
  const [errors, setErrors] = useState({
    first_name: false,
    last_name: false,
    phone_numbers: [false],
    site_id: false
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const handleCloseDialog = () => {
    setAddHostDialog(false);
    setHost({
      first_name: '',
      last_name: '',
      phone_numbers: [''],
      site_id: null,
      network: activeNetwork.net_name
    });
  };

  const handleHostChange = (prop, index) => (event) => {
    if (prop === 'phone_numbers') {
      const phoneNumbers = [...host.phone_numbers];
      phoneNumbers[index] = event.target.value;
      setHost({ ...host, phone_numbers: phoneNumbers });
    } else {
      setHost({ ...host, [prop]: event.target.value });
    }
    setErrors({ ...errors, [prop]: '' });
  };

  const addPhoneNumber = () => {
    if (host.phone_numbers.length < 4) {
      const phoneNumbers = [...host.phone_numbers, ''];
      setHost({ ...host, phone_numbers: phoneNumbers });
      const phoneErrors = [...errors.phone_numbers, false];
      setErrors({ ...errors, phone_numbers: phoneErrors });
    }
  };

  const removePhoneNumber = (index) => {
    const phoneNumbers = [...host.phone_numbers];
    phoneNumbers.splice(index, 1);
    setHost({ ...host, phone_numbers: phoneNumbers });
    const phoneErrors = [...errors.phone_numbers];
    phoneErrors.splice(index, 1);
    setErrors({ ...errors, phone_numbers: phoneErrors });
  };

  const handleAddHost = async () => {
    try {
      const hostCopy = {
        first_name: host.first_name,
        last_name: host.last_name,
        site_id: selectedOption.value,
        network: activeNetwork.net_name,
        phone_number: host.phone_numbers[0],
        phone_number_2: host.phone_numbers[1],
        phone_number_3: host.phone_numbers[2],
        phone_number_4: host.phone_numbers[3]
      };

      if (
        !hostCopy.first_name ||
        !hostCopy.last_name ||
        !hostCopy.site_id ||
        !hostCopy.network ||
        !hostCopy.phone_number
      ) {
        throw new Error('One or more required fields are empty. Please fill them before sending.');
      }

      setLoading(true);
      dispatch(loadStatus(true));

      ['phone_number_2', 'phone_number_3', 'phone_number_4'].forEach((key) => {
        if (!hostCopy[key]) {
          delete hostCopy[key];
        }
      });

      const response = await createDeviceHost(hostCopy);
      setLoading(false);
      dispatch(loadStatus(false));
      if (response.success) {
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
        throw new Error(response.errors.message || 'An error occurred. Please try again.');
      }
    } catch (error) {
      setLoading(false);
      dispatch(loadStatus(false));
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
      dispatch(loadStatus(true));
      if (!isEmpty(activeNetwork)) {
        dispatch(loadSitesData(activeNetwork.net_name));
      }
      setLoading(false);
      dispatch(loadStatus(false));
    }
  }, []);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setShowError(false);
        setErrorMessage('');
      }, 6500);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const renderPhoneNumbers = () => {
    return host.phone_numbers.map((phoneNumber, index) => {
      const isPrimary = index === 0;
      const label = isPrimary ? 'Mobile Money Number' : `Phone Number ${index + 1} (Optional)`;
      const errorText = errors.phone_numbers[index];

      return (
        <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            fullWidth
            margin="dense"
            label={label}
            variant="outlined"
            type="tel"
            placeholder='e.g. "+256xxxxxxxxx"'
            value={phoneNumber}
            onChange={handleHostChange('phone_numbers', index)}
            required={isPrimary}
            error={!!errorText}
            helperText={errorText}
          />
          {!isPrimary && (
            <IconButton
              onClick={() => removePhoneNumber(index)}
              aria-label="Remove Phone Number"
              color="primary">
              <RemoveIcon />
            </IconButton>
          )}
        </div>
      );
    });
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

      <DialogContent style={{ maxHeight: 'auto' }}>
        {showError && (
          <Alert style={{ marginBottom: 10 }} severity="error">
            {errorMessage}
          </Alert>
        )}
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

        {renderPhoneNumbers()}
        {host.phone_numbers.length < 4 && (
          <Tooltip title="Add Phone Number" aria-label="add" ref={React.createRef()}>
            <IconButton onClick={addPhoneNumber} aria-label="Add Phone Number" color="primary">
              <AddIcon />
            </IconButton>
          </Tooltip>
        )}
        <Select
          label="Sites"
          name="site_id"
          isLoading={isEmpty(sitesData)}
          options={
            Object.values(sitesData).map((site) => ({
              value: site._id,
              label: site.name
            })) || []
          }
          value={selectedOption}
          menuPlacement="auto"
          menuPosition="fixed"
          onChange={onChangeDropdown}
          styles={customStyles}
          isMulti={false}
          fullWidth
          placeholder="Select site"
          required
          error={!!errors.site_id}
          helperText={errors.site_id}
        />
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
  const history = useHistory();
  const dispatch = useDispatch();
  const sitesdata = useSitesData();
  const classes = useStyles();
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [addHostDialog, setAddHostDialog] = useState(false);
  const [refreshData, setRefreshData] = useState(false);
  const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork'));

  const getHosts = async () => {
    try {
      setIsLoading(true);
      dispatch(loadStatus(true));
      const response = await getAllDeviceHosts();
      const { hosts } = response;
      const filteredHosts = hosts.filter((host) => host.network === activeNetwork.net_name);
      setHosts(filteredHosts);
      setIsLoading(false);
      dispatch(loadStatus(false));
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      dispatch(loadStatus(false));
    }
  };

  useEffect(() => {
    if (isEmpty(sitesdata)) {
      setLoading(true);
      dispatch(loadStatus(true));
      if (!isEmpty(activeNetwork)) {
        dispatch(loadSitesData(activeNetwork.net_name));
      }
      setLoading(false);
      dispatch(loadStatus(false));
    }
  }, []);

  useEffect(() => {
    getHosts();
  }, [refreshData]);

  return (
    <>
      <div className={classes.actionButtonContainer}>
        <Button variant="contained" color="primary" onClick={() => setAddHostDialog(true)}>
          Add Host
        </Button>
      </div>
      <UsersListBreadCrumb
        category="Host Registry"
        usersTable={`${activeNetwork.net_name === 'airqo' ? 'AirQo' : activeNetwork.net_name}`}
      />

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
          history.push(`/hosts/${data._id}`);
        }}
        data={hosts}
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
