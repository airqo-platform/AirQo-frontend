import React, { useRef } from "react";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/styles";
import {
  Divider,
  Grid,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  TextField,
} from "@material-ui/core";
import { useEffect, useState } from "react";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import "chartjs-plugin-annotation";
import Typography from "@material-ui/core/Typography";
import { Close } from "@material-ui/icons";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import domtoimage from "dom-to-image";
import JsPDF from "jspdf";
import { isEmpty } from "underscore";
import OutlinedSelect from "views/components/CustomSelects/OutlinedSelect";
import { formatDateString } from "utils/dateTime";
import { omit } from "underscore";
import { roundToStartOfDay, roundToEndOfDay } from "utils/dateTime";
import { usePollutantsOptions } from "utils/customHooks";
import {
  deleteUserChartDefaultsApi,
  updateUserChartDefaultsApi,
} from "views/apis/authService";
import { updateMainAlert } from "redux/MainAlert/operations";
import { useCurrentAirQloudData } from "redux/AirQloud/selectors";

import ChartContainer from "./ChartContainer";

import CustomDisplayChart from "./CustomDisplayChart";
import { loadD3ChartDataApi } from "views/apis/analytics";
import moment from "moment";

const capitalize = (str) => {
  return str && str.charAt(0).toUpperCase() + str.slice(1);
};

const toValueLabelObject = (value) => {
  return { value, label: capitalize(value) };
};

const optionToList = (options) => {
  const arr = [];
  options.map((opt) => arr.push(opt.value));
  return arr;
};

const formatDate = (date) => {
  return date.toISOString().split("T")[0];
};

const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});

const pollutantLabelMapper = {
  "PM 2.5": (
    <span>
      PM<sub>2.5</sub>
    </span>
  ),
  "PM 10": (
    <span>
      PM<sub>10</sub>
    </span>
  ),
  NO2: (
    <span>
      NO<sub>2</sub>
    </span>
  ),
};

const DialogTitle = withStyles(styles)((props) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <Close />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const CustomisableChart = (props) => {
  const { className, idSuffix, defaultFilter, ...rest } = props;
  const ref = useRef();
  const dispatch = useDispatch();

  const airqloud = useCurrentAirQloudData();

  const [formState, setFormState] = useState({
    isValid: false,
    values: {},
    touched: {},
    errors: {},
  });

  const periodOptions = [
    {
      value: "Last 30 days",
      label: "Last 30 days",
      unitValue: 30,
      unit: "day",
      endDate: null,
    },
    {
      value: "Last 90 days",
      label: "Last 90 days",
      unitValue: 90,
      unit: "day",
      endDate: null,
    },
    {
      value: "Custom range",
      label: "Custom range",
      unitValue: 30,
      unit: "day",
      endDate: null,
    },
  ];

  const initialPeriod = () => {
    try {
      return JSON.parse(defaultFilter.period) || periodOptions[0];
    } catch (err) {
      return periodOptions[0];
    }
  };

  const [selectedPeriod, setSelectedPeriod] = useState(initialPeriod());
  const [disableDatePickers, setDisableDatePickers] = useState(true);
  const [loading, setLoading] = useState(true);

  const isCustomPeriod = (period) => {
    return period.label.toLowerCase() === "Custom range".toLowerCase();
  };

  const generateStartAndEndDates = (period) => {
    if (isCustomPeriod(period)) {
      return [new Date(period.startDate), new Date(period.endDate)];
    }
    let endDate = new Date();
    let startDate = moment().subtract(period.unitValue, 'days');

    return [startDate, endDate];
  };

  const handlePeriodChange = (selectedPeriodOption) => {
    if (isCustomPeriod(selectedPeriodOption)) {
      setSelectedPeriod(selectedPeriodOption);
      setDisableDatePickers(false);
      return;
    }
    const [startDate, endDate] = generateStartAndEndDates(selectedPeriodOption);
    setSelectedStartDate(startDate);
    setSelectedEndDate(endDate);
    setSelectedPeriod(selectedPeriodOption);
    setDisableDatePickers(true);
  };

  let [startDate, endDate] = generateStartAndEndDates(initialPeriod());

  const [selectedDate, setSelectedStartDate] = useState(startDate);
  const [selectedEndDate, setSelectedEndDate] = useState(endDate);

  const handleEndDateChange = (date) => {
    setSelectedEndDate(date);
  };

  const handleDateChange = (date) => {
    setSelectedStartDate(date);
  };

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
    setAnchorEl(null);
  };

  const handleClose = () => {
    setOpen(false);
    clearTempState();
  };

  const sitesOptions = airqloud.siteOptions || [];

  const siteFilter = (selectedSites) => (site) => {
    return selectedSites.includes(site.value);
  };

  const [values, setReactSelectValue] = useState({
    selectedOption: sitesOptions.filter(siteFilter(defaultFilter.sites)),
  });

  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    const sites = sitesOptions.filter(siteFilter(defaultFilter.sites));
    setReactSelectValue({
      selectedOption: sites,
    });
    setTempState({ ...tempState, sites: { selectedOption: sites } });
    if (initialLoad && !isEmpty(sites)) {
      setInitialLoad(false);
      fetchAndSetGraphData({
        sites: optionToList(sites),
        startDate: selectedDate.toISOString(),
        endDate: selectedEndDate.toISOString(),
        chartType: selectedChart.value,
        frequency: selectedFrequency.value,
        pollutant: selectedPollutant.value,
        organisation_name: "KCCA",
      });
    }
  }, [sitesOptions]);

  const chartTypeOptions = [
    { value: "line", label: "Line" },
    { value: "bar", label: "Bar" },
    { value: "pie", label: "Pie" },
  ];

  const [selectedChart, setSelectedChartType] = useState(
    toValueLabelObject(defaultFilter.chartType)
  );

  const handleChartTypeChange = (selectedChartType) => {
    setTempState({ ...tempState, chartType: selectedChartType });

    setFormState((formState) => ({
      ...formState,
      values: {
        ...formState.values,
        chartType: selectedChartType.value,
      },
      touched: {
        ...formState.touched,
        chartType: true,
      },
    }));
  };

  const frequencyOptions = [
    { value: "hourly", label: "Hourly" },
    { value: "daily", label: "Daily" },
    { value: "monthly", label: "Monthly" },
    { value: "diurnal", label: "Diurnal" },
  ];

  const [selectedFrequency, setSelectedFrequency] = useState(
    toValueLabelObject(defaultFilter.frequency)
  );

  const handleFrequencyChange = (selectedFrequencyOption) => {
    setTempState({ ...tempState, frequency: selectedFrequencyOption });
  };

  const pollutantOptions = usePollutantsOptions();

  const labelMapper = {
    pm2_5: (
      <tspan>
        PM
        <tspan dy={5} style={{ fontSize: "0.6rem" }}>
          2.5
        </tspan>{" "}
        <tspan dy={-5}>
          (µg/m
          <tspan dy={-5} style={{ fontSize: "0.6rem" }}>
            3
          </tspan>
          <tspan dy={5}>)</tspan>
        </tspan>
      </tspan>
    ),
    pm10: (
      <tspan>
        PM
        <tspan dy={5} style={{ fontSize: "0.6rem" }}>
          10
        </tspan>{" "}
        <tspan dy={-5}>
          (µg/m
          <tspan dy={-5} style={{ fontSize: "0.6rem" }}>
            3
          </tspan>
          <tspan dy={5}>)</tspan>
        </tspan>
      </tspan>
    ),
    no2: (
      <tspan>
        NO
        <tspan dy={5} style={{ fontSize: "0.6rem" }}>
          2
        </tspan>{" "}
        <tspan dy={-5}>
          (µg/m
          <tspan dy={-5} style={{ fontSize: "0.6rem" }}>
            3
          </tspan>
          <tspan dy={5}>)</tspan>
        </tspan>
      </tspan>
    ),
  };

  const setDefaulPollutant = (value) => {
    if (value === "pm2_5" || value === "PM 2.5")
      return { value: "pm2_5", label: "PM 2.5" };
    if (value === "pm10" || value === "PM 10")
      return { value: "pm10", label: "PM 10" };
    if (value === "no2" || value === "NO2")
      return { value: "no2", label: "NO2" };

    return { value: "pm2_5", label: "PM 2.5" };
  };

  const [selectedPollutant, setSelectedPollutant] = useState(
    setDefaulPollutant(defaultFilter.pollutant)
  );

  const handlePollutantChange = (selectedPollutantOption) => {
    setTempState({ ...tempState, pollutant: selectedPollutantOption });
  };

  const annotationMapper = {
    pm2_5: {
      value: 25,
      label_content: "WHO AQG",
    },
    pm10: {
      value: 50,
      label_content: "WHO AQG",
    },
    no2: {
      value: 40,
      label_content: "WHO AQG",
    },
  };

  const [customisedAnnotation, setCustomAnnotations] = useState(
    annotationMapper[selectedPollutant.value]
  );

  const title = (
    <span>
      Mean {selectedFrequency.label}{" "}
      {pollutantLabelMapper[selectedPollutant.label]} from{" "}
      {formatDate(selectedDate, "YYYY-MM-DD")} to{" "}
      {formatDateString(selectedEndDate, "YYYY-MM-DD")}
    </span>
  );

  const [subTitle, setSubTitle] = useState(defaultFilter.chartSubTitle);

  const [tempState, setTempState] = useState({
    subTitle: subTitle,
    sites: values,
    chartType: selectedChart,
    frequency: selectedFrequency,
    pollutant: selectedPollutant,
  });

  const transferFromTempState = () => {
    setSubTitle(tempState.subTitle);
    setReactSelectValue(tempState.sites);
    setSelectedChartType(tempState.chartType);
    setSelectedFrequency(tempState.frequency);
    setSelectedPollutant(tempState.pollutant);
  };

  const clearTempState = () => {
    setTempState({
      subTitle: subTitle,
      sites: values,
      chartType: selectedChart,
      frequency: selectedFrequency,
      pollutant: selectedPollutant,
    });
  };

  const handleMultiChange = (selectedOption) => {
    setTempState({ ...tempState, sites: { selectedOption } });
  };

  useEffect(() => {
    // setCustomisedGraphLabel(labelMapper[selectedPollutant.value]);
    setCustomAnnotations(annotationMapper[selectedPollutant.value]);
  }, [selectedPollutant]);

  const [customGraphData, setCustomisedGraphData] = useState([]);

  const _fetchAndSetGraphData = async (filter) => {
    filter = {
      ...filter,
      startDate: roundToStartOfDay(filter.startDate).toISOString(),
      endDate: roundToEndOfDay(filter.endDate).toISOString(),
    };

    await setCustomisedGraphData([]);

    return await loadD3ChartDataApi(filter).then((res) =>
      setCustomisedGraphData(res.data || [])
    );
  };

  const fetchAndSetGraphData = async (filter) => {
    setLoading(true);
    await _fetchAndSetGraphData(filter);
    setLoading(false);
  };

  let handleSubmit = async (e) => {
    e.preventDefault();
    setOpen(false);

    let period = omit(
      { ...selectedPeriod, endDate: selectedEndDate },
      "startDate"
    );

    period = {
      ...selectedPeriod,
      startDate: selectedDate.toISOString(),
      endDate: selectedEndDate.toISOString(),
    };

    let newFilter = {
      ...defaultFilter,
      period: period,
      sites: optionToList(tempState.sites.selectedOption),
      startDate: selectedDate.toISOString(),
      endDate: selectedEndDate.toISOString(),
      chartType: tempState.chartType.value,
      frequency: tempState.frequency.value,
      pollutant: tempState.pollutant.value,
      chartTitle: title,
      chartSubTitle: tempState.subTitle,
      airqloud: airqloud._id,
    };

    transferFromTempState();

    // quick fix for circular imports
    delete newFilter["chartTitle"];

    updateUserChartDefaultsApi(newFilter._id, newFilter);
    await fetchAndSetGraphData(newFilter);
  };

  useEffect(() => {
    const errors = {};

    setFormState((formState) => ({
      ...formState,
      isValid: !!errors,
      errors: errors || {},
    }));
  }, [formState.values]);

  useEffect(() => {
    handlePeriodChange(selectedPeriod);
  }, []);

  const iconButton = "exportIconButton";
  const [anchorEl, setAnchorEl] = useState(null);

  const filter = (node) => node.id !== iconButton;

  const ITEM_HEIGHT = 48;
  const paperProps = {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5,
      width: 150,
    },
  };

  const exportToImage = async (chart, format, exportFunc) => {
    try {
      const dataUrl = await exportFunc(chart, { filter });
      const link = document.createElement("a");
      document.body.appendChild(link);
      link.download = `chart.${format}`;
      link.href = dataUrl;
      link.click();
      link.remove();
    } catch (err) {
      console.error("oops, something went wrong!", err);
    }
  };

  const exportToJpeg = (chart) => {
    setAnchorEl(null);
    exportToImage(chart, "jpeg", domtoimage.toJpeg);
  };

  const exportToPng = (chart) => {
    setAnchorEl(null);

    exportToImage(chart, "png", domtoimage.toPng);
  };

  const exportToPdf = async (chart) => {
    setAnchorEl(null);

    const width = chart.offsetWidth;
    const height = chart.offsetHeight;
    try {
      const dataUrl = await domtoimage.toJpeg(chart, { filter });
      const doc = new JsPDF({
        orientation: "landscape",
        unit: "px",
        format: [width, height],
      });
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = doc.internal.pageSize.getHeight();
      doc.addImage(dataUrl, "JPEG", 0, 0, pdfWidth, pdfHeight);
      doc.save("chart");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("oops, something went wrong!", err);
    }
  };

  const print = async (chart) => {
    setAnchorEl(null);
    try {
      // const dataUrl = await domtoimage.toJpeg(chart, { filter });
      const dataUrl = await domtoimage.toJpeg(chart);
      let html = "<html><head><title></title></head>";
      html += '<body style="width: 100%; padding: 0; margin: 0;"';
      html += ' onload="window.focus(); window.print(); window.close()">';
      html += `<img src="${dataUrl}" /></body></html>`;

      const printWindow = window.open("", "print");
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("oops, something went wrong!", err);
    }
  };

  const [hidden, setHidden] = useState(false);

  const deleteChart = async () => {
    setAnchorEl(null);
    await deleteUserChartDefaultsApi(defaultFilter._id)
      .then((responseData) => {
        setHidden(true);
        dispatch(
          updateMainAlert({
            show: true,
            message: responseData.message,
            severity: "success",
          })
        );
      })
      .catch((err) => {
        console.log("err", err.response.data);
        dispatch(
          updateMainAlert({
            show: true,
            message:
              err.response && err.response.data && err.response.data.message,
            severity: "error",
          })
        );
      });
  };

  const menuOptions = [
    { key: "Customise", action: handleClickOpen, text: "Customise Chart" },
    { key: "Print", action: print, text: "Print" },
    { key: "JPEG", action: exportToJpeg, text: "Save as JPEG" },
    { key: "PNG", action: exportToPng, text: "Save as PNG" },
    { key: "PDF", action: exportToPdf, text: "Save as PDF" },
    {
      key: "Delete",
      action: deleteChart,
      text: <span style={{ color: "red" }}>Delete Chart</span>,
    },
  ];

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleExportCustomChart = ({ action }) => () => {
    const chart = ref.current;
    handleClose();
    action(chart);
  };

  const openMenu = Boolean(anchorEl);

  const sitesToString = (sites) => {
    const formattedString = [];
    sites.map((site) => {
      formattedString.push(site.label);
    });
    return formattedString.join(", ");
  };

  return (
    <Grid
      item
      lg={6}
      md={6}
      sm={12}
      xl={6}
      xs={12}
      style={{ display: hidden ? "none" : "block" }}
    >
      <div ref={ref}>
        <ChartContainer
          title={
            <span>
              {tempState.subTitle || "unknown location"} - {title}
            </span>
          }
          open={openMenu}
          onClick={handleClick}
          close={handleMenuClose}
          action={(open, anchorEl) => (
            <Grid>
              <Menu
                anchorEl={anchorEl}
                open={!!open}
                onClose={handleMenuClose}
                PaperProps={paperProps}
              >
                {menuOptions.map((option) => (
                  <MenuItem
                    key={option.key}
                    onClick={handleExportCustomChart(option)}
                  >
                    {option.text}
                  </MenuItem>
                ))}
              </Menu>
            </Grid>
          )}
        >
          <CustomDisplayChart
            chartType={selectedChart.value}
            loading={loading}
            data={customGraphData}
            xFunc={(d) => new Date(d.time)}
            yFunc={(d) => d.value}
            symbolFunc={(d) => d.name}
            yLabel={labelMapper[selectedPollutant.value]}
            freq={selectedFrequency.value}
            pieChartValueExtractor={(d) => d.value}
          />
        </ChartContainer>
        <Grid item lg={12} sm={12} xl={12} xs={12}>
          <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="form-dialog-title"
          >
            <DialogTitle id="form-dialog-title" onClose={handleClose}>
              Customise Chart by Selecting the Various Options
            </DialogTitle>
            <Divider />
            <DialogContent>
              <form onSubmit={handleSubmit} id="customisable-form">
                <Grid container spacing={2}>
                  <Grid item md={12} xs={12}>
                    <TextField
                      autoFocus
                      margin="dense"
                      label="Location Name"
                      variant="outlined"
                      value={tempState.subTitle}
                      onChange={(evt) =>
                        setTempState({
                          ...tempState,
                          subTitle: evt.target.value,
                        })
                      }
                      fullWidth
                    />
                  </Grid>
                  <Grid item md={12} xs={12}>
                    <OutlinedSelect
                      fullWidth
                      className="reactSelect"
                      label="Sites"
                      value={tempState.sites.selectedOption}
                      options={sitesOptions}
                      onChange={handleMultiChange}
                      isMulti
                      scrollable
                      height={"100px"}
                    />
                  </Grid>

                  <Grid item md={6} xs={12}>
                    <OutlinedSelect
                      fullWidth
                      label="Chart Type"
                      value={tempState.chartType}
                      options={chartTypeOptions}
                      onChange={handleChartTypeChange}
                    />
                  </Grid>

                  <Grid item md={6} xs={12}>
                    <OutlinedSelect
                      fullWidth
                      label="Frequency"
                      value={tempState.frequency}
                      options={frequencyOptions}
                      onChange={handleFrequencyChange}
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <OutlinedSelect
                      fullWidth
                      label="Pollutant"
                      value={tempState.pollutant}
                      options={pollutantOptions}
                      onChange={handlePollutantChange}
                    />
                  </Grid>

                  <Grid item md={6} xs={12}>
                    <OutlinedSelect
                      fullWidth
                      label="Time range"
                      value={selectedPeriod}
                      options={periodOptions}
                      onChange={handlePeriodChange}
                    />
                  </Grid>

                  <Grid item md={12} xs={12}>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                      <Grid container spacing={1}>
                        <Grid item lg={6} md={6} sm={6} xl={6} xs={12}>
                          <KeyboardDatePicker
                            disabled={disableDatePickers}
                            disableToolbar
                            variant="dialog"
                            format="yyyy-MM-dd"
                            margin="normal"
                            id="date-picker-inline"
                            label="Start Date"
                            value={selectedDate}
                            onChange={handleDateChange}
                            KeyboardButtonProps={{
                              "aria-label": "change date",
                            }}
                            required
                            disableFuture
                          />
                        </Grid>
                        <Grid item lg={6} md={6} sm={6} xl={6} xs={12}>
                          <KeyboardTimePicker
                            disabled={disableDatePickers}
                            variant="dialog"
                            margin="normal"
                            id="time-picker"
                            label="Start Time "
                            value={selectedDate}
                            onChange={handleDateChange}
                            KeyboardButtonProps={{
                              "aria-label": "change time",
                            }}
                            //required
                          />
                        </Grid>

                        <Grid item lg={6} md={6} sm={6} xl={6} xs={12}>
                          <KeyboardDatePicker
                            disabled={disableDatePickers}
                            disableToolbar
                            variant="dialog"
                            format="yyyy-MM-dd"
                            margin="normal"
                            id="date-picker-inline"
                            label="End Date"
                            value={selectedEndDate}
                            onChange={handleEndDateChange}
                            KeyboardButtonProps={{
                              "aria-label": "change end date",
                            }}
                            required
                            disableFuture
                          />
                        </Grid>
                        <Grid item lg={6} md={6} sm={6} xl={6} xs={12}>
                          <KeyboardTimePicker
                            disabled={disableDatePickers}
                            variant="dialog"
                            margin="normal"
                            id="time-picker"
                            label="End Time "
                            value={selectedEndDate}
                            onChange={handleEndDateChange}
                            KeyboardButtonProps={{
                              "aria-label": "change end time",
                            }}
                            required
                          />
                        </Grid>
                      </Grid>
                    </MuiPickersUtilsProvider>
                  </Grid>
                </Grid>
              </form>
            </DialogContent>
            <Divider />
            <DialogActions>
              <Button onClick={handleClose} color="primary" variant="outlined">
                Cancel
              </Button>
              <Button
                //disabled={!formState.isValid}
                variant="contained"
                // onClick={handleClose}
                color="primary"
                type="submit" //set the buttom type is submit
                form="customisable-form"
              >
                Customise
              </Button>
            </DialogActions>
          </Dialog>
        </Grid>
      </div>
    </Grid>
  );
};

CustomisableChart.propTypes = {
  className: PropTypes.string,
  defaultFilter: PropTypes.object,
  idSuffix: PropTypes.string,
};

export default CustomisableChart;
