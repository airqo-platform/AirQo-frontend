import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useHistory, useParams } from 'react-router-dom';
import { ArrowBackIosRounded } from '@material-ui/icons';
import DeleteIcon from '@material-ui/icons/DeleteOutlineOutlined';
import {
  Button,
  Grid,
  Paper,
  TextField,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Divider,
  CircularProgress,
  Tooltip,
  Box
} from '@material-ui/core';
import CustomMaterialTable from '../../components/Table/CustomMaterialTable';
import { useInitScrollTop } from 'utils/customHooks';
import ErrorBoundary from 'views/ErrorBoundary/ErrorBoundary';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import Typography from '@material-ui/core/Typography';
// css
import 'react-leaflet-fullscreen/dist/styles.css';
import 'assets/css/location-registry.css';
import { isEmpty, isEqual } from 'underscore';
import { loadCohortDetails } from '../../../redux/Analytics/operations';
import { updateDeviceDetails } from '../../../redux/DeviceOverview/OverviewSlice';
import AddCohortToolbar from './AddCohortForm';
import {
  assignDevicesToCohort,
  unassignDeviceFromCohortApi,
  updateCohortApi
} from '../../apis/deviceRegistry';
import Select from 'react-select';
import { useDevicesData } from '../../../redux/DeviceRegistry/selectors';
import { loadDevicesData } from '../../../redux/DeviceRegistry/operations';
import { updateMainAlert } from '../../../redux/MainAlert/operations';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(4)
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textTransform: 'capitalize'
  },
  titleSpacing: {
    marginBottom: theme.spacing(2)
  }
}));

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

const CohortForm = ({ cohort }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const devices = useDevicesData();
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [deviceOptions, setDeviceOptions] = useState([]);
  const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork') || {});

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

  const onChange = (e) => {
    setState({
      ...form,
      [e.target.id]: e.target.value
    });
  };

  useEffect(() => {
    setLoading(true);
    if (!isEmpty(activeNetwork)) {
      dispatch(loadDevicesData(activeNetwork.net_name));
    }
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  }, []);

  useEffect(() => {
    if (cohort) {
      let cohortData = {
        name: cohort.name,
        network: activeNetwork.net_name,
        visibility: cohort.visibility
      };
      setState(cohortData);
      const deviceArr = cohort.devices ? createDeviceOptions(cohort.devices) : [];
      setSelectedDevices(deviceArr);
    }
  }, [cohort]);

  useEffect(() => {
    if (!isEmpty(devices)) {
      const deviceOptions = createDeviceOptions(Object.values(devices));
      setDeviceOptions(deviceOptions);
    }
  }, [devices]);

  const handleCancel = () => {
    setState({
      name: cohort.name,
      network: activeNetwork.net_name,
      visibility: cohort.visibility
    });
    const deviceArr = cohort.devices ? createDeviceOptions(cohort.devices) : [];
    setSelectedDevices(deviceArr);
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
        const uniqueDevices = selectedDevices.filter((device) => {
          return !cohort.devices.some((cohortDevice) => cohortDevice._id === device.value);
        });

        const device_ids = uniqueDevices.map((device) => device.value);
        console.log(device_ids);

        if (device_ids && device_ids.length > 0) {
          assignDevicesToCohort(res.cohort._id, device_ids)
            .then((res) => {
              // dispatch(
              //     setActiveCohort({
              //     name: res.updated_cohort.name,
              //     _id: res.updated_cohort._id
              //     })
              // );
              dispatch(
                updateMainAlert({
                  show: true,
                  message: res.message,
                  severity: 'success'
                })
              );
              clearState();
              setSelectedDevices([]);
              setLoading(false);
            })
            .catch((error) => {
              const errors = error.response && error.response.data && error.response.data.errors;
              dispatch(
                updateMainAlert({
                  show: true,
                  message: error.response && error.response.data && error.response.data.message,
                  severity: 'error'
                })
              );
              setLoading(false);
            });
        }
      })
      .catch((error) => {
        const errors = error.response && error.response.data && error.response.data.errors;
        dispatch(
          updateMainAlert({
            show: true,
            message: error.response && error.response.data && error.response.data.message,
            severity: 'error'
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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          margin: '20px 0'
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

        <Grid items xs={12} sm={6} lg={12} style={gridItemStyle}></Grid>
        <Grid items xs={12} sm={12} lg={12} style={gridItemStyle}>
          <Typography variant="h3">Edit cohort devices</Typography>
          <Select
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
            Reset
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            style={{ marginLeft: '10px' }}
          >
            Save Changes
          </Button>
        </Grid>
      </Grid>
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
