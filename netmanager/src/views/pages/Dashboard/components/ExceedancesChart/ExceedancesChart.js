import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/styles";
import { Bar } from "react-chartjs-2";
import PropTypes from "prop-types";
import {
  Card,
  CardContent,
  CardHeader,
  CardActions,
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
import clsx from "clsx";
import axios from "axios";
//import LoadingSpinner from '../../../Graphs/loadingSpinner';
import Select from "react-select";
import palette from "theme/palette";
import constants from "config/constants";
import { constant } from "underscore";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import domtoimage from "dom-to-image";
import JsPDF from "jspdf";
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
    minHeight: "50vh",
    maxHeight: "50vh",
  },
}));

/*const useStyles = makeStyles(theme => ({
    root: {
      padding: theme.spacing(4)
    },
    chartCard:{
  
    },
    differenceIcon: {
      color: theme.palette.text.secondary,
    },
    chartContainer: {
      height: 200,
      position: 'relative'
    },
    actions: {
      justifyContent: 'flex-end'
    }
  }));*/

const ExceedancesChart = (props) => {
  const { className, chartContainer, idSuffix, ...rest } = props;

  const classes = useStyles();
  // const [loading, setLoading] = useState(false);
  const [open, setOpen] = React.useState(false);
  //const [scroll, setScroll] = React.useState('paper');

  const [locations, setLocations] = useState([]);

  const [UH4SGValues, setUH4SGValues] = useState([]);
  const [unhealthyValues, setUnhealthyValues] = useState([]);
  const [veryUnhealthyValues, setVeryUnhealthyValues] = useState([]);
  const [hazardousValues, setHazardousValues] = useState([]);

  const [exceedanceValues, setExceedanceValues] = useState([]);
  useEffect(() => {
    let effectFilter = {
      pollutant: "PM 2.5",
      standard: "AQI",
    };
    console.log(JSON.stringify(effectFilter));
    //setLoading(true);

    axios
      .post(constants.EXCEEDANCES_URI, JSON.stringify(effectFilter), {
        headers: { "Content-Type": "application/json" },
      })
      .then((res) => {
        const myData = res.data;
        //setLoading(false);
        console.log(myData);
        myData.sort((a, b) => {
          const a0 = a.location.trim(),
            b0 = b.location.trim();
          if (a0 < b0) return -1;
          if (a0 > b0) return 1;
          return 0;
        });
        setMyStandard(standard.value);
        setMyPollutant(pollutant.value);
        let myValues = [];
        let myUH4SGValues = [];
        let myUnhealthyValues = [];
        let myVeryUnhealthyValues = [];
        let myHazardousValues = [];
        let myLocations = [];

        myData.forEach((element) => {
          myLocations.push(element["location"]);
          myUH4SGValues.push(element["UH4SG"]);
          myUnhealthyValues.push(element["Unhealthy"]);
          myVeryUnhealthyValues.push(element["VeryUnhealthy"]);
          myHazardousValues.push(element["Hazardous"]);
        });
        setLocations(myLocations);
        setUH4SGValues(myUH4SGValues);
        setUnhealthyValues(myUnhealthyValues);
        setVeryUnhealthyValues(myVeryUnhealthyValues);
        setHazardousValues(myHazardousValues);
      })
      .catch(console.log);
  }, []);

  const [customChartTitle, setCustomChartTitle] = useState(
    "PM 2.5 Exceedances Over the Past 28 Days Based on AQI"
  );
  const [exceedancesData, setExceedancesData] = useState([]);
  const [myStandard, setMyStandard] = useState({ value: "" });
  const [myPollutant, setMyPollutant] = useState({ value: "" });

  const [standard, setStandard] = useState("WHO");
  const standardOptions = [
    { value: "AQI", label: "AQI" },
    { value: "WHO", label: "WHO" },
  ];
  const handleStandardChange = (standard) => {
    setStandard(standard);
  };

  const [pollutant, setPollutant] = useState("PM 2.5");
  const pollutantOptions = [
    { value: "PM 2.5", label: "PM 2.5" },
    { value: "PM 10", label: "PM 10" },
    { value: "NO2", label: "NO2" },
  ];
  const handlePollutantChange = (pollutant) => {
    setPollutant(pollutant);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  function generateTitle(pollutant, standard) {
    if (!pollutant) {
      pollutant = "PM 2.5";
    }
    if (!standard) {
      standard = "WHO";
    }

    let title =
      pollutant + " Exceedances Over the Past 28 Days Based on " + standard;
    return title;
  }

  function generateExceedanceData(standard) {
    var datasets;
    if (standard === "WHO") {
      datasets = [
        {
          label: "Exceedances",
          data: exceedanceValues,
          backgroundColor: palette.primary.main,
          //borderColor: 'rgba(0,0,0,1)',
          borderWidth: 1,
        },
      ];
    } else {
      datasets = [
        {
          label: "UH4SG",
          data: UH4SGValues,
          backgroundColor: "orange",
          borderColor: "rgba(0,0,0,1)",
          borderWidth: 1,
        },
        {
          label: "Unhealthy",
          data: unhealthyValues,
          backgroundColor: "red",
          borderColor: "rgba(0,0,0,1)",
          borderWidth: 1,
        },
        {
          label: "Very Unhealthy",
          data: veryUnhealthyValues,
          backgroundColor: "purple",
          borderColor: "rgba(0,0,0,1)",
          borderWidth: 1,
        },
        {
          label: "Hazardous",
          data: hazardousValues,
          backgroundColor: "maroon",
          borderColor: "rgba(0,0,0,1)",
          borderWidth: 1,
        },
      ];
    }
    return datasets;
  }

  let handleSubmit = (e) => {
    e.preventDefault();
    //setLoading(true);

    let filter = {
      pollutant: pollutant.value,
      standard: standard.value,
    };
    let filter_string = JSON.stringify(filter);
    console.log(filter_string);

    axios
      .post(constants.EXCEEDANCES_URI, filter_string, {
        headers: { "Content-Type": "application/json" },
      })
      .then((res) => {
        const myData = res.data;
        console.log(myData);
        //setLoading(false);
        myData.sort((a, b) => {
          const a0 = a.location.trim(),
            b0 = b.location.trim();
          if (a0 < b0) return -1;
          if (a0 > b0) return 1;
          return 0;
        });
        setMyStandard(standard.value);
        setMyPollutant(pollutant.value);
        let myValues = [];
        let myUH4SGValues = [];
        let myUnhealthyValues = [];
        let myVeryUnhealthyValues = [];
        let myHazardousValues = [];
        let myLocations = [];
        //setLocations(myLocations);
        //myData.forEach(element => {
        //myLocations.push(element['location']);

        if (standard.value === "AQI") {
          myData.forEach((element) => {
            myLocations.push(element["location"]);
            myUH4SGValues.push(element["UH4SG"]);
            myUnhealthyValues.push(element["Unhealthy"]);
            myVeryUnhealthyValues.push(element["VeryUnhealthy"]);
            myHazardousValues.push(element["Hazardous"]);
          });
          setLocations(myLocations);
          setUH4SGValues(myUH4SGValues);
          setUnhealthyValues(myUnhealthyValues);
          setVeryUnhealthyValues(myVeryUnhealthyValues);
          setHazardousValues(myHazardousValues);
        } else {
          myData.forEach((element) => {
            myLocations.push(element["location"]);
            myValues.push(element["exceedances"]);
          });
          setLocations(myLocations);
          setExceedanceValues(myValues);
        }
        setCustomChartTitle(
          pollutant.value +
            " Exceedances Over the Past 28 Days Based on " +
            standard.value
        );
      })
      .catch(console.log);
  };

  const rootCustomChartContainerId = "rootCustomChartContainerId" + idSuffix;
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
        style={{ textAlign: "center" }}
      />
      <Divider />
      <CardContent>
        <Grid item lg={12} sm={12} xl={12} xs={12}>
          <div className={chartContainer}>
            <Bar
              data={{
                labels: locations,
                datasets: generateExceedanceData(myStandard),
              }}
              options={{
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
                        fontWeight: 4,
                        fontColor: "black",
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
                        fontWeight: 4,
                        fontColor: "black",
                        fontSize: 15,
                        padding: 10,
                      },
                      ticks: {
                        fontColor: "black",
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
              }}
            />
          </div>
        </Grid>

        <Grid item lg={12} sm={12} xl={12} xs={12}>
          <Dialog
            classes={{ paper: classes.dialogPaper }}
            open={open}
            onClose={handleClose}
            aria-labelledby="form-dialog-title"
          >
            <DialogTitle id="form-dialog-title">
              Customise Chart by Selecting the Various Options
            </DialogTitle>
            <Divider />
            <DialogContent>
              <form onSubmit={handleSubmit} id="customisable-form">
                <Grid container spacing={2}>
                  <Grid item md={6} xs={12}>
                    <Select
                      fullWidth
                      label="Pollutant"
                      className=""
                      name="pollutant"
                      placeholder="Pollutant"
                      value={pollutant}
                      options={pollutantOptions}
                      onChange={handlePollutantChange}
                      variant="outlined"
                      margin="dense"
                      required
                    />
                  </Grid>

                  <Grid item md={6} xs={12}>
                    <Select
                      fullWidth
                      label="Standard"
                      className=""
                      name="standard"
                      placeholder="Standard"
                      value={standard}
                      options={standardOptions}
                      onChange={handleStandardChange}
                      variant="outlined"
                      margin="dense"
                      required
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
                variant="outlined"
                onClick={handleClose}
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
    </Card>
  );
};

ExceedancesChart.propTypes = {
  className: PropTypes.string,
  idSuffix: PropTypes.string,
};

export default ExceedancesChart;
