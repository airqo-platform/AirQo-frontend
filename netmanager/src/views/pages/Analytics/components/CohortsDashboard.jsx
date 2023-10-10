import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, Typography, makeStyles } from '@material-ui/core';
import ErrorBoundary from 'views/ErrorBoundary/ErrorBoundary';
import { useDispatch } from 'react-redux';
import CohortDevicesTable from './DevicesTable';
import { isEmpty } from 'validate.js';
import clsx from 'clsx';
import 'chartjs-plugin-annotation';
import { AveragesChart, ExceedancesChart, AddChart } from '../../Dashboard/components';
import { useUserDefaultGraphsData } from 'redux/Dashboard/selectors';
import { loadUserDefaultGraphData } from 'redux/Dashboard/operations';
import D3CustomisableChart from '../../../components/d3/CustomisableChart';

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
    if (isEmpty(userDefaultGraphs)) {
      dispatch(loadUserDefaultGraphData(true, cohort._id));
    }
  }, []);

  // componentWillUnmount
  useEffect(() => {
    return () => dispatch(loadUserDefaultGraphData(true, cohort._id));
  }, []);

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
          <Grid container spacing={4} alignItems="center" justify="center">
            <Grid item lg={3} sm={6} xl={3} xs={12}>
              <Typography variant="subtitle2">Cohort name</Typography>
              <Typography variant="h2" style={{ textTransform: 'capitalize' }}>
                {cohort.name}
              </Typography>
            </Grid>
            <Grid item lg={3} sm={6} xl={3} xs={12}>
              <Typography variant="subtitle2">Number of devices</Typography>
              <Typography variant="h2">{cohort.numberOfDevices}</Typography>
            </Grid>
          </Grid>
        </Box>

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
            <Typography variant="body" color="textSecondary">
              No devices found
            </Typography>
          </Box>
        )}
      </Box>
    </ErrorBoundary>
  );
};

export default CohortsDashboardView;
