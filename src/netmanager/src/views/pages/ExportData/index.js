import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/styles';
import {
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  Tabs,
  Tab,
  Box,
  Snackbar,
  IconButton
} from '@material-ui/core';
import Select from 'react-select';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import TextField from '@material-ui/core/TextField';
import { isEmpty } from 'underscore';
import Papa from 'papaparse';
import { useDashboardSitesData } from 'redux/Dashboard/selectors';
import { loadSites } from 'redux/Dashboard/operations';
import { downloadDataApi } from 'views/apis/analytics';
import { roundToStartOfDay, roundToEndOfDay } from 'utils/dateTime';
import { updateMainAlert } from 'redux/MainAlert/operations';
import { useInitScrollTop, usePollutantsOptions } from 'utils/customHooks';
import ErrorBoundary from 'views/ErrorBoundary/ErrorBoundary';
import { useDevicesData } from 'redux/DeviceRegistry/selectors';
import { loadDevicesData } from 'redux/DeviceRegistry/operations';
import { useDashboardAirqloudsData } from 'redux/AirQloud/selectors';
import { fetchDashboardAirQloudsData } from 'redux/AirQloud/operations';
import { loadSitesData } from 'redux/SiteRegistry/operations';
import { useSitesData } from 'redux/SiteRegistry/selectors';
import ExportDataBreadCrumb from './components/BreadCrumb';
import CloseIcon from '@material-ui/icons/Close';

// tutorial tooltip
import Tutorial from 'views/components/TutorialTooltip/Tutorial';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(4)
  },
  tabs: {
    display: 'flex',
    justifyContent: 'center',
    borderBottom: '1px solid #eee',
    '& .MuiTabs-scrollable': {
      borderBottom: 'none'
    },
    '& .MuiTab-root': {
      minWidth: 0,
      marginRight: theme.spacing(3),
      '&:focus': {
        outline: 'none',
        backgroundColor: 'transparent'
      }
    }
  }
}));

const normalizeRegionCountry = (region, country) => {
  if (!region || !country) {
    return '';
  }

  // Remove punctuation and extra spaces, then convert to lower case
  const normalizedRegion = region.replace(/[.,]/g, '').trim().toLowerCase();
  const normalizedCountry = country.replace(/[.,]/g, '').trim().toLowerCase();

  // Return the normalized key
  return `${normalizedRegion} - ${normalizedCountry}`;
};

const groupSitesByRegion = (sites) => {
  const regionGroups = {};

  for (const site of sites) {
    const regionCountryKey = normalizeRegionCountry(site.region, site.country);

    if (!regionGroups[regionCountryKey]) {
      regionGroups[regionCountryKey] = {
        region: `${site.region}, ${site.country}`,
        label: `${site.region}, ${site.country}`,
        value: [],
        country: site.country
      };
    }

    regionGroups[regionCountryKey].value.push(site._id);
  }

  const groupedRegions = Object.values(regionGroups);

  // sort groupedRegions by country
  groupedRegions.sort((a, b) => {
    if (a.country < b.country) return -1;
    if (a.country > b.country) return 1;
    return 0;
  });

  return groupedRegions;
};

const createDeviceRegistrySiteOptions = (sites) => {
  const options = [];
  sites.map((site) =>
    options.push({
      _id: site._id,
      region: site.region,
      country: site.country
    })
  );
  return options;
};

const createSiteOptions = (sites) => {
  const options = [];
  sites.map((site) =>
    options.push({
      value: site._id,
      label: site.name || site.description || site.generated_name
    })
  );
  return options;
};

const createDeviceOptions = (devices) => {
  const options = [];
  devices.map((device) => {
    options.push({
      value: device.name,
      label: device.name || device._id
    });
  });
  return options;
};

const createAirqloudOptions = (airqlouds) => {
  const options = [];

  airqlouds.sort((a, b) => {
    if (a.long_name < b.long_name) return -1;
    if (a.long_name > b.long_name) return 1;
    return 0;
  });

  airqlouds.map((airqloud) =>
    options.push({
      value: airqloud._id,
      label: `${airqloud.long_name}`
    })
  );
  return options;
};

const getValues = (options) => {
  const values = [];
  options.map((option) => values.push(option.value));
  return values;
};

function extractSiteIds(options) {
  const siteIds = options.reduce((ids, obj) => {
    return ids.concat(obj.value);
  }, []);

  return siteIds;
}

function extractLabels(options) {
  const labels = options.reduce((labels, obj) => {
    return labels.concat(obj.label);
  }, []);
  return labels;
}

const dataTypeOptions = [
  { value: 'calibrated', label: 'Calibrated' },
  { value: 'raw', label: 'Raw' }
];

const ExportData = (props) => {
  useInitScrollTop();
  const { className, staticContext, ...rest } = props;
  const classes = useStyles();

  const MAX_ALLOWED_DATE_DIFF_IN_DAYS = 93;

  const dispatch = useDispatch();

  const sites = useDashboardSitesData();
  const [siteOptions, setSiteOptions] = useState([]);
  const [selectedSites, setSelectedSites] = useState([]);

  const deviceRegistrySites = useSitesData();
  const [deviceRegistrySiteOptions, setDeviceRegistrySiteOptions] = useState([]);
  const [regionOptions, setRegionOptions] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);

  const deviceList = useDevicesData();
  const [deviceOptions, setDeviceOptions] = useState([]);
  const [selectedDevices, setSelectedDevices] = useState([]);

  const airqlouds = useDashboardAirqloudsData();
  const [airqloudOptions, setAirqloudOptions] = useState([]);
  const [selectedAirqlouds, setSelectedAirqlouds] = useState([]);

  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pollutants, setPollutants] = useState([]);
  const [frequency, setFrequency] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [outputFormat, setOutputFormat] = useState(null);
  const activeNetwork = useSelector((state) => state.accessControl.activeNetwork);

  // Tabs
  const [value, setValue] = useState(0);

  const frequencyOptions = [
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const pollutantOptions = usePollutantsOptions();

  const typeOptions = [
    { value: 'json', label: 'JSON' },
    { value: 'csv', label: 'CSV' }
    //{ value: "aqcsv", label: "AQCSV" },
  ];

  const typeOutputFormatOptions = [
    { value: 'aqcsv', label: 'AQCSV' },
    { value: 'airqo-standard', label: 'AirQo Standard' }
  ];

  const [dataType, setDataType] = useState({ value: 'calibrated', label: 'Calibrated' });

  function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`data-export-tabpanel-${index}`}
        aria-labelledby={`data-export-tab-${index}`}
        {...other}
      >
        {value === index && <div sx={{ p: 3 }}>{children}</div>}
      </div>
    );
  }

  function a11yProps(index) {
    return {
      id: `data-export-tab-${index}`,
      'aria-controls': `data-export-tabpanel-${index}`
    };
  }

  const handleChangeTabPanel = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    dispatch(loadSites());
  }, []);

  useEffect(() => {
    if (!activeNetwork) return;
    dispatch(loadSitesData(activeNetwork.net_name));
  }, []);

  useEffect(() => {
    if (!activeNetwork) return;
    dispatch(loadDevicesData(activeNetwork.net_name));
  }, []);

  useEffect(() => {
    setSiteOptions(createSiteOptions(Object.values(sites)));
    setDeviceOptions(createDeviceOptions(Object.values(deviceList)));
    setAirqloudOptions(createAirqloudOptions(Object.values(airqlouds)));
  }, [sites, deviceList, airqlouds]);

  useEffect(() => {
    setDeviceRegistrySiteOptions(
      createDeviceRegistrySiteOptions(Object.values(deviceRegistrySites))
    );
  }, [deviceRegistrySites]);

  useEffect(() => {
    dispatch(fetchDashboardAirQloudsData());
  }, []);

  useEffect(() => {
    setRegionOptions(groupSitesByRegion(deviceRegistrySiteOptions));
  }, [deviceRegistrySiteOptions]);

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleClickSnackbar = () => {
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenSnackbar(false);
    setSnackbarMessage('');
  };

  const clearExportData = () => {
    setStartDate('');
    setEndDate('');
    setFileType(null);
    setSelectedAirqlouds([]);
    setSelectedDevices([]);
    setSelectedSites([]);
    setSelectedRegions([]);
    setPollutants([]);
    setOutputFormat(null);
    setFrequency(null);
    setDataType({ value: 'calibrated', label: 'Calibrated' });
  };

  const disableDownloadBtn = (exportType) => {
    if (exportType === 'sites') {
      return (
        !(
          startDate !== '' &&
          endDate !== '' &&
          !isEmpty(selectedSites) &&
          fileType &&
          fileType.value &&
          frequency &&
          frequency.value &&
          outputFormat &&
          dataType
        ) || loading
      );
    }

    if (exportType === 'devices') {
      return (
        !(
          startDate !== '' &&
          endDate !== '' &&
          !isEmpty(selectedDevices) &&
          !isEmpty(pollutants) &&
          fileType &&
          fileType.value &&
          frequency &&
          frequency.value &&
          outputFormat &&
          dataType
        ) || loading
      );
    }

    if (exportType === 'airqlouds') {
      return (
        !(
          startDate !== '' &&
          endDate !== '' &&
          !isEmpty(selectedAirqlouds) &&
          !isEmpty(pollutants) &&
          fileType &&
          fileType.value &&
          frequency &&
          frequency.value &&
          outputFormat &&
          dataType
        ) || loading
      );
    }

    if (exportType === 'regions') {
      return (
        !(
          startDate !== '' &&
          endDate !== '' &&
          !isEmpty(selectedRegions) &&
          !isEmpty(pollutants) &&
          fileType &&
          fileType.value &&
          frequency &&
          frequency.value &&
          outputFormat &&
          dataType
        ) || loading
      );
    }
  };

  // Function to export data as a file
  const exportData = (data, fileName, type) => {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadDataFunc = async (body) => {
    try {
      const response = await downloadDataApi(body);

      // Handle successful response
      let filename = `airquality-data.${fileType.value}`;

      // Check if response has data
      if (response) {
        if (fileType.value === 'csv') {
          if (typeof response !== 'string') {
            throw new Error('Invalid CSV data format.');
          }
          exportData(response, filename, 'text/csv;charset=utf-8;');
        }

        if (fileType.value === 'json') {
          const jsonString = JSON.stringify(response.data);
          exportData(jsonString, filename, 'application/json');
        }

        dispatch(
          updateMainAlert({
            message: 'Air quality data download successful',
            show: true,
            severity: 'success'
          })
        );
      } else {
        // Handle empty response
        dispatch(
          updateMainAlert({
            message: 'No data found for the selected parameters',
            show: true,
            severity: 'info'
          })
        );
      }
    } catch (err) {
      let errorMessage;

      if (err.response) {
        if (err.response.status >= 500) {
          errorMessage = 'An error occurred. Please try again later';
        } else if (err.response.data) {
          if (err.response.data.status === 'success') {
            dispatch(
              updateMainAlert({
                message: 'No data found for the selected parameters',
                show: true,
                severity: 'info'
              })
            );
            return;
          }
          errorMessage =
            typeof err.response.data.message === 'string'
              ? err.response.data.message
              : 'An error occurred while downloading data';
        }
      } else if (err.request) {
        // Request made but no response
        errorMessage = 'No response received from server';
      } else {
        // Something else went wrong
        errorMessage = 'An error occurred while downloading data';
      }

      dispatch(
        updateMainAlert({
          message: errorMessage,
          show: true,
          severity: 'error'
        })
      );
    } finally {
      // Always reset loading state
      setLoading(false);
    }
  };

  const submitExportData = (e) => {
    setLoading(true);

    let sitesList = [];

    if (!isEmpty(selectedRegions)) {
      sitesList = extractSiteIds(selectedRegions);
    }

    if (!isEmpty(selectedSites)) {
      sitesList = getValues(selectedSites);
    }

    if (startDate > endDate) {
      dispatch(
        updateMainAlert({
          message: 'Start date cannot be newer than the end date',
          show: true,
          severity: 'error'
        })
      );

      setLoading(false);
      return;
    }

    const Difference_In_Time = new Date(endDate).getTime() - new Date(startDate).getTime();
    const Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

    if (Difference_In_Days > 28) {
      setSnackbarMessage(
        'For time periods greater than a month, please reduce the time difference to a week to avoid timeouts!'
      );
      handleClickSnackbar();
    }

    let body = {
      startDateTime: roundToStartOfDay(new Date(startDate).toISOString()),
      endDateTime: roundToEndOfDay(new Date(endDate).toISOString()),
      sites: sitesList,
      device_names: getValues(selectedDevices),
      airqlouds: getValues(selectedAirqlouds),
      network: activeNetwork.net_name,
      datatype: dataType.value,
      pollutants: getValues(pollutants),
      frequency: frequency.value,
      downloadType: fileType.value,
      outputFormat: outputFormat.value,
      minimum: true
    };

    downloadDataFunc(body);
  };

  // this is an array of the title and description for the features to be explained
  const steps = [
    {
      title: 'Date Field',
      description:
        'Use this field to select a date for your data. Click the calendar icon and choose a date from the pop-up calendar.'
    },
    {
      title: 'Export Options',
      description:
        'Download your data using the schedule option. This is useful for large time spans (more than a month). Avoid delays and have your data ready for download when processed.'
    }
  ];

  const classNames = ['step-1', 'step-2'];

  return (
    <ErrorBoundary>
      <Tutorial
        classNames={classNames}
        steps={steps}
        overlay={false}
        textBoxColor="#fff"
        textColor="#000"
        tutorialId="ExportData"
      />

      <div className={classes.root}>
        <ExportDataBreadCrumb title="Export Options" paddingBottom={'5px'} />
        <Box
          textAlign={'start'}
          paddingBottom={'12px'}
          color={'grey.700'}
          fontSize={'14px'}
          fontWeight={300}
        >
          Customize the data you want to download. We recommend downloading data for shorter time
          periods like a week or a month to avoid timeouts.
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Card
              {...rest}
              className={clsx(classes.root, className)}
              style={{
                overflow: 'visible'
              }}
            >
              <Tabs
                value={value}
                onChange={handleChangeTabPanel}
                textColor="primary"
                indicatorColor="primary"
                variant="scrollable"
                scrollButtons="on"
                classes={{
                  root: classes.tabs, // Apply custom styles to the root element
                  indicator: classes.indicator // Apply custom styles to the indicator element
                }}
              >
                <Tab disableTouchRipple label="Export by Sites" {...a11yProps(0)} />
                <Tab disableTouchRipple label="Export by Devices" {...a11yProps(1)} />
                <Tab disableTouchRipple label="Export by AirQlouds" {...a11yProps(2)} />
                <Tab disableTouchRipple label="Export by Regions" {...a11yProps(3)} />
              </Tabs>

              <TabPanel value={value} index={0}>
                <form onSubmit={submitExportData}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item md={6} xs={12}>
                        <TextField
                          label="Start Date"
                          className="step-1"
                          fullWidth
                          variant="outlined"
                          value={startDate}
                          InputLabelProps={{ shrink: true }}
                          type="date"
                          onChange={(event) => setStartDate(event.target.value)}
                        />
                      </Grid>
                      <Grid item md={6} xs={12}>
                        <TextField
                          label="End Date"
                          fullWidth
                          variant="outlined"
                          value={endDate}
                          InputLabelProps={{ shrink: true }}
                          type="date"
                          onChange={(event) => setEndDate(event.target.value)}
                        />
                      </Grid>

                      <Grid item md={6} xs={12}>
                        <Select
                          fullWidth
                          name="location"
                          placeholder="Select Site(s)"
                          value={selectedSites}
                          options={siteOptions}
                          onChange={(options) => setSelectedSites(options)}
                          isMulti
                          variant="outlined"
                          margin="dense"
                          required
                        />
                      </Grid>

                      <Grid item md={6} xs={12}>
                        <Select
                          fullWidth
                          label="Frequency"
                          name="chart-frequency"
                          placeholder="Frequency"
                          value={frequency}
                          options={frequencyOptions}
                          onChange={(options) => setFrequency(options)}
                          variant="outlined"
                          margin="dense"
                          required
                        />
                      </Grid>
                      <Grid item md={6} xs={12}>
                        <Select
                          fullWidth
                          label="Pollutant"
                          className="reactSelect"
                          name="pollutant"
                          placeholder="Pollutant(s)"
                          value={pollutants}
                          options={pollutantOptions}
                          onChange={(options) => setPollutants(options)}
                          isMulti
                          variant="outlined"
                          margin="dense"
                          required
                        />
                      </Grid>

                      <Grid item md={6} xs={12}>
                        <Select
                          fullWidth
                          label="File Type"
                          className="reactSelect"
                          name="file-type"
                          placeholder="File Type"
                          value={fileType}
                          options={typeOptions}
                          onChange={(options) => setFileType(options)}
                          variant="outlined"
                          margin="dense"
                          required
                        />
                      </Grid>

                      <Grid item md={6} xs={12}>
                        <Select
                          fullWidth
                          label="File Output Standard"
                          className="reactSelect"
                          name="file-output-format"
                          placeholder="File Output Standard"
                          value={outputFormat}
                          options={typeOutputFormatOptions}
                          onChange={(options) => setOutputFormat(options)}
                          variant="outlined"
                          margin="dense"
                          required
                        />
                      </Grid>

                      <Grid item md={6} xs={12}>
                        <Select
                          fullWidth
                          label="Data Type"
                          className="reactSelect"
                          name="data-type"
                          placeholder="Data Type"
                          value={dataType}
                          options={dataTypeOptions}
                          onChange={(options) => setDataType(options)}
                          variant="outlined"
                          margin="dense"
                          required
                        />
                      </Grid>
                    </Grid>
                  </CardContent>

                  <Divider />
                  <CardActions>
                    <Box
                      display={{
                        xs: 'block',
                        md: 'flex'
                      }}
                      justifyContent="center"
                      width={'100%'}
                      className="step-2"
                    >
                      <Button
                        color="primary"
                        variant="contained"
                        type="submit"
                        style={{ marginRight: '15px' }}
                        disabled={disableDownloadBtn('sites')}
                      >
                        {' '}
                        {loading ? 'Downloading Data...' : 'Download Data'}
                      </Button>
                      <Button
                        color="primary"
                        variant="outlined"
                        onClick={clearExportData}
                        style={{ marginRight: '15px' }}
                      >
                        {' '}
                        Reset
                      </Button>
                    </Box>
                  </CardActions>
                  {!loading && disableDownloadBtn('sites') && (
                    <p style={{ marginTop: '10px', color: 'red' }}>
                      {`Please fill in all the required fields`}
                    </p>
                  )}
                </form>
              </TabPanel>

              <TabPanel value={value} index={1}>
                <form onSubmit={submitExportData}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item md={6} xs={12}>
                        <TextField
                          label="Start Date"
                          className="reactSelect"
                          fullWidth
                          variant="outlined"
                          value={startDate}
                          InputLabelProps={{ shrink: true }}
                          type="date"
                          onChange={(event) => setStartDate(event.target.value)}
                        />
                      </Grid>

                      <Grid item md={6} xs={12}>
                        <TextField
                          label="End Date"
                          className="reactSelect"
                          fullWidth
                          variant="outlined"
                          value={endDate}
                          InputLabelProps={{ shrink: true }}
                          type="date"
                          onChange={(event) => setEndDate(event.target.value)}
                        />
                      </Grid>

                      <Grid item md={6} xs={12}>
                        <Select
                          fullWidth
                          label="Device Name"
                          className="reactSelect"
                          name="device-name"
                          placeholder="Select Device(s)"
                          value={selectedDevices}
                          options={deviceOptions}
                          onChange={(options) => setSelectedDevices(options)}
                          variant="outlined"
                          margin="dense"
                          isMulti
                          required
                        />
                      </Grid>

                      <Grid item md={6} xs={12}>
                        <Select
                          fullWidth
                          label="Frequency"
                          className=""
                          name="chart-frequency"
                          placeholder="Frequency"
                          value={frequency}
                          options={frequencyOptions}
                          onChange={(options) => setFrequency(options)}
                          variant="outlined"
                          margin="dense"
                          required
                        />
                      </Grid>
                      <Grid item md={6} xs={12}>
                        <Select
                          fullWidth
                          label="Pollutant"
                          className="reactSelect"
                          name="pollutant"
                          placeholder="Pollutant(s)"
                          value={pollutants}
                          options={pollutantOptions}
                          onChange={(options) => setPollutants(options)}
                          isMulti
                          variant="outlined"
                          margin="dense"
                          required
                        />
                      </Grid>

                      <Grid item md={6} xs={12}>
                        <Select
                          fullWidth
                          label="File Type"
                          className="reactSelect"
                          name="file-type"
                          placeholder="File Type"
                          value={fileType}
                          options={typeOptions}
                          onChange={(options) => setFileType(options)}
                          variant="outlined"
                          margin="dense"
                          required
                        />
                      </Grid>

                      <Grid item md={6} xs={12}>
                        <Select
                          fullWidth
                          label="File Output Standard"
                          className="reactSelect"
                          name="file-output-format"
                          placeholder="File Output Standard"
                          value={outputFormat}
                          options={typeOutputFormatOptions}
                          onChange={(options) => setOutputFormat(options)}
                          variant="outlined"
                          margin="dense"
                          required
                        />
                      </Grid>

                      <Grid item md={6} xs={12}>
                        <Select
                          fullWidth
                          label="Data Type"
                          className="reactSelect"
                          name="data-type"
                          placeholder="Data Type"
                          value={dataType}
                          options={dataTypeOptions}
                          onChange={(options) => setDataType(options)}
                          variant="outlined"
                          margin="dense"
                          required
                        />
                      </Grid>
                    </Grid>
                  </CardContent>

                  <Divider />
                  <CardActions>
                    <Box
                      display={{
                        xs: 'block',
                        md: 'flex'
                      }}
                      justifyContent="center"
                      width={'100%'}
                      className="step-2"
                    >
                      <Button
                        color="primary"
                        variant="contained"
                        type="submit"
                        style={{ marginRight: '15px' }}
                        disabled={disableDownloadBtn('devices')}
                      >
                        {' '}
                        {loading ? 'Downloading Data...' : 'Download Data'}
                      </Button>
                      <Button
                        color="primary"
                        variant="outlined"
                        onClick={clearExportData}
                        style={{ marginRight: '15px' }}
                      >
                        {' '}
                        Reset
                      </Button>
                    </Box>
                  </CardActions>
                  {!loading && disableDownloadBtn('devices') && (
                    <p style={{ marginTop: '10px', color: 'red' }}>
                      {`Please fill in all the required fields`}
                    </p>
                  )}
                </form>
              </TabPanel>

              <TabPanel value={value} index={2}>
                <form onSubmit={submitExportData}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item md={6} xs={12}>
                        <TextField
                          label="Start Date"
                          className="reactSelect"
                          fullWidth
                          variant="outlined"
                          value={startDate}
                          InputLabelProps={{ shrink: true }}
                          type="date"
                          onChange={(event) => setStartDate(event.target.value)}
                        />
                      </Grid>

                      <Grid item md={6} xs={12}>
                        <TextField
                          label="End Date"
                          className="reactSelect"
                          fullWidth
                          variant="outlined"
                          value={endDate}
                          InputLabelProps={{ shrink: true }}
                          type="date"
                          onChange={(event) => setEndDate(event.target.value)}
                        />
                      </Grid>

                      <Grid item md={6} xs={12}>
                        <Select
                          fullWidth
                          className="reactSelect"
                          name="airqloud"
                          placeholder="Select AirQloud(s)"
                          value={selectedAirqlouds}
                          options={airqloudOptions}
                          onChange={(options) => setSelectedAirqlouds(options)}
                          isMulti
                          variant="outlined"
                          margin="dense"
                          required
                        />
                      </Grid>

                      <Grid item md={6} xs={12}>
                        <Select
                          fullWidth
                          label="Frequency"
                          className=""
                          name="chart-frequency"
                          placeholder="Frequency"
                          value={frequency}
                          options={frequencyOptions}
                          onChange={(options) => setFrequency(options)}
                          variant="outlined"
                          margin="dense"
                          required
                        />
                      </Grid>
                      <Grid item md={6} xs={12}>
                        <Select
                          fullWidth
                          label="Pollutant"
                          className="reactSelect"
                          name="pollutant"
                          placeholder="Pollutant(s)"
                          value={pollutants}
                          options={pollutantOptions}
                          onChange={(options) => setPollutants(options)}
                          isMulti
                          variant="outlined"
                          margin="dense"
                          required
                        />
                      </Grid>

                      <Grid item md={6} xs={12}>
                        <Select
                          fullWidth
                          label="File Type"
                          className="reactSelect"
                          name="file-type"
                          placeholder="File Type"
                          value={fileType}
                          options={typeOptions}
                          onChange={(options) => setFileType(options)}
                          variant="outlined"
                          margin="dense"
                          required
                        />
                      </Grid>

                      <Grid item md={6} xs={12}>
                        <Select
                          fullWidth
                          label="File Output Standard"
                          className="reactSelect"
                          name="file-output-format"
                          placeholder="File Output Standard"
                          value={outputFormat}
                          options={typeOutputFormatOptions}
                          onChange={(options) => setOutputFormat(options)}
                          variant="outlined"
                          margin="dense"
                          required
                        />
                      </Grid>

                      <Grid item md={6} xs={12}>
                        <Select
                          fullWidth
                          label="Data Type"
                          className="reactSelect"
                          name="data-type"
                          placeholder="Data Type"
                          value={dataType}
                          options={dataTypeOptions}
                          onChange={(options) => setDataType(options)}
                          variant="outlined"
                          margin="dense"
                          required
                        />
                      </Grid>
                    </Grid>
                  </CardContent>

                  <Divider />
                  <CardActions>
                    <Box
                      display={{
                        xs: 'block',
                        md: 'flex'
                      }}
                      justifyContent="center"
                      width={'100%'}
                      className="step-2"
                    >
                      <Button
                        color="primary"
                        variant="contained"
                        type="submit"
                        style={{ marginRight: '15px' }}
                        disabled={disableDownloadBtn('airqlouds')}
                      >
                        {' '}
                        {loading ? 'Downloading Data...' : 'Download Data'}
                      </Button>
                      <Button
                        color="primary"
                        variant="outlined"
                        onClick={clearExportData}
                        style={{ marginRight: '15px' }}
                      >
                        {' '}
                        Reset
                      </Button>
                    </Box>
                  </CardActions>
                  {!loading && disableDownloadBtn('airqlouds') && (
                    <p style={{ marginTop: '10px', color: 'red' }}>
                      {`Please fill in all the required fields`}
                    </p>
                  )}
                </form>
              </TabPanel>

              <TabPanel value={value} index={3}>
                <form onSubmit={submitExportData}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item md={6} xs={12}>
                        <TextField
                          label="Start Date"
                          className="reactSelect"
                          fullWidth
                          variant="outlined"
                          value={startDate}
                          InputLabelProps={{ shrink: true }}
                          type="date"
                          onChange={(event) => setStartDate(event.target.value)}
                        />
                      </Grid>

                      <Grid item md={6} xs={12}>
                        <TextField
                          label="End Date"
                          className="reactSelect"
                          fullWidth
                          variant="outlined"
                          value={endDate}
                          InputLabelProps={{ shrink: true }}
                          type="date"
                          onChange={(event) => setEndDate(event.target.value)}
                        />
                      </Grid>

                      <Grid item md={6} xs={12}>
                        <Select
                          fullWidth
                          className="reactSelect"
                          name="region"
                          placeholder="Select Region(s)"
                          value={selectedRegions}
                          options={regionOptions}
                          onChange={(options) => setSelectedRegions(options)}
                          isMulti
                          variant="outlined"
                          margin="dense"
                          required
                        />
                      </Grid>

                      <Grid item md={6} xs={12}>
                        <Select
                          fullWidth
                          label="Frequency"
                          className=""
                          name="chart-frequency"
                          placeholder="Frequency"
                          value={frequency}
                          options={frequencyOptions}
                          onChange={(options) => setFrequency(options)}
                          variant="outlined"
                          margin="dense"
                          required
                        />
                      </Grid>
                      <Grid item md={6} xs={12}>
                        <Select
                          fullWidth
                          label="Pollutant"
                          className="reactSelect"
                          name="pollutant"
                          placeholder="Pollutant(s)"
                          value={pollutants}
                          options={pollutantOptions}
                          onChange={(options) => setPollutants(options)}
                          isMulti
                          variant="outlined"
                          margin="dense"
                          required
                        />
                      </Grid>

                      <Grid item md={6} xs={12}>
                        <Select
                          fullWidth
                          label="File Type"
                          className="reactSelect"
                          name="file-type"
                          placeholder="File Type"
                          value={fileType}
                          options={typeOptions}
                          onChange={(options) => setFileType(options)}
                          variant="outlined"
                          margin="dense"
                          required
                        />
                      </Grid>

                      <Grid item md={6} xs={12}>
                        <Select
                          fullWidth
                          label="File Output Standard"
                          className="reactSelect"
                          name="file-output-format"
                          placeholder="File Output Standard"
                          value={outputFormat}
                          options={typeOutputFormatOptions}
                          onChange={(options) => setOutputFormat(options)}
                          variant="outlined"
                          margin="dense"
                          required
                        />
                      </Grid>

                      <Grid item md={6} xs={12}>
                        <Select
                          fullWidth
                          label="Data Type"
                          className="reactSelect"
                          name="data-type"
                          placeholder="Data Type"
                          value={dataType}
                          options={dataTypeOptions}
                          onChange={(options) => setDataType(options)}
                          variant="outlined"
                          margin="dense"
                          required
                        />
                      </Grid>
                    </Grid>
                  </CardContent>

                  <Divider />
                  <CardActions>
                    <Box
                      display={{
                        xs: 'block',
                        md: 'flex'
                      }}
                      justifyContent="center"
                      width={'100%'}
                      className="step-2"
                    >
                      <Button
                        color="primary"
                        variant="contained"
                        type="submit"
                        style={{ marginRight: '15px' }}
                        disabled={disableDownloadBtn('regions')}
                      >
                        {' '}
                        {loading ? 'Downloading Data...' : 'Download Data'}
                      </Button>
                      <Button
                        color="primary"
                        variant="outlined"
                        onClick={clearExportData}
                        style={{ marginRight: '15px' }}
                      >
                        {' '}
                        Reset
                      </Button>
                    </Box>
                  </CardActions>
                  {!loading && disableDownloadBtn('regions') && (
                    <p style={{ marginTop: '10px', color: 'red' }}>
                      {`Please fill in all the required fields`}
                    </p>
                  )}
                </form>
              </TabPanel>
            </Card>
          </Grid>
        </Grid>

        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center'
          }}
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          message={snackbarMessage}
          action={
            <React.Fragment>
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={handleClickSnackbar}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </React.Fragment>
          }
        />
      </div>
    </ErrorBoundary>
  );
};

ExportData.propTypes = {
  className: PropTypes.string
};

export default ExportData;
