import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, Typography, makeStyles } from '@material-ui/core';
import ErrorBoundary from 'views/ErrorBoundary/ErrorBoundary';
import { useDispatch } from 'react-redux';
import CohortDevicesTable from './DevicesTable';
import { LargeCircularLoader } from '../../../components/Loader/CircularLoader';
import { isEmpty } from 'validate.js';

const CohortsDashboardView = ({ cohort, cohortDetails, loading }) => {
  const dispatch = useDispatch();

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
  }, [cohortDetails]);

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

        <Grid container spacing={4}>
          <Grid item lg={12} md={12} sm={12} xl={12} xs={12}>
            <CohortDevicesTable devices={cohortInfo.devices} loading={loading} />
          </Grid>
        </Grid>
      </Box>
    </ErrorBoundary>
  );
};

export default CohortsDashboardView;
