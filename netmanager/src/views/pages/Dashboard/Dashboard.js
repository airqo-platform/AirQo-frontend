import React from "react";
import { makeStyles } from "@material-ui/styles";
import {
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Divider,
  CardActions,
  IconButton,
} from "@material-ui/core";
import { Line, Bar } from "react-chartjs-2";
import clsx from "clsx";
import PropTypes from "prop-types";
import {
  Map,
  CustomisableChart,
  PollutantCategory,
  ExceedancesChart,
} from "./components";
import { useEffect, useState } from "react";
import "chartjs-plugin-annotation";
import palette from "theme/palette";
import axios from "axios";
import constants from "config/constants";
import { MoreHoriz } from "@material-ui/icons";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import domtoimage from "dom-to-image";
import JsPDF from "jspdf";
import { useUserDefaultGraphsData } from "redux/Dashboard/selectors";
import { useOrgData } from "redux/Join/selectors";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(4),
  },
  chartCard: {},
  differenceIcon: {
    color: theme.palette.text.secondary,
  },
  chartContainer: {
    height: 250,
    position: "relative",
  },
  mapContainer: {
    height: 590,
    width: 580,
    position: "relative",
  },
  actions: {
    justifyContent: "flex-end",
  },
  chartSaveButton: {
    width: "50px",
    height: "50px",
  },
}));

const Dashboard = (props) => {
  const classes = useStyles();
  const {
    className,
    staticContext,
    mappedAuth,
    mappeduserState,
    mappedErrors,
    ...rest
  } = props;

  const userDefaultGraphs = useUserDefaultGraphsData();
  const orgData = useOrgData();

  function appendLeadingZeroes(n) {
    if (n <= 9) {
      return "0" + n;
    }
    return n;
  }

  let todaysDate = new Date();
  const dateValue = appendLeadingZeroes(
    todaysDate.getDate() +
      "/" +
      appendLeadingZeroes(todaysDate.getMonth() + 1) +
      "/" +
      todaysDate.getFullYear()
  );

  const [
    pm25CategoriesLocationCount,
    setPm25CategoriesLocationCount,
  ] = useState([]);

  useEffect(() => {
    if (orgData.name.toLowerCase() === "airqo") {
      props.history.push("/overview");
    }
  }, []);

  //load JIRA Helpdek widget
  // console.log(user._id);
  useEffect(() => {
    // if (user._id != {}) {
    function jiraHelpdesk(callback) {
      let jhdScript = document.createElement("script");
      jhdScript.type = "text/javascript";
      jhdScript.setAttribute("data-jsd-embedded", null);
      jhdScript.setAttribute(
        "data-key",
        "cf4a44fc-f333-4e48-8e6c-6b94f97cea15"
      );
      jhdScript.setAttribute(
        "data-base-url",
        "https://jsd-widget.atlassian.com"
      );
      jhdScript.src = "https://jsd-widget.atlassian.com/assets/embed.js";
      if (jhdScript.readyState) {
        // old IE support
        jhdScript.onreadystatechange = function () {
          if (
            jhdScript.readyState === "loaded" ||
            jhdScript.readyState === "complete"
          ) {
            jhdScript.onreadystatechange = null;
            callback();
          }
        };
      } else {
        //modern browsers
        jhdScript.onload = function () {
          callback();
        };
      }
      document.getElementsByTagName("head")[0].appendChild(jhdScript);
    }

    jiraHelpdesk(function () {
      let DOMContentLoaded_event = document.createEvent("Event");
      DOMContentLoaded_event.initEvent("DOMContentLoaded", true, true);
      window.document.dispatchEvent(DOMContentLoaded_event);
    });
  }, []);

  useEffect(() => {
    axios
      .get(constants.GET_PM25_CATEGORY_COUNT_URI)
      .then((res) => res.data)
      .then((data) => {
        setPm25CategoriesLocationCount(data);
        console.log(data);
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);

  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetch(constants.GET_HISTORICAL_DAILY_MEAN_AVERAGES_FOR_LAST_28_DAYS_URI)
      .then((res) => res.json())
      .then((locationsData) => {
        setLocations(locationsData.results);
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);

  const locationsGraphData = {
    labels: locations.labels,
    datasets: [
      {
        label: "PM2.5(µg/m3)",
        data: locations.average_pm25_values,
        fill: false, // Don't fill area under the line
        borderColor: palette.primary.main, // Line color
        backgroundColor: locations.background_colors, //palette.primary.main,
      },
    ],
  };

  const options_main = {
    annotation: {
      annotations: [
        {
          type: "line",
          mode: "horizontal",
          scaleID: "y-axis-0",
          value: 25,
          borderColor: palette.text.secondary,
          borderWidth: 2,
          label: {
            enabled: true,
            content: "WHO AQG",
            //backgroundColor: palette.white,
            titleFontColor: palette.text.primary,
            bodyFontColor: palette.text.primary,
            position: "right",
          },
        },
      ],
    },
    responsive: true,
    maintainAspectRatio: true,
    animation: false,
    legend: { display: false },
    cornerRadius: 0,
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
      callbacks: {
        //title: (items, data) => data.labels[items[0].index],
        //afterTitle: (items, data) =>
        //return data['labels'][tooltipItem[0]['index']]
        //label: (item, data) => data.datasets[item.datasetIndex].data[item.index]
      },
    },
    layout: { padding: 0 },
    scales: {
      xAxes: [
        {
          barThickness: 12,
          maxBarThickness: 10,
          barPercentage: 0.5,
          categoryPercentage: 0.5,
          ticks: {
            fontColor: palette.text.secondary,
            //fontSize:10
          },
          gridLines: {
            display: false,
            drawBorder: false,
          },
          scaleLabel: {
            display: true,
            labelString: "Locations",
          },
        },
      ],
      yAxes: [
        {
          ticks: {
            fontColor: palette.text.secondary,
            beginAtZero: true,
            min: 0,
            //suggestedMin:20
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
          scaleLabel: {
            display: true,
            labelString: "PM2.5(µg/m3)",
          },
        },
      ],
    },
  };

  const rootContainerId = "widget-container";
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

  const options = [
    { key: "Print", action: print, text: "Print" },
    { key: "JPEG", action: exportToJpeg, text: "Save as JPEG" },
    { key: "PNG", action: exportToPng, text: "Save as PNG" },
    { key: "PDF", action: exportToPdf, text: "Save as PDF" },
  ];

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExport = ({ action }) => () => {
    const chart = document.querySelector(`#${rootContainerId}`);
    handleClose();
    action(chart);
  };

  const open = Boolean(anchorEl);

  return (
    <div className={classes.root}>
      <header
        style={{
          display: "inline-flex",
          flexWrap: "wrap",
          width: "674px",
          padding: "0 0 30px 0",
        }}
      >
        <h4>Welcome to the AirQo ANALYTICS dashboard</h4>
        <br />
        <h6>Number of nodes at each AQI risk level</h6>
        <br />
      </header>
      <Grid container spacing={4}>
        <Grid item lg={2} sm={6} xl={2} xs={12}>
          <PollutantCategory
            pm25level="Good"
            pm25levelCount={
              typeof pm25CategoriesLocationCount != "undefined" &&
              pm25CategoriesLocationCount != null &&
              pm25CategoriesLocationCount.length > 0
                ? pm25CategoriesLocationCount[0]["locations_with_category_good"]
                    .category_count
                : ""
            }
            iconClass="pm25Good"
          />
        </Grid>
        <Grid item lg={2} sm={6} xl={2} xs={12}>
          <PollutantCategory
            pm25level="Moderate"
            pm25levelCount={
              typeof pm25CategoriesLocationCount != "undefined" &&
              pm25CategoriesLocationCount != null &&
              pm25CategoriesLocationCount.length > 0
                ? pm25CategoriesLocationCount[1][
                    "locations_with_category_moderate"
                  ].category_count
                : ""
            }
            iconClass="pm25Moderate"
          />
        </Grid>
        <Grid item lg={2} sm={6} xl={2} xs={12}>
          <PollutantCategory
            pm25level="UHFSG"
            pm25levelCount={
              typeof pm25CategoriesLocationCount != "undefined" &&
              pm25CategoriesLocationCount != null &&
              pm25CategoriesLocationCount.length > 0
                ? pm25CategoriesLocationCount[2].locations_with_category_UH4SG
                    .category_count
                : ""
            }
            iconClass="pm25UH4SG"
          />
        </Grid>

        <Grid item lg={2} sm={6} xl={2} xs={12}>
          <PollutantCategory
            pm25level="Unhealthy"
            pm25levelCount={
              typeof pm25CategoriesLocationCount != "undefined" &&
              pm25CategoriesLocationCount != null &&
              pm25CategoriesLocationCount.length > 0
                ? pm25CategoriesLocationCount[3]
                    .locations_with_category_unhealth.category_count
                : ""
            }
            iconClass="pm25UnHealthy"
          />
        </Grid>

        <Grid item lg={2} sm={6} xl={2} xs={12}>
          <PollutantCategory
            pm25level="Very Unhealthy"
            pm25levelCount={
              typeof pm25CategoriesLocationCount != "undefined" &&
              pm25CategoriesLocationCount != null &&
              pm25CategoriesLocationCount.length > 0
                ? pm25CategoriesLocationCount[4]
                    .locations_with_category_very_unhealthy.category_count
                : ""
            }
            iconClass="pm25VeryUnHealthy"
          />
        </Grid>
        <Grid item lg={2} sm={6} xl={2} xs={12}>
          <PollutantCategory
            pm25level="Hazardous"
            pm25levelCount={
              typeof pm25CategoriesLocationCount != "undefined" &&
              pm25CategoriesLocationCount != null &&
              pm25CategoriesLocationCount.length > 0
                ? pm25CategoriesLocationCount[5]
                    .locations_with_category_hazardous.category_count
                : ""
            }
            iconClass="pm25Harzadous"
          />
        </Grid>
        <Grid item lg={6} md={6} sm={12} xl={6} xs={12} container spacing={2}>
          <Grid item lg={12} md={12} sm={12} xl={12} xs={12}>
            <Card
              {...rest}
              className={clsx(classes.chartCard)}
              id={rootContainerId}
            >
              <CardHeader
                title={`Mean Daily PM2.5 for Past 28 Days From ${dateValue}`}
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
                      open={open}
                      onClose={handleClose}
                      PaperProps={paperProps}
                    >
                      {options.map((option) => (
                        <MenuItem
                          key={option.key}
                          onClick={handleExport(option)}
                        >
                          {option.text}
                        </MenuItem>
                      ))}
                    </Menu>
                  </Grid>
                }
              />
              <Divider />
              <CardContent>
                <div className={classes.chartContainer}>
                  <Bar data={locationsGraphData} options={options_main} />
                </div>
              </CardContent>
            </Card>
          </Grid>
          <Grid item lg={12} md={12} sm={12} xl={12} xs={12}>
            <ExceedancesChart
              className={clsx(classes.chartCard)}
              chartContainer={classes.chartContainer}
              idSuffix="exceedances"
            />
          </Grid>
        </Grid>

        <Grid item lg={6} md={6} sm={12} xl={6} xs={12}>
          <Grid item lg={12} sm={12} xl={12} xs={12}>
            <div className={classes.mapContainer}>
              <Map />
            </div>
          </Grid>
        </Grid>
        {userDefaultGraphs &&
          userDefaultGraphs.map((filter, key) => {
            return (
              <Grid
                item
                lg={6}
                md={6}
                sm={12}
                xl={6}
                xs={12}
                key={`userDefaultGraphs-${key}`}
              >
                <CustomisableChart
                  className={clsx(classes.chartCard)}
                  defaultFilter={filter}
                  idSuffix={`custom-${key + 1}`}
                />
              </Grid>
            );
          })}
      </Grid>
    </div>
  );
};

Dashboard.propTypes = {
  className: PropTypes.string,
  mappedAuth: PropTypes.object.isRequired,
  fetchDefaults: PropTypes.func.isRequired,
};

export default Dashboard;
