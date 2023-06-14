import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/styles';
import {
  Grid,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Divider,
  CircularProgress,
  Tabs,
  Tab
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import Select from 'react-select';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import TextField from '@material-ui/core/TextField';
import { isEmpty } from 'underscore';
import Papa from 'papaparse';
import moment from 'moment';
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
      label: `${airqloud.long_name} | ${airqloud.sites.length} sites`
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

const Download = (props) => {
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
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [pollutants, setPollutants] = useState([]);
  const [frequency, setFrequency] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [outputFormat, setOutputFormat] = useState(null);

  // Tabs
  const [value, setValue] = useState(0);

  const frequencyOptions = [
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' },
    { value: 'raw', label: 'Raw' }
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
    if (isEmpty(sites)) dispatch(loadSites());
  }, []);

  useEffect(() => {
    if (isEmpty(deviceRegistrySites)) {
      const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork'));
      if (!isEmpty(activeNetwork)) {
        dispatch(loadSitesData(activeNetwork.net_name));
      }
    }
  }, []);

  useEffect(() => {
    if (isEmpty(deviceList)) {
      const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork'));
      if (!isEmpty(activeNetwork)) {
        dispatch(loadDevicesData(activeNetwork.net_name));
      }
    }
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
    if (isEmpty(airqlouds)) {
      dispatch(fetchDashboardAirQloudsData());
    }
  }, []);

  useEffect(() => {
    setRegionOptions(groupSitesByRegion(deviceRegistrySiteOptions));
  }, [deviceRegistrySiteOptions]);

  const disableDownloadBtn = (exportType) => {
    if (exportType === 'sites') {
      return (
        !(
          startDate &&
          endDate &&
          !isEmpty(selectedSites) &&
          fileType &&
          fileType.value &&
          frequency &&
          frequency.value &&
          outputFormat
        ) || loading
      );
    }

    if (exportType === 'devices') {
      return (
        !(
          startDate &&
          endDate &&
          !isEmpty(selectedDevices) &&
          !isEmpty(pollutants) &&
          fileType &&
          fileType.value &&
          frequency &&
          frequency.value &&
          outputFormat
        ) || loading
      );
    }

    if (exportType === 'airqlouds') {
      return (
        !(
          startDate &&
          endDate &&
          !isEmpty(selectedAirqlouds) &&
          !isEmpty(pollutants) &&
          fileType &&
          fileType.value &&
          frequency &&
          frequency.value &&
          outputFormat
        ) || loading
      );
    }

    if (exportType === 'regions') {
      return (
        !(
          startDate &&
          endDate &&
          !isEmpty(selectedRegions) &&
          !isEmpty(pollutants) &&
          fileType &&
          fileType.value &&
          frequency &&
          frequency.value &&
          outputFormat
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
    await downloadDataApi(body)
      .then((response) => response.data)
      .then((resData) => {
        let filename = `airquality-data.${fileType.value}`;

        if (fileType.value === 'json') {
          const jsonString = JSON.stringify(resData);
          exportData(jsonString, filename, 'application/json');
        }

        if (fileType.value === 'csv') {
          // Convert JSON data to CSV using Papa Parse
          const csvData = Papa.unparse(resData);
          exportData(csvData, filename, 'text/csv;charset=utf-8;');
        }

        setLoading(false);
        setStartDate(null);
        setEndDate(null);
        setFileType(null);
        setSelectedAirqlouds([]);
        setSelectedDevices([]);
        setSelectedSites([]);
        setSelectedRegions([]);
        setPollutants([]);
        setOutputFormat(null);
        setFrequency(null);
        dispatch(
          updateMainAlert({
            message: 'Air quality data download successful',
            show: true,
            severity: 'success'
          })
        );
      })
      .catch((err) => {
        if (err.response.data.status === 'success') {
          dispatch(
            updateMainAlert({
              message: 'Uh-oh! No data found for the selected parameters.',
              show: true,
              severity: 'success'
            })
          );
        } else {
          dispatch(
            updateMainAlert({
              message: err.response.data.message,
              show: true,
              severity: 'error'
            })
          );
        }

        setLoading(false);
        setStartDate(null);
        setEndDate(null);
        setFileType(null);
        setSelectedAirqlouds([]);
        setSelectedDevices([]);
        setSelectedSites([]);
        setSelectedRegions([]);
        setPollutants([]);
        setOutputFormat(null);
        setFrequency(null);
      });
  };

  const exportDataBySite = (e) => {
    e.preventDefault();

    setLoading(true);

    let data = {
      sites: getValues(selectedSites),
      startDateTime: roundToStartOfDay(new Date(startDate).toISOString()),
      endDateTime: roundToEndOfDay(new Date(endDate).toISOString()),
      frequency: frequency.value,
      pollutants: getValues(pollutants),
      downloadType: 'json',
      outputFormat: outputFormat.value
    };

    downloadDataFunc(data);
  };

  const exportDataByDevice = (e) => {
    e.preventDefault();

    setLoading(true);

    let body = {
      devices: getValues(selectedDevices),
      startDateTime: roundToStartOfDay(new Date(startDate).toISOString()),
      endDateTime: roundToEndOfDay(new Date(endDate).toISOString()),
      frequency: frequency.value,
      pollutants: getValues(pollutants),
      downloadType: 'json',
      outputFormat: outputFormat.value
    };

    downloadDataFunc(body);
  };

  const exportDataByAirqloud = (e) => {
    e.preventDefault();

    setLoading(true);

    let body = {
      airqlouds: getValues(selectedAirqlouds),
      startDateTime: roundToStartOfDay(new Date(startDate).toISOString()),
      endDateTime: roundToEndOfDay(new Date(endDate).toISOString()),
      frequency: frequency.value,
      pollutants: getValues(pollutants),
      downloadType: 'json',
      outputFormat: outputFormat.value
    };

    downloadDataFunc(body);
  };

  const exportDataByRegion = (e) => {
    e.preventDefault();

    setLoading(true);

    let data = {
      sites: extractSiteIds(selectedRegions),
      startDateTime: roundToStartOfDay(new Date(startDate).toISOString()),
      endDateTime: roundToEndOfDay(new Date(endDate).toISOString()),
      frequency: frequency.value,
      pollutants: getValues(pollutants),
      downloadType: 'json',
      outputFormat: outputFormat.value
    };

    downloadDataFunc(data);
  };

  return (
    <ErrorBoundary>
      <div className={classes.root}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Card
              {...rest}
              className={clsx(classes.root, className)}
              style={{ overflow: 'visible' }}
            >
              <CardHeader
                subheader="Customize the data you want to download."
                title="Data Download"
              />

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
                <form onSubmit={exportDataBySite}>
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
                    </Grid>
                  </CardContent>

                  <Divider />
                  <CardActions>
                    <span style={{ position: 'relative' }}>
                      <Button
                        color="primary"
                        variant="outlined"
                        type="submit"
                        disabled={disableDownloadBtn('sites')}
                      >
                        {' '}
                        Download Data
                      </Button>
                      {loading && (
                        <CircularProgress
                          size={24}
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            marginTop: '-12px',
                            marginLeft: '-12px'
                          }}
                        />
                      )}
                    </span>
                  </CardActions>
                </form>
              </TabPanel>

              <TabPanel value={value} index={1}>
                <form onSubmit={exportDataByDevice}>
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
                    </Grid>
                  </CardContent>

                  <Divider />
                  <CardActions>
                    <span style={{ position: 'relative' }}>
                      <Button
                        color="primary"
                        variant="outlined"
                        type="submit"
                        disabled={disableDownloadBtn('devices')}
                      >
                        {' '}
                        Download Data
                      </Button>
                      {loading && (
                        <CircularProgress
                          size={24}
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            marginTop: '-12px',
                            marginLeft: '-12px'
                          }}
                        />
                      )}
                    </span>
                  </CardActions>
                </form>
              </TabPanel>

              <TabPanel value={value} index={2}>
                <form onSubmit={exportDataByAirqloud}>
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
                    </Grid>
                  </CardContent>

                  <Divider />
                  <CardActions>
                    <span style={{ position: 'relative' }}>
                      <Button
                        color="primary"
                        variant="outlined"
                        type="submit"
                        disabled={disableDownloadBtn('airqlouds')}
                      >
                        {' '}
                        Download Data
                      </Button>
                      {loading && (
                        <CircularProgress
                          size={24}
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            marginTop: '-12px',
                            marginLeft: '-12px'
                          }}
                        />
                      )}
                    </span>
                  </CardActions>
                </form>
              </TabPanel>

              <TabPanel value={value} index={3}>
                <form onSubmit={exportDataByRegion}>
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
                    </Grid>
                  </CardContent>

                  <Divider />
                  <CardActions>
                    <span style={{ position: 'relative' }}>
                      <Button
                        color="primary"
                        variant="outlined"
                        type="submit"
                        disabled={disableDownloadBtn('regions')}
                      >
                        {' '}
                        Download Data
                      </Button>
                      {loading && (
                        <CircularProgress
                          size={24}
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            marginTop: '-12px',
                            marginLeft: '-12px'
                          }}
                        />
                      )}
                    </span>
                  </CardActions>
                </form>
              </TabPanel>
            </Card>
          </Grid>
        </Grid>
      </div>
    </ErrorBoundary>
  );
};

Download.propTypes = {
  className: PropTypes.string
};

export default Download;
