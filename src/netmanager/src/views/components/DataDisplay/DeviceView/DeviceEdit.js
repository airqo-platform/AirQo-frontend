import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import { Box, Button, Grid } from '@material-ui/core';
import { isEmpty, omit } from 'underscore';
import { updateMainAlert } from 'redux/MainAlert/operations';
import { updateDeviceDetails, softUpdateDeviceDetails } from 'views/apis/deviceRegistry';
import { loadDevicesData } from 'redux/DeviceRegistry/operations';
import { useSiteOptionsData } from 'redux/SiteRegistry/selectors';
import { loadSitesData } from 'redux/SiteRegistry/operations';
import DeviceDeployStatus from './DeviceDeployStatus';
import { setLoading } from 'redux/HorizontalLoader/index';
import { getNetworkListSummaryApi } from '../../../apis/accessControl';
import OutlinedSelect from '../../CustomSelects/OutlinedSelect';
import ConfirmDialog from '../../../containers/ConfirmDialog';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

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

const BASE_URL = process.env.REACT_APP_BASE_URL_V2;
// check if base url value is staging and assign staging to active environment variable else asssign production
const ACTIVE_ENVIRONMENT = BASE_URL.includes('staging') ? 'staging' : 'production';

const createNetworkOptions = (networksList) => {
  const options = [];
  networksList.map((network) => {
    options.push({
      value: network.net_name,
      label: network.net_name
    });
  });
  return options;
};

const EditDeviceForm = ({ deviceData, siteOptions }) => {
  const dispatch = useDispatch();
  // const [editData, setEditData] = useState({
  //   ...omit(deviceData, EDIT_OMITTED_KEYS),
  // });
  const [editData, setEditData] = useState({});
  const [networkList, setNetworkList] = useState([]);

  const [errors, setErrors] = useState({});

  const [editLoading, setEditLoading] = useState(false);

  const [open, setConfirmOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);

  const activeNetwork = useSelector((state) => state.accessControl.activeNetwork);

  useEffect(() => {
    if (deviceData) {
      setEditData({
        ...omit(deviceData, EDIT_OMITTED_KEYS)
      });
    }
  }, []);

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

  const handleCancel = () => {
    setEditData({});
    setErrors({});
  };

  const handleSaveClick = () => {
    setSaveModalOpen(true);
  };

  const handleSaveModalClose = () => {
    setSaveModalOpen(false);
  };

  const handleSave = async (isSoftUpdate) => {
    setSaveModalOpen(false);
    setEditLoading(true);
    dispatch(setLoading(true));

    if (editData.deployment_date)
      editData.deployment_date = new Date(editData.deployment_date).toISOString();

    const updateFunction = isSoftUpdate ? softUpdateDeviceDetails : updateDeviceDetails;
    const updateTarget = isSoftUpdate ? 'Platform' : 'ThingSpeak';

    try {
      const responseData = await updateFunction(deviceData._id, editData);
      if (!isEmpty(activeNetwork)) {
        dispatch(loadDevicesData(activeNetwork.net_name));
      }
      dispatch(
        updateMainAlert({
          message: `${responseData.message} Device details updated on ${updateTarget}.`,
          show: true,
          severity: 'success'
        })
      );
    } catch (err) {
      const errorResponse = err.response && err.response.data;
      const errorMessage = errorResponse && errorResponse.errors && errorResponse.errors.message;
      const newErrors = (errorResponse && errorResponse.errors) || {};
      setErrors(newErrors);
      dispatch(
        updateMainAlert({
          message:
            errorMessage ||
            errorResponse.message ||
            err.message ||
            'An error occurred during update',
          show: true,
          severity: 'error'
        })
      );
    }

    setEditLoading(false);
    dispatch(setLoading(false));
  };

  const weightedBool = (primary, secondary) => {
    if (primary) {
      return primary;
    }
    return secondary;
  };

  const fetchNetworks = () => {
    getNetworkListSummaryApi()
      .then((res) => {
        const { networks } = res;
        setNetworkList(createNetworkOptions(networks));
      })
      .catch((error) => {
        console.log('error', error);
      });
  };

  const confirmUpdate = () => {
    setConfirmOpen(false);
  };

  const handleConfirmCancel = () => {
    setEditData({
      ...editData,
      network: deviceData.network
    });
    setConfirmOpen(false);
  };

  useEffect(() => {
    fetchNetworks();
  }, []);

  return (
    <div>
      <Paper
        style={{
          margin: '0 auto',
          minHeight: '200px',
          padding: '20px 20px',
          maxWidth: '1500px'
        }}
      >
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
              label="Channel ID"
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
            <TextField
              select
              fullWidth
              label="Data Access"
              style={{ margin: '10px 0' }}
              defaultValue={deviceData.visibility}
              onChange={handleSelectFieldChange('visibility')}
              SelectProps={{
                native: true,
                style: { width: '100%', height: '50px' }
              }}
              error={!!errors.visibility}
              helperText={errors.visibility}
              variant="outlined"
            >
              <option value={false}>Private</option>
              <option value={true}>Public</option>
            </TextField>
          </Grid>
          <Grid items xs={12} sm={4} style={gridItemStyle}>
            <TextField
              select
              fullWidth
              label="Internet Service Provider"
              style={{ margin: '10px 0' }}
              defaultValue={deviceData.ISP}
              onChange={handleSelectFieldChange('ISP')}
              SelectProps={{
                native: true,
                style: { width: '100%', height: '50px' }
              }}
              variant="outlined"
              error={!!errors.ISP}
              helperText={errors.ISP}
            >
              <option value="" />
              <option value="MTN">MTN</option>
              <option value="Airtel">Airtel</option>
              <option value="Africell">Africell</option>
            </TextField>
          </Grid>
          <Grid items xs={12} sm={4} style={gridItemStyle}>
            <TextField
              select
              fullWidth
              label="Primary Device In Location"
              style={{ margin: '10px 0' }}
              defaultValue={deviceData.isPrimaryInLocation}
              onChange={handleSelectFieldChange('isPrimaryInLocation')}
              SelectProps={{
                native: true,
                style: { width: '100%', height: '50px' }
              }}
              variant="outlined"
              error={!!errors.isPrimaryInLocation}
              helperText={errors.isPrimaryInLocation}
            >
              <option value="" />
              <option value={true}>Yes</option>
              <option value={false}>No</option>
            </TextField>
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
            <Box height="10px" />
            <OutlinedSelect
              label="Network"
              value={networkList.find((option) => option.value === editData.network)}
              onChange={(selected) => {
                setEditData({
                  ...editData,
                  network: selected.value
                });
                setConfirmOpen(true);
              }}
              options={networkList}
              isSearchable
              placeholder="Network"
              name="network"
              error={!!errors.network}
              helperText={errors.network}
              required
              isDisabled={true}
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
            <TextField
              select
              fullWidth
              label="Category"
              style={{ margin: '10px 0' }}
              defaultValue={deviceData.category}
              onChange={handleSelectFieldChange('category')}
              SelectProps={{
                native: true,
                style: { width: '100%', height: '50px' }
              }}
              variant="outlined"
              error={!!errors.category}
              helperText={errors.category}
              required
            >
              <option value={'lowcost'}>Lowcost</option>
              <option value={'bam'}>BAM</option>
              <option value={'gas'}>GAS</option>
            </TextField>
          </Grid>

          <Grid
            container
            alignItems="flex-end"
            alignContent="flex-end"
            justify="flex-end"
            xs={12}
            style={{ margin: '10px 0' }}
          >
            <Button variant="contained" onClick={handleCancel}>
              Cancel
            </Button>

            <Button
              variant="contained"
              color="primary"
              disabled={weightedBool(editLoading, isEmpty(editData))}
              onClick={handleSaveClick}
              style={{ marginLeft: '10px' }}
            >
              Save Changes
            </Button>
          </Grid>
        </Grid>

        <Dialog open={saveModalOpen} onClose={handleSaveModalClose}>
          <DialogTitle>Choose Update Method</DialogTitle>
          <DialogContent>
            <DialogContentText>How would you like to save your changes?</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => handleSave(true)} color="primary" variant="outlined">
              Local Sync
            </Button>
            <Button onClick={() => handleSave(false)} color="primary" variant="contained" autoFocus>
              Global Sync
            </Button>
          </DialogActions>
        </Dialog>

        <ConfirmDialog
          open={open}
          close={handleConfirmCancel}
          confirmBtnMsg={'Confirm'}
          confirm={confirmUpdate}
          title={'Confirm device network migration'}
          message={`Are you sure you want to move this device to ${editData.network} organisation?`}
        />
      </Paper>
    </div>
  );
};

export default function DeviceEdit({ deviceData }) {
  const dispatch = useDispatch();
  const siteOptions = useSiteOptionsData();
  const activeNetwork = useSelector((state) => state.accessControl.activeNetwork);

  useEffect(() => {
    if (!activeNetwork) return;
    if (isEmpty(siteOptions)) {
      dispatch(loadSitesData(activeNetwork.net_name));
    }
  }, []);
  return (
    <div style={{ marginTop: '20px' }}>
      <EditDeviceForm deviceData={deviceData} siteOptions={siteOptions} />
      <DeviceDeployStatus deviceData={deviceData} siteOptions={siteOptions} />
    </div>
  );
}
