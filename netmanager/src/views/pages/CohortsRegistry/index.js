import React, { useEffect, useState } from 'react';
import { ErrorBoundary } from '../../ErrorBoundary';
import { Box, Button, Typography, makeStyles } from '@material-ui/core';
import AddCohortToolbar from './AddCohortForm';
import { getCohortsApi } from '../../apis/deviceRegistry';
import CohortsTable from './CohortsTable';
import { loadDevicesData } from '../../../redux/DeviceRegistry/operations';
import { useDispatch, useSelector } from 'react-redux';
import { isEmpty } from 'underscore';
import BreadCrumb from './breadcrumb';
import { useDevicesData } from '../../../redux/DeviceRegistry/selectors';
import { fetchAllCohorts } from '../../../redux/Analytics/operations';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3)
  },
  content: {
    marginTop: theme.spacing(2)
  }
}));

const createDeviceOptions = (devices) => {
  const options = [];
  devices.map((device) => {
    options.push({
      value: device._id,
      label: device.name
    });
  });
  return options;
};

const CohortsRegistry = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const devices = useDevicesData();
  const cohorts = useSelector((state) => state.analytics.cohorts);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [deviceOptions, setDeviceOptions] = useState([]);
  const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork') || {});

  useEffect(() => {
    setLoading(true);
    const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork') || {});
    dispatch(fetchAllCohorts(activeNetwork.net_name));
    setTimeout(() => {
      setLoading(false);
    }, 5000);
  }, []);

  useEffect(() => {
    setLoading(true);
    if (!isEmpty(activeNetwork)) {
      dispatch(loadDevicesData(activeNetwork.net_name));
    }
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  }, []);

  useEffect(() => {
    if (!isEmpty(devices)) {
      const deviceOptions = createDeviceOptions(Object.values(devices));
      setDeviceOptions(deviceOptions);
    }
  }, [devices]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  return (
    <ErrorBoundary>
      <div className={classes.root}>
        <AddCohortToolbar open={open} handleClose={handleClose} deviceOptions={deviceOptions} />
        <BreadCrumb>
          <Button variant="contained" color="primary" onClick={handleOpen}>
            Create cohort
          </Button>
        </BreadCrumb>
        <div className={classes.content}>
          {loading ? (
            <Box
              height={'100px'}
              width={'100%'}
              color="blue"
              display={'flex'}
              justifyContent={'center'}
              alignItems={'center'}
            >
              Loading...
            </Box>
          ) : cohorts && cohorts.length > 0 ? (
            <CohortsTable cohortsList={cohorts} />
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
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default CohortsRegistry;
