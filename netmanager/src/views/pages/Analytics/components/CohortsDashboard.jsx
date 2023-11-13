import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, Typography, makeStyles } from '@material-ui/core';
import ErrorBoundary from 'views/ErrorBoundary/ErrorBoundary';
import { useDispatch } from 'react-redux';
import { isEmpty } from 'validate.js';
import clsx from 'clsx';
import 'chartjs-plugin-annotation';
import {
  AveragesChart,
  ExceedancesChart,
  AddChart,
  PollutantCategory
} from '../../Dashboard/components';
import { useUserDefaultGraphsData } from 'redux/Dashboard/selectors';
import { loadUserDefaultGraphData } from 'redux/Dashboard/operations';
import D3CustomisableChart from '../../../components/d3/CustomisableChart';
import { loadMapEventsData } from 'redux/MapData/operations';
import { useEventsMapData } from 'redux/MapData/selectors';
import { PM_25_CATEGORY } from '../../../../utils/categories';
import { createDeviceOptions } from '..';
import { formatString } from './AirqloudDropdown';

const useStyles = makeStyles((theme) => ({
  chartCard: {},
  chartContainer: {
    minHeight: 250,
    position: 'relative'
  },
  customChartCard: {
    width: '100%',
    padding: '20px',
    minHeight: '200px'
  },
  differenceIcon: {
    color: theme.palette.text.secondary
  },
  chartContainer: {
    minHeight: 250,
    position: 'relative'
  },
  actions: {
    justifyContent: 'flex-end'
  }
}));

const CohortsDashboardView = ({ cohort, cohortDetails, loading }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const userDefaultGraphs = useUserDefaultGraphsData();

  const [cohortInfo, setCohortInfo] = useState({
    name: 'N/A',
    numberOfDevices: 0,
    devices: []
  });

  const [pm2_5SiteCount, setPm2_5SiteCount] = useState({
    Good: 0,
    Moderate: 0,
    UHFSG: 0,
    Unhealthy: 0,
    VeryUnhealthy: 0,
    Hazardous: 0
  });
  const recentEventsData = useEventsMapData();

  useEffect(() => {
    if (isEmpty(recentEventsData.features)) dispatch(loadMapEventsData());
  }, []);

  useEffect(() => {
    const initialCount = {
      Good: [],
      Moderate: [],
      UHFSG: [],
      Unhealthy: [],
      VeryUnhealthy: [],
      Hazardous: []
    };

    if (cohortInfo && cohortInfo.devices && cohortInfo.devices.length > 0) {
      const cohortDevices = cohortInfo.devices
        .map((device) => createDeviceOptions([device]))
        .flat();
      const cohortDevicesObj = cohortDevices.reduce((acc, curr) => {
        acc[curr.value] = curr;
        return acc;
      }, {});

      recentEventsData.features &&
        recentEventsData.features.forEach((feature) => {
          const deviceId = feature.properties.device_id;
          if (cohortDevicesObj[deviceId]) {
            const pm2_5Value =
              feature.properties.pm2_5.calibratedValue || feature.properties.pm2_5.value;
            Object.keys(PM_25_CATEGORY).forEach((key) => {
              const { min, max } = PM_25_CATEGORY[key];
              if (pm2_5Value >= min && pm2_5Value <= max) {
                initialCount[key].push({
                  device: cohortDevicesObj[deviceId].label,
                  deviceId,
                  pm2_5: pm2_5Value
                });
              }
            });
          }
        });
    }
    // console.log(initialCount);
    setPm2_5SiteCount(initialCount);
  }, [recentEventsData, cohortInfo]);

  useEffect(() => {
    if (!isEmpty(cohortDetails)) {
      setCohortInfo({
        name: cohortDetails.name,
        numberOfDevices: cohortDetails.numberOfDevices,
        devices: cohortDetails.devices
      });
    }

    if (isEmpty(cohortDetails)) {
      setCohortInfo({
        name: 'N/A',
        numberOfDevices: 0,
        devices: []
      });
    }
  }, [cohortDetails]);

  useEffect(() => {
    dispatch(loadUserDefaultGraphData(true, cohort._id));
  }, [cohort]);

  function appendLeadingZeroes(n) {
    if (n <= 9) {
      return '0' + n;
    }
    return n;
  }

  let todaysDate = new Date();
  const dateValue = appendLeadingZeroes(
    todaysDate.getDate() +
      '/' +
      appendLeadingZeroes(todaysDate.getMonth() + 1) +
      '/' +
      todaysDate.getFullYear()
  );

  return (
    <ErrorBoundary>
      <Box marginTop={'40px'}>
        <Box marginBottom={'20px'}>
          <Grid container spacing={4} alignItems="flex-start" justify="center">
            <Grid item lg={6} sm={6} xl={3} xs={12}>
              <Typography variant="subtitle2">Cohort name</Typography>
              <Typography variant="h2" style={{ textTransform: 'capitalize' }}>
                {formatString(cohort.name)}
              </Typography>
            </Grid>
            <Grid item lg={6} sm={6} xl={3} xs={12}>
              <Typography variant="subtitle2">Number of devices</Typography>
              <Typography variant="h2">{cohort.numberOfDevices}</Typography>
            </Grid>
          </Grid>
        </Box>

        <Grid container spacing={4}>
          <Grid item lg={2} sm={6} xl={2} xs={12}>
            <PollutantCategory
              pm25level="Good"
              devices={pm2_5SiteCount.Good}
              iconClass="pm25Good"
            />
          </Grid>
          <Grid item lg={2} sm={6} xl={2} xs={12}>
            <PollutantCategory
              pm25level="Moderate"
              devices={pm2_5SiteCount.Moderate}
              iconClass="pm25Moderate"
            />
          </Grid>
          <Grid item lg={2} sm={6} xl={2} xs={12}>
            <PollutantCategory
              pm25level="UHFSG"
              devices={pm2_5SiteCount.UHFSG}
              iconClass="pm25UH4SG"
            />
          </Grid>

          <Grid item lg={2} sm={6} xl={2} xs={12}>
            <PollutantCategory
              pm25level="Unhealthy"
              devices={pm2_5SiteCount.Unhealthy}
              iconClass="pm25UnHealthy"
            />
          </Grid>

          <Grid item lg={2} sm={6} xl={2} xs={12}>
            <PollutantCategory
              pm25level="Very Unhealthy"
              devices={pm2_5SiteCount.VeryUnhealthy}
              iconClass="pm25VeryUnHealthy"
            />
          </Grid>
          <Grid item lg={2} sm={6} xl={2} xs={12}>
            <PollutantCategory
              pm25level="Hazardous"
              devices={pm2_5SiteCount.Hazardous}
              iconClass="pm25Harzadous"
            />
          </Grid>
        </Grid>

        {loading ? (
          <Box
            height={'100%'}
            width={'100%'}
            color="blue"
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
          >
            Loading...
          </Box>
        ) : cohortInfo && cohortInfo.devices && cohortInfo.devices.length > 0 ? (
          <Grid container spacing={4}>
            <AveragesChart classes={classes} analyticsDevices={cohortInfo.devices} isCohorts />

            <Grid item lg={6} md={6} sm={12} xl={6} xs={12}>
              <ExceedancesChart
                className={clsx(classes.chartCard)}
                date={dateValue}
                chartContainer={classes.chartContainer}
                idSuffix="exceedances"
                analyticsDevices={cohortInfo.devices}
                isCohorts
              />
            </Grid>

            {userDefaultGraphs &&
              userDefaultGraphs.map((filter, key) => {
                return (
                  <D3CustomisableChart
                    className={clsx(classes.customChartCard)}
                    defaultFilter={filter}
                    key={key}
                    isCohorts
                    analyticsDevices={cohortInfo.devices}
                  />
                );
              })}

            <Grid item lg={6} md={6} sm={12} xl={6} xs={12}>
              <AddChart
                className={classes.customChartCard}
                isCohorts
                analyticsDevices={cohortInfo.devices}
                cohort={cohort}
              />
            </Grid>
          </Grid>
        ) : (
          <Box
            height={'100px'}
            textAlign={'center'}
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
          >
            <Typography variant="body1" color="textSecondary">
              No devices found
            </Typography>
          </Box>
        )}
      </Box>
    </ErrorBoundary>
  );
};

export default CohortsDashboardView;
