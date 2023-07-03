import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import { Button, Grid } from '@material-ui/core';
import OutlinedSelect from '../../CustomSelects/OutlinedSelect';
import { isEmpty, isEqual, omit } from 'underscore';
import { updateMainAlert } from 'redux/MainAlert/operations';
import { updateDeviceDetails } from 'views/apis/deviceRegistry';
import { loadDevicesData } from 'redux/DeviceRegistry/operations';
import { useSiteOptionsData } from 'redux/SiteRegistry/selectors';
import { loadSitesData } from 'redux/SiteRegistry/operations';
import DeviceDeployStatus from './DeviceDeployStatus';
import { capitalize } from 'utils/string';
import { getDateString } from 'utils/dateTime';

import { filterSite } from 'utils/sites';
// dropdown component
import Select from 'react-select';
// horizontal loader
import HorizontalLoader from 'views/components/HorizontalLoader/HorizontalLoader';

const gridItemStyle = {
  padding: '5px'
};

const EDIT_OMITTED_KEYS = [
  'owner',
  'device_manufacturer',
  'product_name',
  'site',
  'powerType',
  'mountType',
  'height',
  'deployment_date',
  'nextMaintenance',
  'pictures'
];

// dropdown component styles
const customStyles = {
  control: (base, state) => ({
    ...base,
    height: '50px',
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

const EditDeviceForm = ({ deviceData, siteOptions }) => {
  const dispatch = useDispatch();
  // const [editData, setEditData] = useState({
  //   ...omit(deviceData, EDIT_OMITTED_KEYS),
  // });
  const [editData, setEditData] = useState({});

  const [errors, setErrors] = useState({});

  const [editLoading, setEditLoading] = useState(false);

  const handleTextFieldChange = (event) => {
    setEditData({
      ...editData,
      [event.target.id]: event.target.value
    });
  };

  const handleSelectFieldChange = (id) => (event) => {
    setEditData({
      ...editData,
      [id]: event.target.value
    });
  };

  console.log('editData', editData);

  const options = [
    { value: false, label: 'Private' },
    { value: true, label: 'Public' }
  ];

  const internetProviders = [
    { value: '', label: '' },
    { value: 'MTN', label: 'MTN' },
    { value: 'Airtel', label: 'Airtel' },
    { value: 'Africell', label: 'Africell' }
  ];

  const primaryDeviceInLocation = [
    { value: '', label: '' },
    { value: true, label: 'Yes' },
    { value: false, label: 'No' }
  ];

  const networks = [
    { value: 'airqo', label: 'AirQo' },
    { value: 'kcca', label: 'KCCA' },
    { value: 'usembassy', label: 'US EMBASSY' }
  ];

  const categorys = [
    { value: 'lowcost', label: 'Lowcost' },
    { value: 'bam', label: 'BAM' }
  ];

  const handleChange = (id) => (selectedOption) => {
    setEditData({
      ...editData,
      [id]: selectedOption.value
    });
  };

  const handleCancel = () => {
    setEditData({});
    setErrors({});
  };

  const handleEditSubmit = async () => {
    setEditLoading(true);

    if (editData.deployment_date)
      editData.deployment_date = new Date(editData.deployment_date).toISOString();

    await updateDeviceDetails(deviceData._id, editData)
      .then((responseData) => {
        const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork'));
        if (!isEmpty(activeNetwork)) {
          dispatch(loadDevicesData(activeNetwork.net_name));
        }
        dispatch(
          updateMainAlert({
            message: responseData.message,
            show: true,
            severity: 'success'
          })
        );
      })
      .catch((err) => {
        const newErrors = (err.response && err.response.data && err.response.data.errors) || {};
        setErrors(newErrors);
        dispatch(
          updateMainAlert({
            message:
              (err.response && err.response.data && err.response.data.message) ||
              (err.response && err.response.message),
            show: true,
            severity: 'error'
          })
        );
      });
    setEditLoading(false);
  };

  const weightedBool = (primary, secondary) => {
    if (primary) {
      return primary;
    }
    return secondary;
  };

  return (
    <div>
      {/* custome Horizontal loader indicator */}
      <HorizontalLoader loading={editLoading} />
      <Paper
        style={{
          margin: '0 auto',
          minHeight: '200px',
          padding: '20px 20px',
          maxWidth: '1500px'
        }}>
        <Grid container spacing={1}>
          <Grid items xs={12} sm={4} style={gridItemStyle}>
            <TextField
              autoFocus
              margin="dense"
              id="long_name"
              label="Name"
              variant="outlined"
              defaultValue={deviceData.long_name}
              onChange={handleTextFieldChange}
              error={!!errors.long_name}
              helperText={errors.long_name}
              fullWidth
            />
          </Grid>
          <Grid items xs={12} sm={4} style={gridItemStyle}>
            <TextField
              autoFocus
              margin="dense"
              id="device_number"
              label="Device Number"
              variant="outlined"
              defaultValue={deviceData.device_number}
              onChange={handleTextFieldChange}
              error={!!errors.device_number}
              helperText={errors.device_number}
              fullWidth
            />
          </Grid>
          <Grid items xs={12} sm={4} style={gridItemStyle}>
            <TextField
              autoFocus
              margin="dense"
              variant="outlined"
              id="description"
              label="Description"
              defaultValue={deviceData.description}
              onChange={handleTextFieldChange}
              error={!!errors.description}
              helperText={errors.description}
              fullWidth
            />
          </Grid>
          <Grid items xs={12} sm={4} style={gridItemStyle}>
            <TextField
              autoFocus
              margin="dense"
              variant="outlined"
              id="phoneNumber"
              label="Phone Number"
              defaultValue={deviceData.phoneNumber}
              onChange={handleTextFieldChange}
              error={!!errors.phoneNumber}
              helperText={errors.phoneNumber}
              placeholder="+256XXXXXXXXX"
              fullWidth
            />
          </Grid>
          <Grid items xs={12} sm={4} style={gridItemStyle}>
            <TextField
              autoFocus
              margin="dense"
              variant="outlined"
              id="latitude"
              label="Latitude"
              defaultValue={deviceData.latitude}
              onChange={handleTextFieldChange}
              error={!!errors.latitude}
              helperText={errors.latitude}
              fullWidth
            />
          </Grid>
          <Grid items xs={12} sm={4} style={gridItemStyle}>
            <TextField
              autoFocus
              margin="dense"
              variant="outlined"
              id="longitude"
              label="Longitude"
              defaultValue={deviceData.longitude}
              onChange={handleTextFieldChange}
              error={!!errors.longitude}
              helperText={errors.longitude}
              fullWidth
            />
          </Grid>
          <Grid items xs={12} sm={4} style={gridItemStyle}>
            <Select
              label="Data Access Visibility"
              defaultValue={options.find((option) => option.value === deviceData.visibility)}
              value={options.find((option) => option.value === editData.visibility)}
              onChange={handleChange('visibility')}
              options={options}
              variant="outlined"
              placeholder="Select Data Access"
              styles={customStyles}
              error={!!errors.visibility}
              helperText={errors.visibility}
              required
            />
          </Grid>
          <Grid items xs={12} sm={4} style={gridItemStyle}>
            <Select
              label="Internet Service Provider"
              defaultValue={internetProviders.find(
                (internetProvider) => internetProvider.value === deviceData.ISP
              )}
              value={internetProviders.find(
                (internetProvider) => internetProvider.value === editData.ISP
              )}
              onChange={handleChange('ISP')}
              options={internetProviders}
              styles={customStyles}
              placeholder="Select ISP"
              variant="outlined"
              error={!!errors.ISP}
              helperText={errors.ISP}
            />
          </Grid>
          <Grid items xs={12} sm={4} style={gridItemStyle}>
            <Select
              label="Primary Device In Location"
              defaultValue={primaryDeviceInLocation.find(
                (option) => option.value === deviceData.isPrimaryInLocation
              )}
              value={primaryDeviceInLocation.find(
                (option) => option.value === editData.isPrimaryInLocation
              )}
              onChange={handleChange('isPrimaryInLocation')}
              options={primaryDeviceInLocation}
              variant="outlined"
              error={!!errors.isPrimaryInLocation}
              helperText={errors.isPrimaryInLocation}
              styles={customStyles}
              placeholder="Select Primary Device"
            />
          </Grid>
          <Grid items xs={12} sm={4} style={gridItemStyle}>
            <TextField
              style={{ margin: '10px 0' }}
              label="Generation Version"
              variant="outlined"
              type="number"
              value={deviceData.generation_version}
              onChange={handleTextFieldChange}
              error={!!errors.generation_version}
              helperText={errors.generation_version}
              fullWidth
              required
            />
          </Grid>
          <Grid items xs={12} sm={4} style={gridItemStyle}>
            <Select
              label="Network"
              defaultValue={networks.find((network) => network.value === deviceData.network)}
              value={networks.find((network) => network.value === editData.network)}
              onChange={handleChange('network')}
              options={networks}
              variant="outlined"
              error={!!errors.network}
              helperText={errors.network}
              styles={{
                ...customStyles,
                control: (base) => ({
                  ...base,
                  position: 'relative',
                  top: '10px'
                })
              }}
              placeholder="Select Network"
              required
            />
          </Grid>
          <Grid items xs={12} sm={4} style={gridItemStyle}>
            <TextField
              style={{ margin: '10px 0' }}
              label="Generation Count"
              variant="outlined"
              type="number"
              value={deviceData.generation_count}
              error={!!errors.generation_count}
              helperText={errors.generation_count}
              onChange={handleTextFieldChange}
              fullWidth
              required
            />
          </Grid>
          <Grid items xs={12} sm={4} style={gridItemStyle}>
            <Select
              label="Category"
              defaultValue={categorys.find((category) => category.value === deviceData.category)}
              value={categorys.find((category) => category.value === editData.category)}
              onChange={handleChange('category')}
              options={categorys}
              variant="outlined"
              error={!!errors.category}
              helperText={errors.category}
              required
              styles={{
                ...customStyles,
                control: (base) => ({
                  ...base,
                  position: 'relative',
                  top: '10px'
                })
              }}
              placeholder="Select Category"
            />
          </Grid>

          <Grid
            container
            alignItems="flex-end"
            alignContent="flex-end"
            justify="flex-end"
            xs={12}
            style={{ margin: '10px 0' }}>
            <Button variant="contained" onClick={handleCancel}>
              Cancel
            </Button>

            <Button
              variant="contained"
              color="primary"
              disabled={weightedBool(editLoading, isEmpty(editData))}
              onClick={handleEditSubmit}
              style={{ marginLeft: '10px' }}>
              Save Changes
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
};

export default function DeviceEdit({ deviceData }) {
  const dispatch = useDispatch();
  const siteOptions = useSiteOptionsData();

  useEffect(() => {
    if (isEmpty(siteOptions)) {
      const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork'));
      if (!isEmpty(activeNetwork)) {
        dispatch(loadSitesData(activeNetwork.net_name));
      }
    }
  }, []);
  return (
    <div style={{ marginTop: '20px' }}>
      <EditDeviceForm deviceData={deviceData} siteOptions={siteOptions} />
      <DeviceDeployStatus deviceData={deviceData} siteOptions={siteOptions} />
    </div>
  );
}
