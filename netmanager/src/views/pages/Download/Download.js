import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { makeStyles } from "@material-ui/styles";
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
  Tab,
} from "@material-ui/core";
import Select from "react-select";
import PropTypes from "prop-types";
import clsx from "clsx";
import TextField from "@material-ui/core/TextField";
import { isEmpty } from "underscore";
import moment from "moment";
import { useDashboardSitesData } from "redux/Dashboard/selectors";
import { loadSites } from "redux/Dashboard/operations";
import { downloadDataApi } from "views/apis/analytics";
import { roundToStartOfDay, roundToEndOfDay } from "utils/dateTime";
import { updateMainAlert } from "redux/MainAlert/operations";
import { useInitScrollTop, usePollutantsOptions } from "utils/customHooks";
import ErrorBoundary from "views/ErrorBoundary/ErrorBoundary";
import { downloadUrbanBetterDataApi } from "../../apis/analytics";

const { Parser } = require("json2csv");

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(4),
  },
}));

const createSiteOptions = (sites) => {
  const options = [];
  sites.map((site) =>
    options.push({
      value: site._id,
      label: site.name || site.description || site.generated_name,
    })
  );
  return options;
};

const getValues = (options) => {
  const values = [];
  options.map((option) => values.push(option.value));
  return values;
};

const Download = (props) => {
  useInitScrollTop();
  const { className, staticContext, ...rest } = props;
  const classes = useStyles();

  const MAX_ALLOWED_DATE_DIFF_IN_DAYS = 93;

  const dispatch = useDispatch();
  const sites = useDashboardSitesData();
  const [siteOptions, setSiteOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedSites, setSelectedSites] = useState([]);
  const [pollutants, setPollutants] = useState([]);
  const [frequency, setFrequency] = useState({
    value: "hourly",
    label: "Hourly",
  });
  const [fileType, setFileType] = useState(null);
  const [outputFormat, setOutputFormat] = useState(null);
  const [deviceNumbers, setDeviceNumbers] = useState([]);

  // Tabs
  const [value, setValue] = useState(0);

  const frequencyOptions = [
    { value: "hourly", label: "Hourly" },
    { value: "daily", label: "Daily" },
    { value: "monthly", label: "Monthly" },
  ];

  const pollutantOptions = usePollutantsOptions();

  const typeOptions = [
    { value: "json", label: "JSON" },
    { value: "csv", label: "CSV" },
    //{ value: "aqcsv", label: "AQCSV" },
  ];

  const typeOutputFormatOptions = [
    { value: "aqcsv", label: "AQCSV" },
    { value: "usual", label: "Usual" },
  ];

  const listOfDeviceNumbers = [
    {value: 20259, label: 20258},
    {value: 18559, label: 18559}
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
        {value === index && (
          <div sx={{ p: 3 }}>
            {children}
          </div>
        )}
      </div>
    );
  }

  function a11yProps(index) {
    return {
      id: `data-export-tab-${index}`,
      'aria-controls': `data-export-tabpanel-${index}`,
    };
  }

  const handleChangeTabPanel = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (isEmpty(sites)) dispatch(loadSites());
  }, []);

  useEffect(() => {
    setSiteOptions(createSiteOptions(Object.values(sites)));
  }, [sites]);

  const disableDownloadBtn = (tenant) => {
    if(tenant === "airqo") {
      return (
        !(
          startDate &&
          endDate &&
          !isEmpty(selectedSites) &&
          !isEmpty(pollutants) &&
          fileType &&
          fileType.value &&
          frequency &&
          frequency.value
        ) || loading
      );
    } else if(tenant === "urbanBetter") {
      return (
        !(
          startDate &&
          endDate &&
          fileType &&
          deviceNumbers &&
          fileType.value
        ) || loading
      );
    }
    
  };

  let handleAirqoFormSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    let data = {
      sites: getValues(selectedSites),
      startDate: roundToStartOfDay(new Date(startDate).toISOString()),
      endDate: roundToEndOfDay(new Date(endDate).toISOString()),
      frequency: frequency.value,
      pollutants: getValues(pollutants),
      fileType: fileType.value,
      fromBigQuery: true,
      outputFormat: outputFormat.value,
    };

    await downloadDataApi(fileType.value, data, fileType.value === "csv" , outputFormat.value)
      .then((response) => response.data)
      .then((resData) => {
        let filename = `airquality-${frequency.value}-data.${fileType.value}`;
        if (fileType.value === "json") {
          let contentType = "application/json;charset=utf-8;";

          if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            var blob = new Blob(
              [decodeURIComponent(encodeURI(JSON.stringify(resData)))],
              { type: contentType }
            );
            navigator.msSaveOrOpenBlob(blob, filename);
          } else {
            var a = document.createElement("a");
            a.download = filename;
            a.href =
              "data:" +
              contentType +
              "," +
              encodeURIComponent(JSON.stringify(resData));
            a.target = "_blank";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
        } else {
          const downloadUrl = window.URL.createObjectURL(resData);
          const link = document.createElement("a");

          link.href = downloadUrl;
          link.setAttribute("download", filename); //any other extension

          document.body.appendChild(link);

          link.click();
          link.remove();
        }
      })
      .catch((err) => console.log(err && err.response && err.response.data));
    setLoading(false);
    setStartDate(null);
    setEndDate(null);
    setFileType(null);
    setSelectedSites([]);
    setPollutants([]);
  };

  const handleUrbanBetterFormSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    let data = {
      startDate: roundToStartOfDay(new Date(startDate).toISOString()),
      endDate: roundToEndOfDay(new Date(endDate).toISOString()),
      device_numbers: deviceNumbers
    };

    await downloadUrbanBetterDataApi(data)
      .then((response) => response.data)
      .then((resData) => {
        console.log("Response Data", resData);
        let filename = `airquality-${frequency.value}-data.${fileType.value}`;
        if (fileType.value === "json") {
          let contentType = "application/json;charset=utf-8;";

          if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            var blob = new Blob(
              [decodeURIComponent(encodeURI(JSON.stringify(resData)))],
              { type: contentType }
            );
            navigator.msSaveOrOpenBlob(blob, filename);
          } else {
            var a = document.createElement("a");
            a.download = filename;
            a.href =
              "data:" +
              contentType +
              "," +
              encodeURIComponent(JSON.stringify(resData));
            a.target = "_blank";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
        } else {
          const downloadUrl = window.URL.createObjectURL(resData);
          const link = document.createElement("a");

          link.href = downloadUrl;
          link.setAttribute("download", filename); //any other extension

          document.body.appendChild(link);

          link.click();
          link.remove();
        }
      })
      .catch((err) => console.log(err && err.response && err.response.data));
    setLoading(false);
    setStartDate(null);
    setEndDate(null);
    setFileType(null);
  }

  return (
    <ErrorBoundary>
      <div className={classes.root}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Card
              {...rest}
              className={clsx(classes.root, className)}
              style={{ overflow: "visible" }}
            >
              <CardHeader
                subheader="Customize the data you want to download."
                title="Data Download"
              />

              <Divider />

              <Tabs 
              value={value}
              onChange={handleChangeTabPanel}
              textColor="secondary" 
              centered>
                <Tab label="AirQo data" {...a11yProps(0)} />
                <Tab label="UrbanBetter data" {...a11yProps(1)} />
              </Tabs>

              <TabPanel value={value} index={0}>
                <form onSubmit={handleAirqoFormSubmit}>
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
                          placeholder="Location(s)"
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
                          isDisabled
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
                    <span style={{ position: "relative" }}>
                      <Button
                        color="primary"
                        variant="outlined"
                        type="submit"
                        disabled={disableDownloadBtn("airqo")}
                      >
                        {" "}
                        Download Data
                      </Button>
                      {loading && (
                        <CircularProgress
                          size={24}
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            marginTop: "-12px",
                            marginLeft: "-12px",
                          }}
                        />
                      )}
                    </span>
                  </CardActions>
                </form>
              </TabPanel>

              <TabPanel value={value} index={1}>
                <form onSubmit={handleUrbanBetterFormSubmit}>
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
                          label="Device Number"
                          className="reactSelect"
                          name="device-number"
                          placeholder="Select Device Number"
                          value={deviceNumbers}
                          options={listOfDeviceNumbers}
                          onChange={(options) => setDeviceNumbers(options)}
                          variant="outlined"
                          margin="dense"
                          isMulti
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
                    </Grid>
                  </CardContent>

                  <Divider />
                  <CardActions>
                    <span style={{ position: "relative" }}>
                      <Button
                        color="primary"
                        variant="outlined"
                        type="submit"
                        disabled={disableDownloadBtn("urbanBetter")}
                      >
                        {" "}
                        Download Data
                      </Button>
                      {loading && (
                        <CircularProgress
                          size={24}
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            marginTop: "-12px",
                            marginLeft: "-12px",
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
  className: PropTypes.string,
};

export default Download;
