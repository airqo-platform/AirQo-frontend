import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/styles";
import { Bar } from "react-chartjs-2";
import PropTypes from "prop-types";
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@material-ui/core";
import { MoreHoriz } from "@material-ui/icons";
import axios from "axios";
import palette from "theme/palette";
import { EXCEEDANCES_URI } from "config/urls/analytics";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import domtoimage from "dom-to-image";
import moment from "moment";
import JsPDF from "jspdf";
import { roundToStartOfDay, roundToEndOfDay } from "utils/dateTime";
import { usePollutantsOptions } from "utils/customHooks";
import { useCurrentAirQloudData } from "redux/AirQloud/selectors";
import { flattenSiteOptions } from "utils/sites";
import OutlinedSelect from "views/components/CustomSelects/OutlinedSelect";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
  },

  avatar: {
    backgroundColor: theme.palette.success.main,
    height: 56,
    width: 56,
  },

  dialogPaper: {
    minHeight: "20vh",
    maxHeight: "50vh",
  },
}));

const ExceedancesChart = (props) => {
  const { className, chartContainer, idSuffix, ...rest } = props;

  const classes = useStyles();

  const airqloud = useCurrentAirQloudData();
  const [dialogOpen, setDialogOpen] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = React.useState(false);
  const [endDate, setEndDate] = React.useState(
    moment(new Date()).toISOString()
  );
  const [startDate, setStartDate] = React.useState(
    moment(endDate).subtract(28, "days").toISOString()
  );

  const standardOptions = [
    { value: "aqi", label: "AQI" },
    { value: "who", label: "WHO" },
  ];

  const pollutantOptions = usePollutantsOptions();

  const [standard, setStandard] = useState({ value: "aqi", label: "AQI" });
  const [pollutant, setPollutant] = useState({
    value: "pm2_5",
    label: "PM 2.5",
  });
  const [tempStandard, setTempStandard] = useState(standard);
  const [tempPollutant, setTempPollutant] = useState(pollutant);

  const [customChartTitle, setCustomChartTitle] = useState(
    `${pollutant.label} Exceedances Over the Past 28 Days Based on ${standard.label}`
  );

  const [loading, setLoading] = useState(false);

  const handleStandardChange = (standard) => {
    setTempStandard(standard);
  };

  const handlePollutantChange = (pollutant) => {
    setTempPollutant(pollutant);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setOpen(false);
    setTempPollutant(pollutant);
    setTempStandard(standard);
  };

  const [locations, setLocations] = useState([]);
  const [dataset, setDataset] = useState([]);

  useEffect(() => {
    let filter = {
      pollutant: pollutant.value,
      standard: standard.value,
      startDate,
      endDate,
      sites: flattenSiteOptions(airqloud.siteOptions),
    };
    fetchAndSetExceedanceData(filter);
  }, []);

  useEffect(() => {
    let filter = {
      pollutant: pollutant.value,
      standard: standard.value,
      startDate,
      endDate,
      sites: flattenSiteOptions(airqloud.siteOptions),
    };
    fetchAndSetExceedanceData(filter);
  }, [airqloud]);

  let handleSubmit = async (e) => {
    e.preventDefault();

    let filter = {
      pollutant: tempPollutant.value,
      standard: tempStandard.value,
      startDate,
      endDate,
      sites: flattenSiteOptions(airqloud.siteOptions),
    };
    setAnchorEl(null);
    setOpen(false);
    fetchAndSetExceedanceData(filter);
  };

  const fetchAndSetExceedanceData = async (filter) => {
    setLoading(true);
    filter = {
      ...filter,
      startDate: roundToStartOfDay(filter.startDate).toISOString(),
      endDate: roundToEndOfDay(filter.endDate).toISOString(),
    };
    setStandard(tempStandard);
    setPollutant(tempPollutant);
    setCustomChartTitle(
      `${tempPollutant.label} Exceedances Over the Past 28 Days Based on ${tempStandard.label}`
    );
    try {
      const response = await axios.post(EXCEEDANCES_URI, filter);
      const responseData = response.data;
      const exceedanceData = responseData.data;
      exceedanceData.sort((a, b) => {
        const a0 = (
          a.site.name ||
          a.site.description ||
          a.site.generated_name
        ).trim();
        const b0 = (
          b.site.name ||
          b.site.description ||
          b.site.generated_name
        ).trim();
        if (a0 < b0) return -1;
        if (a0 > b0) return 1;
        return 0;
      });
  
      const maxLocations = 10; // Set the maximum number of locations on the x-axis
      const myLocations = exceedanceData
        .map((element) =>
          element.site.name ||
          element.site.description ||
          element.site.generated_name
        )
        .slice(0, maxLocations);
  
      let myDataset = [];
      if (tempStandard.value.toLowerCase() === "aqi") {
        const labels = ["UH4SG", "Unhealthy", "Very Unhealthy", "Hazardous"];
        const colors = ["orange", "red", "purple", "maroon"];
        const properties = ["UHFSG", "Unhealthy", "VeryUnhealthy", "Hazardous"];
  
        myDataset = labels.map((label, index) => ({
          label,
          data: exceedanceData.map((element) => element.exceedance[properties[index]]),
          backgroundColor: colors[index],
          borderColor: "rgba(0,0,0,1)",
          borderWidth: 1,
        }));
      } else {
        myDataset = [
          {
            label: "Exceedances",
            data: exceedanceData.map((element) => element.exceedance),
            backgroundColor: palette.primary.main,
            //borderColor: 'rgba(0,0,0,1)',
            borderWidth: 1,
          },
        ];
      }
  
      setLocations(myLocations);
      setDataset(myDataset);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };
  

  const rootCustomChartContainerId = "rootCustomChartContainerId" + idSuffix;
  const iconButton = "exportIconButton";

  const filter = (node) => node.id !== iconButton;

  const ITEM_HEIGHT = 48;
  const paperProps = {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5,
      width: 150,
    },
  };

  const openDialog = () => {
    setDialogOpen(true);
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

  const exportToJpeg = (chart) =>
    exportToImage(chart, "jpeg", domtoimage.toJpeg);

  const exportToPng = (chart) => exportToImage(chart, "png", domtoimage.toPng);

  const exportToPdf = async (chart) => {
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
    try {
      const dataUrl = await domtoimage.toJpeg(chart, { filter });
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

  const menuOptions = [
    { key: "Customise", action: handleClickOpen, text: "Customise Chart" },
    { key: "Print", action: print, text: "Print" },
    { key: "JPEG", action: exportToJpeg, text: "Save as JPEG" },
    { key: "PNG", action: exportToPng, text: "Save as PNG" },
    { key: "PDF", action: exportToPdf, text: "Save as PDF" },
  ];

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleExportCustomChart = ({ action }) => () => {
    const chart = document.querySelector(`#${rootCustomChartContainerId}`);
    handleClose();
    action(chart);
  };

  const openMenu = Boolean(anchorEl);

  return (
    <Card {...rest} className={className} id={rootCustomChartContainerId}>
      <CardHeader
        action={
          <Grid>
            <IconButton
              size="small"
              color="primary"
              id={iconButton}
              onClick={handleClick}
              className={classes.chartSaveButton}
            >
              <MoreHoriz />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={openMenu}
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
        }
        title={customChartTitle}
        subheader={`from ${props.date}`}
        style={{ textAlign: "center" }}
      />
      <Divider />
      <CardContent>
        <Grid item lg={12} sm={12} xl={12} xs={12}>
          <div className={chartContainer}>
          {loading ? (
            <div 
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "30vh"
            }}>
              loading...
            </div>
          ):(
            <Bar
              data={{
                labels: locations,
                datasets: dataset,
              }}
              options={
                props.options || {
                  layout: { padding: 0 },
                  tooltips: {
                    enabled: true,
                    mode: "index",
                    intersect: false,
                    borderWidth: 1,
                    borderColor: palette.divider,
                    backgroundColor: palette.white,
                    titleFontColor: palette.text.primary,
                    bodyFontColor: palette.text.secondary,
                    footerFontColor: palette.text.secondary,
                  },
                  scales: {
                    yAxes: [
                      {
                        stacked: true,
                        scaleLabel: {
                          display: true,
                          labelString: "Exceedances",
                          // fontWeight: 4,
                          // fontColor: "black",
                          fontSize: 15,
                          padding: 10,
                        },
                        ticks: {
                          fontColor: palette.text.secondary,
                          beginAtZero: true,
                          min: 0,
                        },
                        gridLines: {
                          borderDash: [2],
                          borderDashOffset: [2],
                          color: palette.divider,
                          drawBorder: false,
                          zeroLineBorderDash: [2],
                          zeroLineBorderDashOffset: [2],
                          zeroLineColor: palette.divider,
                        },
                      },
                    ],
                    xAxes: [
                      {
                        barThickness: 12,
                        maxBarThickness: 10,
                        barPercentage: 0.5,
                        categoryPercentage: 0.5,
                        stacked: true,
                        scaleLabel: {
                          display: true,
                          labelString: "Locations",
                          // fontWeight: 4,
                          // fontColor: "black",
                          fontSize: 15,
                          padding: 10,
                        },
                        ticks: {
                          fontColor: "black",
                          callback: (value) => `${value.substr(0, 7)}...`,
                        },
                        gridLines: {
                          display: false,
                          drawBorder: false,
                        },
                      },
                    ],
                  },

                  maintainAspectRatio: true,
                  responsive: true,
                }
              }
            />
          )}
          <button onClick={openDialog}>Show Locations</button>  
          </div>
        </Grid>

        <Grid item lg={12} sm={12} xl={12} xs={12}>
          <Dialog
            classes={{ paper: classes.dialogPaper }}
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
                <Grid container spacing={2} style={{ marginTop: "5px" }}>
                  <Grid item md={12} xs={12}>
                    <OutlinedSelect
                      fullWidth
                      className="reactSelect"
                      label="Pollutant"
                      value={tempPollutant}
                      options={pollutantOptions}
                      onChange={handlePollutantChange}
                    />
                  </Grid>
                  <Grid item md={12} xs={12}>
                    <OutlinedSelect
                      fullWidth
                      className="reactSelect"
                      label="Standard"
                      value={tempStandard}
                      options={standardOptions}
                      onChange={handleStandardChange}
                    />
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
                variant="contained"
                color="primary"
                type="submit"
                form="customisable-form"
              >
                Customise
              </Button>
            </DialogActions>
          </Dialog>
        </Grid>
      </CardContent>
      {/* Dialog component */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Locations and Exceedance Values</DialogTitle>
        <DialogContent>
          {locations && locations.length > 0 ? (
            <ul>
              {locations.map((location, index) => {
                const aqi = dataset[0]?.data[index] || 'N/A';
                const exceedance = dataset[1]?.data[index] || 'N/A';

                return (
                  <li key={index}>
                    Location: {location} | AQI: {aqi} | Exceedance: {exceedance}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>No data available.</p>
          )}
        </DialogContent>
        <DialogActions>
          <button onClick={() => setDialogOpen(false)}>Close</button>
        </DialogActions>
      </Dialog>

    </Card>
  );
};

ExceedancesChart.propTypes = {
  className: PropTypes.string,
  idSuffix: PropTypes.string,
};

export default ExceedancesChart;
