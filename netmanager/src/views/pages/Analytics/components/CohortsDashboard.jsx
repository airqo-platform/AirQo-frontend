import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, Typography, makeStyles } from '@material-ui/core';
import ErrorBoundary from 'views/ErrorBoundary/ErrorBoundary';
import { useDispatch } from 'react-redux';
import CohortDevicesTable from './DevicesTable';

const useStyles = makeStyles((theme) => ({
  chartCard: {},
  chartContainer: {
    minHeight: 250,
    position: 'relative'
  }
}));

const CohortsDashboardView = ({ cohort }) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const [cohortInfo, setCohortInfo] = useState({
    name: 'N/A',
    numberOfDevices: 0,
    devices: []
  });

  const [cohortDevices, setCohortDevices] = useState([]);

  useEffect(() => {
    if (cohort) {
      setCohortInfo({
        name: cohort.name,
        numberOfDevices: cohort.numberOfDevices,
        visibility: cohort.visibility,
        devices: cohort.devices
      });

      const deviceNames = cohort.devices && cohort.devices.map((device) => device.name);
      setCohortDevices(deviceNames);
    }
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
          <Grid container spacing={4} alignItems="center" justify="center">
            <Grid item lg={3} sm={6} xl={3} xs={12}>
              <Typography variant="subtitle2">Cohort name</Typography>
              <Typography variant="h2" style={{ textTransform: 'capitalize' }}>
                {cohortInfo.name}
              </Typography>
            </Grid>
            <Grid item lg={3} sm={6} xl={3} xs={12}>
              <Typography variant="subtitle2">Number of devices</Typography>
              <Typography variant="h2">{cohortInfo.numberOfDevices}</Typography>
            </Grid>
          </Grid>
        </Box>

        <Grid container spacing={4}>
          <Grid item lg={12} md={12} sm={12} xl={12} xs={12}>
            <CohortDevicesTable devices={cohortInfo.devices} />
          </Grid>
        </Grid>
      </Box>
    </ErrorBoundary>
  );
};

export default CohortsDashboardView;
