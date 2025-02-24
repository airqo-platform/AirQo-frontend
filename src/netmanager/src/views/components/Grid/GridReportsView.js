import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useHistory, useParams } from 'react-router-dom';
import { ArrowBackIosRounded } from '@material-ui/icons';
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
  CircularProgress
} from '@material-ui/core';
import CustomMaterialTable from '../Table/CustomMaterialTable';
import { useInitScrollTop } from 'utils/customHooks';
import ErrorBoundary from 'views/ErrorBoundary/ErrorBoundary';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import { updateMainAlert } from 'redux/MainAlert/operations';
import { roundToStartOfDay, roundToEndOfDay } from 'utils/dateTime';
import { generateAirQloudDataSummaryApi } from 'views/apis/analytics';
import {
  generateAirQloudUptimeSummaryApi,
  getGridUptimeSummaryApi
} from '../../apis/deviceMonitoring';
import Typography from '@material-ui/core/Typography';

// css
import 'react-leaflet-fullscreen/dist/styles.css';
import 'assets/css/location-registry.css';
import { isEmpty } from 'underscore';
import { generateGridDataSummaryApi } from '../../apis/analytics';

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

const GridReportsView = (props) => {
  const { className, airqloud, ...rest } = props;
  console.log('airqloud', airqloud);
  const classes = useStyles();
  useInitScrollTop();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dataSummaryReady, setDataSummaryReady] = useState(false);
  const [airQloudDataSummaryReport, setAirQloudDataSummaryReport] = useState(null);

  const [uptimeStartDate, setUptimeStartDate] = useState(null);
  const [uptimeEndDate, setUptimeEndDate] = useState(null);
  const [uptimeSummaryReady, setUptimeSummaryReady] = useState(false);
  const [airQloudUptimeSummaryReport, setAirQloudUptimeSummaryReport] = useState(null);

  const formatDate = (date) => {
    const date_ = new Date(date);
    return date_.toISOString().split('T')[0];
  };

  const disableUptimeReportGenerationBtn = () => {
    return !(uptimeStartDate && uptimeEndDate) || loading;
  };

  const disableReportGenerationBtn = () => {
    return !(startDate && endDate) || loading;
  };

  const generateAirQloudUptimeReport = (e) => {
    e.preventDefault();

    setLoading(true);

    let data = {};
    if (airqloud) {
      data = {
        startDateTime: roundToStartOfDay(new Date(uptimeStartDate).toISOString()),
        endDateTime: roundToEndOfDay(new Date(uptimeEndDate).toISOString()),
        grid: airqloud._id
      };
    }

    generateAirQloudUptimeReportFunc(data);
  };

  const generateAirQloudDataReport = (e) => {
    e.preventDefault();

    setLoading(true);

    let data = {};
    if (airqloud) {
      data = {
        startDateTime: roundToStartOfDay(new Date(startDate).toISOString()),
        endDateTime: roundToEndOfDay(new Date(endDate).toISOString()),
        grid: airqloud._id
      };
    }

    generateAirQloudDataReportFunc(data);
  };

  const generateAirQloudDataReportFunc = async (body) => {
    await generateGridDataSummaryApi(body)
      .then((response) => response.data)
      .then((resData) => {
        //TODO: Populate the charts and reports to be displayed.

        if (resData && !isEmpty(resData)) {
          setAirQloudDataSummaryReport(resData);
          setLoading(false);
          setStartDate(null);
          setEndDate(null);
          setDataSummaryReady(true);
          dispatch(
            updateMainAlert({
              message: 'Grid Data Summary Report Generated ',
              show: true,
              severity: 'success'
            })
          );
        } else {
          setLoading(false);
          setStartDate(null);
          setEndDate(null);
          dispatch(
            updateMainAlert({
              message:
                'Uh-oh! No data found for the selected time period. Select alternative time period.',
              show: true,
              severity: 'success'
            })
          );
        }
      })
      .catch((err) => {
        dispatch(
          updateMainAlert({
            message: err.message,
            show: true,
            severity: 'error'
          })
        );
        setLoading(false);
        setStartDate(null);
        setEndDate(null);
      });
  };

  const generateAirQloudUptimeReportFunc = async (body) => {
    await getGridUptimeSummaryApi(body)
      .then((response) => response.data)
      .then((resData) => {
        //TODO: Populate the charts and reports to be displayed.
        if (resData && !isEmpty(resData)) {
          setAirQloudUptimeSummaryReport(resData);
          setLoading(false);
          setUptimeEndDate(null);
          setUptimeEndDate(null);
          setUptimeSummaryReady(true);
          dispatch(
            updateMainAlert({
              message: 'Grid uptime report successfully generated',
              show: true,
              severity: 'success'
            })
          );
        } else {
          setLoading(false);
          setUptimeEndDate(null);
          setUptimeEndDate(null);
          dispatch(
            updateMainAlert({
              message:
                'Uh-oh! No data found for the selected time period. Select alternative time period.',
              show: true,
              severity: 'success'
            })
          );
        }
      })
      .catch((err) => {
        dispatch(
          updateMainAlert({
            message: err.message,
            show: true,
            severity: 'error'
          })
        );

        setLoading(false);
        setUptimeStartDate(null);
        setUptimeEndDate(null);
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
        <div
          style={{
            margin: '50px auto',
            // minHeight: "400px",
            maxWidth: '1500px'
          }}
        >
          <div className={classes.rootxx}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Card
                  {...rest}
                  className={clsx(classes.root, className)}
                  style={{ overflow: 'visible' }}
                >
                  <Typography className={classes.cardTitle}>
                    Generate Grid Data Summary Report
                  </Typography>
                  <p>
                    Select the time period of your interest to generate the report for this airqloud
                  </p>
                  <form onSubmit={generateAirQloudDataReport}>
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item md={12} xs={12}>
                          <h4 style={{ textTransform: 'capitalize' }}></h4>
                        </Grid>
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
                      </Grid>
                    </CardContent>

                    <Divider />
                    <CardActions>
                      <span style={{ position: 'relative' }}>
                        <Button
                          color="primary"
                          variant="outlined"
                          type="submit"
                          disabled={disableReportGenerationBtn()}
                        >
                          {' '}
                          Generate Data Summary Report
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
                </Card>
              </Grid>
            </Grid>
          </div>
        </div>

        <div
          style={{
            margin: '50px auto',
            maxWidth: '1500px'
          }}
        >
          {dataSummaryReady ? (
            <div className={classes.rootxx}>
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <Card
                    {...rest}
                    className={clsx(classes.root, className)}
                    style={{ overflow: 'visible' }}
                  >
                    <Typography className={clsx(classes.cardTitle, classes.titleSpacing)}>
                      {`Data Summary For ${airQloudDataSummaryReport.grid} From ${formatDate(
                        airQloudDataSummaryReport.start_date_time,
                        'YYYY-MM-DD'
                      )} to ${formatDate(airQloudDataSummaryReport.end_date_time, 'YYYY-MM-DD')}`}
                    </Typography>

                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item md={12} xs={12} container spacing={3}>
                          <Grid item lg={2} sm={6} xl={2} xs={12}>
                            <Typography
                              className={classes.title}
                              color="textSecondary"
                              gutterBottom
                              variant="body2"
                            >
                              Hourly Records
                            </Typography>
                            <Typography variant="h3">
                              {airQloudDataSummaryReport.hourly_records}
                            </Typography>
                          </Grid>

                          <Grid item lg={2} sm={6} xl={2} xs={12}>
                            <Typography
                              className={classes.title}
                              color="textSecondary"
                              gutterBottom
                              variant="body2"
                            >
                              Calibrated Records
                            </Typography>
                            <Typography variant="h3">
                              {airQloudDataSummaryReport.calibrated_records}
                            </Typography>
                          </Grid>

                          <Grid item lg={2} sm={6} xl={2} xs={12}>
                            <Typography
                              className={classes.title}
                              color="textSecondary"
                              gutterBottom
                              variant="body2"
                            >
                              Uncalibrated Records
                            </Typography>
                            <Typography variant="h3">
                              {airQloudDataSummaryReport.uncalibrated_records}
                            </Typography>
                          </Grid>

                          <Grid item lg={2} sm={6} xl={2} xs={12}>
                            <Typography
                              className={classes.title}
                              color="textSecondary"
                              gutterBottom
                              variant="body2"
                            >
                              Calibrated Records(%)
                            </Typography>
                            <Typography variant="h3">
                              {airQloudDataSummaryReport.calibrated_percentage.toFixed(2)}
                            </Typography>
                          </Grid>

                          <Grid item lg={2} sm={6} xl={2} xs={12}>
                            <Typography
                              className={classes.title}
                              color="textSecondary"
                              gutterBottom
                              variant="body2"
                            >
                              UnCalibrated Records (%)
                            </Typography>
                            <Typography variant="h3">
                              {airQloudDataSummaryReport.uncalibrated_percentage.toFixed(2)}
                            </Typography>
                          </Grid>
                        </Grid>

                        <Grid item md={12} xs={12}>
                          <CustomMaterialTable
                            title="Grid Sites Data Summary "
                            userPreferencePaginationKey={'siteDevices'}
                            columns={[
                              {
                                title: 'Site Name',
                                field: 'site_name'
                              },
                              {
                                title: 'Hourly Data (Records Count)',
                                field: 'hourly_records'
                              },
                              {
                                title: 'Calibrated Data (Records Count)',
                                field: 'calibrated_records'
                              },
                              {
                                title: 'UnCalibrated Data (Records Count)',
                                field: 'uncalibrated_records'
                              },
                              {
                                title: 'Calibrated Data (%)',
                                field: 'calibrated_percentage'
                              },
                              {
                                title: 'UnCalibrated Data (%)',
                                field: 'uncalibrated_percentage'
                              }
                            ]}
                            data={airQloudDataSummaryReport.sites || []}
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
                                fontSize: 14,
                                fontWeight: 600
                              }
                            }}
                          />
                        </Grid>

                        <Grid item md={12} xs={12}>
                          <CustomMaterialTable
                            title="Grid Devices Data Summary "
                            userPreferencePaginationKey={'airqloudDevices'}
                            columns={[
                              {
                                title: 'Device',
                                field: 'device'
                              },
                              {
                                title: 'Hourly Data (Records Count)',
                                field: 'hourly_records'
                              },
                              {
                                title: 'Calibrated Data (Records Count)',
                                field: 'calibrated_records'
                              },
                              {
                                title: 'Un Calibrated Data (Records Count)',
                                field: 'uncalibrated_records'
                              },
                              {
                                title: 'Calibrated Data (%)',
                                field: 'calibrated_percentage'
                              },
                              {
                                title: 'UnCalibrated Data (%)',
                                field: 'uncalibrated_percentage'
                              }
                            ]}
                            data={airQloudDataSummaryReport.devices || []}
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
                                fontSize: 14,
                                fontWeight: 600
                              }
                            }}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </div>
          ) : (
            <Paper style={{ textAlign: 'center', padding: '50px' }}>
              <p>Grid data summary report will appear here</p>
            </Paper>
          )}
        </div>

        <div
          style={{
            margin: '50px auto',
            // minHeight: "400px",
            maxWidth: '1500px'
          }}
        >
          <div className={classes.rootxx}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Card
                  {...rest}
                  className={clsx(classes.root, className)}
                  style={{ overflow: 'visible' }}
                >
                  <Typography className={classes.cardTitle}>Generate Grid Uptime Report</Typography>
                  <p>
                    Select the time period of your interest to view the uptime report for this
                    airqloud
                  </p>
                  <form onSubmit={generateAirQloudUptimeReport}>
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item md={12} xs={12}>
                          <h4 style={{ textTransform: 'capitalize' }}></h4>
                        </Grid>
                        <Grid item md={6} xs={12}>
                          <TextField
                            label="Start Date"
                            className="reactSelect"
                            fullWidth
                            variant="outlined"
                            value={uptimeStartDate}
                            InputLabelProps={{ shrink: true }}
                            type="date"
                            onChange={(event) => setUptimeStartDate(event.target.value)}
                          />
                        </Grid>

                        <Grid item md={6} xs={12}>
                          <TextField
                            label="End Date"
                            className="reactSelect"
                            fullWidth
                            variant="outlined"
                            value={uptimeEndDate}
                            InputLabelProps={{ shrink: true }}
                            type="date"
                            onChange={(event) => setUptimeEndDate(event.target.value)}
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
                          disabled={disableUptimeReportGenerationBtn()}
                        >
                          {' '}
                          Generate Uptime Report for the Grid
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
                </Card>
              </Grid>
            </Grid>
          </div>
        </div>

        <div
          style={{
            margin: '50px auto',
            maxWidth: '1500px'
          }}
        >
          {uptimeSummaryReady ? (
            <div className={classes.rootxx}>
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <Card
                    {...rest}
                    className={clsx(classes.root, className)}
                    style={{ overflow: 'visible' }}
                  >
                    <Typography className={clsx(classes.cardTitle, classes.titleSpacing)}>
                      {`Uptime Statistics For ${
                        airQloudUptimeSummaryReport.grid_name
                      } From ${formatDate(
                        airQloudUptimeSummaryReport.start_date_time,
                        'YYYY-MM-DD'
                      )} to ${formatDate(airQloudUptimeSummaryReport.end_date_time, 'YYYY-MM-DD')}`}
                    </Typography>

                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item md={12} xs={12} container spacing={3}>
                          <Grid item lg={2} sm={6} xl={2} xs={12}>
                            <Typography
                              className={classes.title}
                              color="textSecondary"
                              gutterBottom
                              variant="body2"
                            >
                              Uptime (%)
                            </Typography>
                            <Typography variant="h3">
                              {airQloudUptimeSummaryReport.uptime.toFixed(2)}
                            </Typography>
                          </Grid>

                          <Grid item lg={2} sm={6} xl={2} xs={12}>
                            <Typography
                              className={classes.title}
                              color="textSecondary"
                              gutterBottom
                              variant="body2"
                            >
                              Downtime (%)
                            </Typography>
                            <Typography variant="h3">
                              {airQloudUptimeSummaryReport.downtime.toFixed(2)}
                            </Typography>
                          </Grid>

                          <Grid item lg={2} sm={6} xl={2} xs={12}>
                            <Typography
                              className={classes.title}
                              color="textSecondary"
                              gutterBottom
                              variant="body2"
                            >
                              Data Points
                            </Typography>
                            <Typography variant="h3">
                              {airQloudUptimeSummaryReport.data_points}
                            </Typography>
                          </Grid>

                          <Grid item lg={2} sm={6} xl={2} xs={12}>
                            <Typography
                              className={classes.title}
                              color="textSecondary"
                              gutterBottom
                              variant="body2"
                            >
                              Hourly Threshold
                            </Typography>
                            <Typography variant="h3">
                              {airQloudUptimeSummaryReport.hourly_threshold}
                            </Typography>
                          </Grid>

                          <Grid item lg={2} sm={6} xl={2} xs={12}>
                            <Typography
                              className={classes.title}
                              color="textSecondary"
                              gutterBottom
                              variant="body2"
                            ></Typography>
                            <Typography variant="h3"></Typography>
                          </Grid>
                        </Grid>

                        <Grid item md={12} xs={12}>
                          <CustomMaterialTable
                            title="Grid Sites Uptime Summarry "
                            userPreferencePaginationKey={'siteDevices'}
                            columns={[
                              {
                                title: 'Site Name',
                                field: 'site_name'
                              },
                              {
                                title: 'Hourly Data Point(Records Count)',
                                field: 'data_points'
                              },

                              {
                                title: 'Uptime (%)',
                                field: 'uptime'
                              },
                              {
                                title: 'Downtown (%)',
                                field: 'downtime'
                              }
                            ]}
                            data={airQloudUptimeSummaryReport.sites || []}
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
                                fontSize: 14,
                                fontWeight: 600
                              }
                            }}
                          />
                        </Grid>

                        <Grid item md={12} xs={12}>
                          <CustomMaterialTable
                            title="Grid Devices Uptime Summary "
                            userPreferencePaginationKey={'airqloudDevices'}
                            columns={[
                              {
                                title: 'Device',
                                field: 'device'
                              },
                              {
                                title: 'Hourly Data Point(Records Count)',
                                field: 'data_points'
                              },

                              {
                                title: 'Uptime (%)',
                                field: 'uptime'
                              },
                              {
                                title: 'Downtown (%)',
                                field: 'downtime'
                              }
                            ]}
                            data={airQloudUptimeSummaryReport.devices || []}
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
                                fontSize: 14,
                                fontWeight: 600
                              }
                            }}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </div>
          ) : (
            <Paper style={{ textAlign: 'center', padding: '50px' }}>
              <p>Grid uptime report will appear here</p>
            </Paper>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

GridReportsView.propTypes = {
  className: PropTypes.string
};

export default GridReportsView;
