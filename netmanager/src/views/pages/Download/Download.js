import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/styles";
import {
  Grid,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Divider,
} from "@material-ui/core";
import Select from "react-select";
import PropTypes from "prop-types";
import clsx from "clsx";
import DateFnsUtils from "@date-io/date-fns";
import TextField from "@material-ui/core/TextField";
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import axios from "axios";
import { DOWNLOAD_DATA } from "config/urls/analytics";
import { getMonitoringSitesLocationsApi } from "../../apis/location";
import { isEmpty } from "underscore";

const {
  Parser,
  transforms: { unwind },
} = require("json2csv");

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(4),
  },
}));

const Download = (props) => {
  const { className, staticContext, ...rest } = props;
  const classes = useStyles();

  var startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 1);
  startDate.setHours(0, 0, 0, 0);

  const [selectedDate, setSelectedStartDate] = useState(startDate);
  const handleDateChange = (date) => {
    setSelectedStartDate(date);
  };

  const [selectedEndDate, setSelectedEndDate] = useState(new Date());
  const handleEndDateChange = (date) => {
    setSelectedEndDate(date);
  };

  const [filterLocations, setFilterLocations] = useState([]);

  useEffect(() => {
    getMonitoringSitesLocationsApi()
      .then((responseData) =>
        setFilterLocations(responseData.airquality_monitoring_sites)
      )
      .catch((err) => console.log(err));
  }, []);

  const filterLocationsOptions = filterLocations;

  const [values, setReactSelectValue] = useState({ selectedOption: [] });

  const handleMultiChange = (selectedOption) => {
    setReactSelectValue({ selectedOption });
  };

  const frequencyOptions = [
    { value: "hourly", label: "Hourly" },
    { value: "daily", label: "Daily" },
    { value: "monthly", label: "Monthly" },
  ];

  const [selectedFrequency, setSelectedFrequency] = useState();

  const handleFrequencyChange = (selectedFrequencyOption) => {
    setSelectedFrequency(selectedFrequencyOption);
  };

  const pollutantOptions = [
    { value: "pm2_5", label: "PM 2.5" },
    { value: "pm10", label: "PM 10" },
    { value: "no2", label: "NO2" },
  ];

  const [selectedPollutant, setSelectedPollutant] = useState([]);

  const handlePollutantChange = (selectedPollutantOption) => {
    setSelectedPollutant(selectedPollutantOption);
  };

  const typeOptions = [
    { value: "json", label: "JSON" },
    { value: "csv", label: "CSV" },
  ];

  const [selectedType, setSelectedType] = useState();

  const handleTypeChange = (selectedTypeOption) => {
    setSelectedType(selectedTypeOption);
  };

  const disableDownloadBtn = () => {
    return !(
      values &&
      !isEmpty(values.selectedOption) &&
      !isEmpty(selectedPollutant) &&
      selectedType &&
      selectedType.value &&
      selectedFrequency &&
      selectedFrequency.value
    );
  };

  let handleSubmit = (e) => {
    e.preventDefault();

    let params = {
      locations: values.selectedOption,
      startDate: selectedDate,
      endDate: selectedEndDate,
      frequency: selectedFrequency.value,
      pollutants: selectedPollutant,
      fileType: selectedType.value,
    };
    console.log(JSON.stringify(params));

    axios
      .post(DOWNLOAD_DATA + selectedType.value, JSON.stringify(params), {
        headers: { "Content-Type": "application/json" },
      })
      .then((res) => res.data)
      .then((customisedDownloadData) => {
        // setCustomisedDownloadData(customisedDownloadData)
        //download the returned data
        console.log(JSON.stringify(customisedDownloadData));
        if (selectedType.value === "json") {
          let filename = "airquality-data-" + selectedFrequency.value + ".json";
          let contentType = "application/json;charset=utf-8;";
          if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            var blob = new Blob(
              [
                decodeURIComponent(
                  encodeURI(JSON.stringify(customisedDownloadData))
                ),
              ],
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
              encodeURIComponent(JSON.stringify(customisedDownloadData));
            a.target = "_blank";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
        } else {
          const json2csvParser = new Parser();
          const csv = json2csvParser.parse(customisedDownloadData);
          console.log(csv);
          var filename = "airquality-data-" + selectedFrequency.value + ".csv";
          var link = document.createElement("a");
          link.setAttribute(
            "href",
            "data:text/csv;charset=utf-8,%EF%BB%BF" + encodeURIComponent(csv)
          );
          link.setAttribute("download", filename);
          link.style.visibility = "hidden";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      })
      .catch(console.log);
  };
  return (
    <div className={classes.root}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Card {...rest} className={clsx(classes.root, className)} style={{overflow: "visible"}}>
            <CardHeader
              subheader="Customize the data you want to download."
              title="Data Download"
            />

            <Divider />
            <form onSubmit={handleSubmit}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item md={6} xs={12}>
                    <TextField
                      label="Start Date"
                      className="reactSelect"
                      fullWidth
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                      type="date"
                      // defaultValue={new Date().toLocaleDateString()}
                      defaultValue={"2021-07-20"}
                    />
                  </Grid>

                  <Grid item md={6} xs={12}>
                    <TextField
                      label="End Date"
                      className="reactSelect"
                      fullWidth
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                      type="date"
                      // defaultValue={new Date().toLocaleDateString()}
                      defaultValue={"2021-07-20"}
                    />
                  </Grid>

                  <Grid item md={6} xs={12}>
                    <Select
                      fullWidth
                      className="reactSelect"
                      name="location"
                      placeholder="Location(s)"
                      value={values.selectedOption}
                      options={filterLocationsOptions}
                      onChange={handleMultiChange}
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
                      value={selectedFrequency}
                      options={frequencyOptions}
                      onChange={handleFrequencyChange}
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
                      value={values.selectedPollutant}
                      options={pollutantOptions}
                      onChange={handlePollutantChange}
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
                      value={selectedType}
                      options={typeOptions}
                      onChange={handleTypeChange}
                      variant="outlined"
                      margin="dense"
                      required
                    />
                  </Grid>
                </Grid>
              </CardContent>

              <Divider />
              <CardActions>
                <Button
                  color="primary"
                  variant="outlined"
                  type="submit"
                  disabled={disableDownloadBtn()}
                >
                  {" "}
                  Download Data
                </Button>
              </CardActions>
            </form>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

Download.propTypes = {
  className: PropTypes.string,
};

export default Download;
