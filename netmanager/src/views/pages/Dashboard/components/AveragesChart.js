import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Badge,
  Link,
  CardActions
} from '@material-ui/core';
import clsx from 'clsx';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import { MoreHoriz } from '@material-ui/icons';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { Bar } from 'react-chartjs-2';
import domtoimage from 'dom-to-image';
import JsPDF from 'jspdf';
import palette from 'theme/palette';
import createAxiosInstance from 'views/apis/axiosConfig';
import { DAILY_MEAN_AVERAGES_URI } from 'config/urls/analytics';
import { roundToEndOfDay, roundToStartOfDay } from 'utils/dateTime';
import { isEmpty, unzip, zip } from 'underscore';
import moment from 'moment';
import { useCurrentAirQloudData } from 'redux/AirQloud/selectors';
import { flattenSiteOptions } from 'utils/sites';
import { usePollutantsOptions } from 'utils/customHooks';
import OutlinedSelect from '../../../components/CustomSelects/OutlinedSelect';
import PropTypes from 'prop-types';
import { BASE_AUTH_TOKEN } from 'utils/envVariables';

function appendLeadingZeroes(n) {
  if (n <= 9) {
    return '0' + n;
  }
  return n;
}

const AveragesChart = ({ classes, analyticsSites, isGrids, isCohorts, analyticsDevices }) => {
  const rootContainerId = 'widget-container';
  const iconButton = 'exportIconButton';
  const airqloud = useCurrentAirQloudData();
  const filter = (node) => node.id !== iconButton;
  const endDate = moment(new Date()).toISOString();
  const startDate = moment(endDate).subtract(28, 'days').toISOString();
  const [averageChartSites, setAverageChartSites] = useState([]);
  const [averageChartDevices, setAverageChartDevices] = useState([]);
  const [displayedLocations, setDisplayedLocations] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);

  const [open, setOpen] = React.useState(false);

  const pollutantOptions = usePollutantsOptions();

  const [pollutant, setPollutant] = useState({
    value: 'pm2_5',
    label: 'PM 2.5'
  });
  const [tempPollutant, setTempPollutant] = useState(pollutant);

  const [customChartTitle, setCustomChartTitle] = useState(
    `Mean Daily ${pollutant.label} Over the Past 28 Days`
  );

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (isGrids) {
      const siteOptions = [];
      !isEmpty(analyticsSites) &&
        analyticsSites.map((site) => {
          siteOptions.push(site._id);
        });
      setAverageChartSites(siteOptions);
    } else {
      setAverageChartSites(flattenSiteOptions(airqloud.siteOptions));
    }
    setLoading(false);
  }, [analyticsSites, airqloud]);

  useEffect(() => {
    setLoading(true);
    if (isCohorts) {
      const deviceOptions = [];
      !isEmpty(analyticsDevices) &&
        analyticsDevices.map((device) => {
          deviceOptions.push(device._id);
        });
      setAverageChartDevices(deviceOptions);
    }
    setLoading(false);
  }, [analyticsDevices]);

  const handlePollutantChange = (pollutant) => {
    setTempPollutant(pollutant);
  };

  const handleModalClose = () => {
    setAnchorEl(null);
    setOpen(false);
    setTempPollutant(pollutant);
  };

  const [averages, setAverages] = useState({
    labels: [],
    average_values: [],
    background_colors: []
  });

  let todaysDate = new Date();

  const dateValue = appendLeadingZeroes(
    todaysDate.getDate() +
      '/' +
      appendLeadingZeroes(todaysDate.getMonth() + 1) +
      '/' +
      todaysDate.getFullYear()
  );

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const openMenu = Boolean(anchorEl);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const ITEM_HEIGHT = 48;
  const paperProps = {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5,
      width: 150
    }
  };

  const labelMapper = {
    pm2_5: 'PM₂.₅(µg/m³)',
    pm10: 'PM10 (µg/m³)',
    no2: 'NO2 (µg/m³)'
  };

  const annotationMapper = {
    pm2_5: {
      value: 25,
      label_content: 'WHO AQG'
    },
    pm10: {
      value: 50,
      label_content: 'WHO AQG'
    },
    no2: {
      value: 40,
      label_content: 'WHO AQG'
    }
  };

  const [customisedLabel, setCustomisedLabel] = useState(labelMapper[pollutant.value]);

  const [customisedAnnotation, setCustomAnnotations] = useState(annotationMapper[pollutant.value]);

  const print = async (chart) => {
    try {
      const dataUrl = await domtoimage.toJpeg(chart, { filter });
      let html = '<html><head><title></title></head>';
      html += '<body style="width: 100%; padding: 0; margin: 0;"';
      html += ' onload="window.focus(); window.print(); window.close()">';
      html += `<img src="${dataUrl}" /></body></html>`;

      const printWindow = window.open('', 'print');
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('oops, something went wrong!', err);
    }
  };

  const exportToImage = async (chart, format, exportFunc) => {
    try {
      const dataUrl = await exportFunc(chart, { filter });
      const link = document.createElement('a');
      document.body.appendChild(link);
      link.download = `chart.${format}`;
      link.href = dataUrl;
      link.click();
      link.remove();
    } catch (err) {
      console.error('oops, something went wrong!', err);
    }
  };

  const exportToJpeg = (chart) => exportToImage(chart, 'jpeg', domtoimage.toJpeg);

  const exportToPng = (chart) => exportToImage(chart, 'png', domtoimage.toPng);

  const exportToPdf = async (chart) => {
    const width = chart.offsetWidth;
    const height = chart.offsetHeight;
    try {
      const dataUrl = await domtoimage.toJpeg(chart, { filter });
      const doc = new JsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [width, height]
      });
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = doc.internal.pageSize.getHeight();
      doc.addImage(dataUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      doc.save('chart');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('oops, something went wrong!', err);
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const numLocations = displayedLocations.length;

  const options = [
    { key: 'Customise', action: handleClickOpen, text: 'Customise Chart' },
    { key: 'Print', action: print, text: 'Print' },
    { key: 'JPEG', action: exportToJpeg, text: 'Save as JPEG' },
    { key: 'PNG', action: exportToPng, text: 'Save as PNG' },
    { key: 'PDF', action: exportToPdf, text: 'Save as PDF' }
  ];

  const handleExport = ({ action }) => () => {
    const chart = document.querySelector(`#${rootContainerId}`);
    handleClose();
    action(chart);
  };

  const locationsGraphData = {
    labels: displayedLocations.map(([location]) => location),
    datasets: [
      {
        label: customisedLabel,
        data: displayedLocations.map(([_, value]) => value),
        fill: false,
        borderColor: palette.primary.main,
        backgroundColor: displayedLocations.map(([_, __, color]) => color)
      }
    ]
  };

  const options_main = {
    annotation: {
      annotations: [
        {
          type: 'line',
          mode: 'horizontal',
          scaleID: 'y-axis-0',
          value: customisedAnnotation.value,
          borderColor: palette.text.secondary,
          borderWidth: 2,
          label: {
            enabled: true,
            content: customisedAnnotation.label_content,
            //backgroundColor: palette.white,
            titleFontColor: palette.text.primary,
            bodyFontColor: palette.text.primary,
            position: 'right'
          }
        }
      ]
    },
    responsive: true,
    maintainAspectRatio: true,
    animation: false,
    legend: { display: false },
    cornerRadius: 0,
    tooltips: {
      enabled: true,
      mode: 'index',
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
      }
    },
    layout: { padding: 0 },
    scales: {
      xAxes: [
        {
          barThickness: numLocations > 0 ? Math.max(150 / numLocations, 20) : 20,
          maxBarThickness: numLocations > 0 ? Math.max(150 / numLocations, 20) : 20,
          barPercentage: numLocations > 0 ? 1 / numLocations : 0.5,
          categoryPercentage: numLocations > 0 ? 1 / numLocations : 0.5,
          ticks: {
            fontColor: 'black',
            callback: (value) => `${value.substr(0, 7)}`
          },
          gridLines: {
            display: false,
            drawBorder: false
          },
          scaleLabel: {
            display: true,
            labelString: 'Locations'
          }
        }
      ],
      yAxes: [
        {
          ticks: {
            fontColor: palette.text.secondary,
            beginAtZero: true,
            min: 0
            //suggestedMin:20
          },
          gridLines: {
            borderDash: [2],
            borderDashOffset: [2],
            color: palette.divider,
            drawBorder: false,
            zeroLineBorderDash: [2],
            zeroLineBorderDashOffset: [2],
            zeroLineColor: palette.divider
          },
          scaleLabel: {
            display: true,
            labelString: customisedLabel
          }
        }
      ]
    }
  };

  const fetchAndSetAverages = (pollutant) => {
    setLoading(true);
    const jwtToken = localStorage.getItem('jwtToken');
    createAxiosInstance()
      .post(
        DAILY_MEAN_AVERAGES_URI,
        isCohorts
          ? {
              startDate: roundToStartOfDay(startDate).toISOString(),
              endDate: roundToEndOfDay(endDate).toISOString(),
              pollutant: pollutant.value,
              devices: averageChartDevices
            }
          : {
              startDate: roundToStartOfDay(startDate).toISOString(),
              endDate: roundToEndOfDay(endDate).toISOString(),
              pollutant: pollutant.value,
              sites: averageChartSites
            }
      )
      .then((response) => response.data)
      .then((responseData) => {
        const averagesData = responseData.data;
        const zippedArr = zip(
          averagesData.labels,
          averagesData.average_values,
          averagesData.background_colors
        );
        zippedArr.sort((a, b) => {
          const a0 = a[0].trim(),
            b0 = b[0].trim();
          if (a0 < b0) return -1;
          if (a0 > b0) return 1;
          return 0;
        });
        const [labels, average_values, background_colors] = unzip(zippedArr);
        setAllLocations(zippedArr);

        setDisplayedLocations(zippedArr.slice(0, 10));

        setAverages({ labels, average_values, background_colors });
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
        console.log(e);
      });
  };

  const Location = ({ location, value }) => {
    const getLocationStatus = (value) => {
      if (value <= 12.09) {
        return { status: 'Good', color: 'green' };
      } else if (value <= 35.49) {
        return { status: 'Moderate', color: 'orange' };
      } else if (value <= 55.49) {
        return { status: 'UFSG', color: 'yellow' };
      } else if (value <= 150.49) {
        return { status: 'Unhealthy', color: 'red' };
      } else if (value <= 250.49) {
        return { status: 'Very Unhealthy', color: 'purple' };
      } else {
        return { status: 'Hazardous', color: 'brown' };
      }
    };
    const { status, color } = getLocationStatus(value);

    const locationStyle = {
      fontWeight: 'bold',
      color: '#175df5',
      marginRight: '10px'
    };

    const badgeStyle = {
      marginRight: '10px',
      color: color,
      padding: '5px 8px',
      borderRadius: '4px'
    };
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxHeight: 'calc(100vh - 200px)',
          overflow: 'auto',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          marginBottom: '10px'
        }}>
        <span id="location" style={locationStyle}>
          {location}
        </span>
        <Badge badgeContent={status} style={badgeStyle} />
        <span
          id="value"
          style={{
            fontWeight: 'bold'
          }}>
          {value}
        </span>
      </div>
    );
  };

  Location.propTypes = {
    location: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired
  };

  const ProgressBars = () => {
    const barRanges = [
      { label: 'Good:', min: 0, max: 12.09 },
      { label: 'Moderate:', min: 12.1, max: 35.49 },
      { label: 'Unhealthy For Sensitive Groups:', min: 35.5, max: 55.49 },
      { label: 'Unhealthy:', min: 55.5, max: 150.49 },
      { label: 'Very Unhealthy:', min: 150.5, max: 250.49 },
      { label: 'Hazardous:', min: 250.5, max: 500 }
    ];

    const totalLocations = allLocations.length;

    const barPercentages = barRanges.map(({ min, max }) => {
      const count = allLocations.filter(([_, value]) => value >= min && value <= max).length;
      return (count / totalLocations) * 100;
    });

    const maxPercentage = Math.max(...barPercentages);

    return (
      <Card
        style={{
          width: '100%',
          height: '100%'
        }}>
        <CardContent>
          <div>
            {barRanges.map(({ label }, index) => {
              const barPercentage = barPercentages[index];

              const count = allLocations.filter(
                ([_, value]) => value >= barRanges[index].min && value <= barRanges[index].max
              ).length;

              return (
                <div key={index} style={{ marginBottom: '8px' }}>
                  <div
                    style={{
                      fontWeight: 'bold',
                      display: 'flex',
                      fontSize: '16px',
                      marginBottom: '5px',
                      justifyContent: 'space-between',
                      marginTop: '5px'
                    }}>
                    {label}
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: '10px',
                        fontWeight: 'bold'
                      }}>
                      {count} Locations{' '}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      maxWidth: '100%',
                      height: '5px',
                      backgroundColor: 'lightgray',
                      marginBottom: '20px'
                    }}>
                    <div
                      style={{
                        width: `${barPercentage}%`,
                        height: '100%',
                        backgroundColor: '#175df5'
                      }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPollutant(tempPollutant);
    setCustomChartTitle(`Mean Daily ${tempPollutant.label} Over the Past 28 Days`);
    setCustomisedLabel(labelMapper[tempPollutant.value]);
    setCustomAnnotations(annotationMapper[tempPollutant.value]);
    handleModalClose();
    fetchAndSetAverages(tempPollutant);
  };

  useEffect(() => {
    if (isCohorts) {
      if (!isEmpty(averageChartDevices)) {
        fetchAndSetAverages(pollutant);
      }

      if (isEmpty(averageChartDevices)) {
        setAllLocations([]);
        setDisplayedLocations([]);
        setAverages({
          labels: [],
          average_values: [],
          background_colors: []
        });
      }
    } else {
      if (!isEmpty(averageChartSites)) {
        fetchAndSetAverages(pollutant);
      }

      if (isEmpty(averageChartSites)) {
        setAllLocations([]);
        setDisplayedLocations([]);
        setAverages({
          labels: [],
          average_values: [],
          background_colors: []
        });
      }
    }
  }, [averageChartSites, modalOpen, averageChartDevices]);

  const handleSeeMoreClick = () => {
    setDisplayedLocations(allLocations);
    setModalOpen(true);
  };

  return (
    <Grid item lg={6} md={6} sm={12} xl={6} xs={12}>
      <Card className={clsx(classes.chartCard)} id={rootContainerId}>
        <CardHeader
          title={customChartTitle}
          subheader={`from ${dateValue}`}
          action={
            <Grid>
              <IconButton
                size="small"
                color="primary"
                id={iconButton}
                onClick={handleClick}
                className={classes.chartSaveButton}>
                <MoreHoriz />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleClose}
                PaperProps={paperProps}>
                {options.map((option) => (
                  <MenuItem key={option.key} onClick={handleExport(option)}>
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
            {loading ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '30vh'
                }}>
                loading...
              </div>
            ) : isEmpty(locationsGraphData.labels) ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '30vh'
                }}>
                No data found
              </div>
            ) : (
              <Bar data={locationsGraphData} options={options_main} />
            )}
          </div>
        </CardContent>
        <CardActions
          className={classes.cardActions}
          style={{
            justifyContent: 'flex-end',
            marginTop: '-20px'
          }}>
          <Button
            variant="outlined"
            color="primary"
            disableRipple
            disableFocusRipple
            disableTouchRipple
            onClick={handleSeeMoreClick}
            style={{
              textTransform: 'none',
              paddingLeft: 0,
              paddingRight: 0,
              boxShadow: 'none',
              background: 'transparent',
              border: 'none'
            }}>
            View all Locations <ArrowForwardIcon />
          </Button>
        </CardActions>
      </Card>
      <Dialog
        // classes={{ paper: classes.dialogPaper }}
        open={open}
        onClose={handleModalClose}
        aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title" onClose={handleClose}>
          Customise Chart by Selecting the Various Options
        </DialogTitle>
        <Divider />
        <DialogContent>
          <form onSubmit={handleSubmit} id="customisable-form">
            <Grid container spacing={2} style={{ marginTop: '5px' }}>
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
            </Grid>
          </form>
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button onClick={handleModalClose} color="primary" variant="outlined">
            Cancel
          </Button>
          <Button variant="contained" color="primary" type="submit" form="customisable-form">
            Customise
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        fullscreen
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        aria-labelledby="locations-dialog-title"
        PaperProps={{
          style: {
            width: '100%',
            maxWidth: 'none',
            margin: '10px',
            borderRadius: '8px'
          }
        }}>
        <h5
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            fontWeight: 'bold',
            padding: '20px',
            fontSize: '20px'
          }}>
          {customChartTitle}
        </h5>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item lg={6} md={6} sm={12} xl={6} xs={12}>
              <ProgressBars />
            </Grid>
            <Grid item lg={6} md={6} sm={12} xl={6} xs={12}>
              <Card>
                <CardContent
                  style={{
                    maxHeight: 'calc(100vh - 200px)',
                    overflow: 'auto',
                    // borderRadius: '2px',
                    marginBottom: '2px'
                  }}>
                  {allLocations.map(([location, value, color]) => (
                    <Location key={location} location={location} value={value} />
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default AveragesChart;
