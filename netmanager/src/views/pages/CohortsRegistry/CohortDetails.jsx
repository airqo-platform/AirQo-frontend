import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { ArrowBackIosRounded } from '@material-ui/icons';
import DeleteIcon from '@material-ui/icons/DeleteOutlineOutlined';
import {
  Button,
  Grid,
  Paper,
  TextField,
  Tooltip,
  Box,
  DialogActions,
  Dialog,
  DialogTitle,
  DialogContent
} from '@material-ui/core';
import CustomMaterialTable from '../../components/Table/CustomMaterialTable';
import { useInitScrollTop } from 'utils/customHooks';
import ErrorBoundary from 'views/ErrorBoundary/ErrorBoundary';
// css
import 'react-leaflet-fullscreen/dist/styles.css';
import 'assets/css/location-registry.css';
import { isEmpty } from 'underscore';
import { loadCohortDetails } from 'redux/Analytics/operations';
import { updateDeviceDetails } from 'redux/DeviceOverview/OverviewSlice';
import {
  assignDevicesToCohort,
  unassignDeviceFromCohortApi,
  updateCohortApi
} from '../../apis/deviceRegistry';
import { useDevicesData } from 'redux/DeviceRegistry/selectors';
import { loadDevicesData } from 'redux/DeviceRegistry/operations';
import { updateMainAlert } from 'redux/MainAlert/operations';
import OutlinedSelect from '../../components/CustomSelects/OutlinedSelect';
import { createAlertBarExtraContent } from '../../../utils/objectManipulators';

const gridItemStyle = {
  padding: '5px',
  margin: '5px 0'
};

const createDeviceOptions = (devices) => {
  const options = [];
  devices.map((device) => {
    options.push({
      value: device._id,
      label: device.name
    });
  });
  return options;
};

const AssignCohortDeviceForm = ({ cohortID, cohortDevices, open, handleClose }) => {
  const dispatch = useDispatch();
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [deviceOptions, setDeviceOptions] = useState([]);
  const allDevices = useDevicesData();
  const [loading, setLoading] = useState(false);
  const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork') || {});

  useEffect(() => {
    setLoading(true);
    if (!isEmpty(activeNetwork)) {
      if (isEmpty(allDevices)) {
        dispatch(loadDevicesData(activeNetwork.net_name));
      }
    }
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  }, []);

  useEffect(() => {
    if (!isEmpty(allDevices) && !isEmpty(cohortDevices)) {
      const deviceOptions = createDeviceOptions(Object.values(allDevices));
      const nonCohortDevices = deviceOptions.filter((device) => {
        return !cohortDevices.some((cohortDevice) => cohortDevice._id === device.value);
      });

      setDeviceOptions(nonCohortDevices);
    }
  }, [allDevices]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const device_ids = selectedDevices.map((device) => device.value);

    assignDevicesToCohort(cohortID, device_ids)
      .then((res) => {
        setLoading(false);
        dispatch(
          updateMainAlert({
            show: true,
            message: res.message,
            severity: 'success'
          })
        );
        dispatch(loadCohortDetails(res.updated_cohort._id));
        handleClose();
        setSelectedDevices([]);
      })
      .catch((error) => {
        const errors = error.response && error.response.data && error.response.data.errors;
        dispatch(
          updateMainAlert({
            show: true,
            message: error.response && error.response.data && error.response.data.message,
            severity: 'error',
            extra: createAlertBarExtraContent(errors || {})
          })
        );
        setLoading(false);
      });
  };

  const clearState = () => {
    setSelectedDevices([]);
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="form-dialog-title"
      aria-describedby="form-dialog-description"
    >
      <DialogTitle>Assign devices to cohort</DialogTitle>
      <DialogContent style={{ height: '20vh' }}>
        <OutlinedSelect
          fullWidth
          name="devices"
          label="Device(s)"
          placeholder="Select Devices(s)"
          value={selectedDevices}
          options={deviceOptions}
          onChange={(options) => setSelectedDevices(options)}
          isMulti
          variant="outlined"
          margin="dense"
          required
          style={{
            marginBottom: '20px',
            height: '38px'
          }}
          autoFocus
        />
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          onClick={clearState}
          color="primary"
          style={{ marginLeft: '10px' }}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          style={{ marginLeft: '10px' }}
          disabled={loading}
        >
          {loading ? 'Loading..' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const CohortForm = ({ cohort }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork') || {});
  const [openDrawer, setOpenDrawer] = useState(false);
  const initialState = {
    name: '',
    network: activeNetwork.net_name,
    visibility: false
  };
  const [form, setState] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const clearState = () => {
    setState({ ...initialState });
  };

  const handleCloseDrawer = () => {
    setOpenDrawer(false);
  };

  useEffect(() => {
    if (cohort) {
      let cohortData = {
        name: cohort.name,
        network: activeNetwork.net_name,
        visibility: cohort.visibility
      };
      setState(cohortData);
    }
  }, [cohort]);

  const handleCancel = () => {
    setState({
      name: cohort.name,
      network: activeNetwork.net_name,
      visibility: cohort.visibility
    });
  };

  const handleSelectFieldChange = (field) => (event) => {
    setState({
      ...form,
      [field]: event.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const cohortData = {
      name: form.name,
      network: form.network,
      visibility: form.visibility
    };

    await updateCohortApi(cohort._id, cohortData)
      .then((res) => {
        dispatch(
          updateMainAlert({
            show: true,
            message: res.message,
            severity: 'success'
          })
        );
        dispatch(loadCohortDetails(cohort._id));
        clearState();

        setLoading(false);
      })
      .catch((error) => {
        const errors = error.response && error.response.data && error.response.data.errors;
        dispatch(
          updateMainAlert({
            show: true,
            message: error.response && error.response.data && error.response.data.message,
            severity: 'error',
            extra: createAlertBarExtraContent(errors || {})
          })
        );
        setLoading(false);
      });
  };

  return (
    <Paper
      style={{
        margin: '0 auto',
        padding: '20px 20px',
        maxWidth: '1500px'
      }}
    >
      <Box display="flex" width="100%" justifyContent={'space-between'} alignItems={'center'}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            margin: '20px 0',
            width: 'auto'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '5px'
            }}
          >
            <ArrowBackIosRounded
              style={{ color: '#3f51b5', cursor: 'pointer' }}
              onClick={() => {
                history.push('/cohorts');
                // dispatch(removeAirQloudData());
              }}
            />
          </div>
          Cohort Details
        </div>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => setOpenDrawer(true)}
          disabled={loading}
        >
          Add new devices
        </Button>
      </Box>
      <Grid container spacing={1}>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="name"
            label="Cohort name"
            variant="outlined"
            value={form.name}
            fullWidth
            required
            style={{
              marginBottom: '20px'
            }}
            InputLabelProps={{ shrink: true }}
            disabled
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            select
            id="visibility"
            label="Visibility"
            variant="outlined"
            value={form.visibility}
            fullWidth
            SelectProps={{
              native: true,
              style: { width: '100%', height: '53px' }
            }}
            required
            InputLabelProps={{ shrink: true }}
            onChange={handleSelectFieldChange('visibility')}
          >
            <option value={true}>True</option>
            <option value={false}>False</option>
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
          <Button variant="contained" onClick={handleCancel} disabled={loading}>
            Reset
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            style={{ marginLeft: '10px' }}
            disabled={loading}
          >
            {loading ? 'Laoding...' : 'Save Changes'}
          </Button>
        </Grid>
      </Grid>

      <AssignCohortDeviceForm
        cohortID={cohort._id}
        cohortDevices={cohort.devices}
        open={openDrawer}
        handleClose={handleCloseDrawer}
      />
    </Paper>
  );
};

const CohortDetails = (props) => {
  const { className, ...rest } = props;
  useInitScrollTop();
  let params = useParams();
  const history = useHistory();
  const dispatch = useDispatch();
  const activeCohortDetails = useSelector((state) => state.analytics.activeCohortDetails);
  const [devicesData, setDevicesData] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (params.cohortName) {
      dispatch(loadCohortDetails(params.cohortName));
    }
    setTimeout(() => {
      setLoading(false);
    }, 5000);
  }, []);

  useEffect(() => {
    if (!isEmpty(activeCohortDetails.devices)) {
      let deviceList = [];
      activeCohortDetails.devices.map((device) => {
        deviceList.push({
          name: device.name,
          description: device.description,
          site: device.site,
          status: device.status,
          createdAt: device.createdAt,
          _id: device._id
        });
      });
      setDevicesData(deviceList);
    }
  }, [activeCohortDetails]);

  const handleDeviceUnassign = (deviceID) => {
    setLoading(true);
    unassignDeviceFromCohortApi(activeCohortDetails._id, deviceID)
      .then((res) => {
        dispatch(loadCohortDetails(params.cohortName));
        dispatch(
          updateMainAlert({
            show: true,
            message: res.message,
            severity: 'success'
          })
        );
        setLoading(false);
      })
      .catch((err) => {
        dispatch(
          updateMainAlert({
            show: true,
            message: err.response && err.response.data && err.response.data.message,
            severity: 'error'
          })
        );
        setLoading(false);
      });
  };

  return (
    <ErrorBoundary>
      <div
        style={{
          width: '96%',
          margin: ' 20px auto'
        }}
      >
        <CohortForm cohort={activeCohortDetails} />

        <div>
          <div
            style={{
              margin: '50px auto',
              maxWidth: '1500px'
            }}
          >
            {loading ? (
              <Box
                height={'100px'}
                width={'100%'}
                color="blue"
                display={'flex'}
                justifyContent={'center'}
                alignItems={'center'}
              >
                Loading cohort devices...
              </Box>
            ) : (
              devicesData &&
              devicesData.length > 0 && (
                <CustomMaterialTable
                  title="Cohort devices"
                  userPreferencePaginationKey={'Cohort devices'}
                  columns={[
                    {
                      title: 'Device Name',
                      field: 'name',
                      render: (rowData) => (
                        <Button
                          variant="text"
                          color="primary"
                          style={{
                            textTransform: 'capitalize'
                          }}
                          onClick={() => {
                            dispatch(updateDeviceDetails(rowData));
                            history.push(`/device/${rowData.name}/overview`);
                          }}
                        >
                          {rowData.name}
                        </Button>
                      )
                    },
                    {
                      title: 'Description',
                      field: 'description'
                    },
                    {
                      title: 'Site',
                      field: 'site',
                      render: (rowData) => {
                        return rowData.site ? rowData.site.name : 'N/A';
                      }
                    },
                    {
                      title: 'Deployment status',
                      field: 'status',
                      render: (rowData) => (
                        <span
                          style={{
                            color: rowData.status === 'deployed' ? 'green' : 'red',
                            textTransform: 'capitalize'
                          }}
                        >
                          {rowData.status}
                        </span>
                      )
                    },
                    {
                      title: 'Date created',
                      field: 'createdAt'
                    },
                    {
                      title: 'Actions',
                      render: (rowData) => (
                        <Button variant="text" onClick={() => handleDeviceUnassign(rowData._id)}>
                          <Tooltip title="Unassign device">
                            <DeleteIcon
                              className={'hover-red'}
                              style={{
                                margin: '0 5px',
                                color: 'grey'
                              }}
                            />
                          </Tooltip>
                        </Button>
                      )
                    }
                  ]}
                  data={devicesData}
                  options={{
                    search: true,
                    exportButton: true,
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
              )
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default CohortDetails;
