import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  makeStyles
} from '@material-ui/core';
import ErrorBoundary from 'views/ErrorBoundary/ErrorBoundary';
import AnalyticsAirqloudsDropDown from './components/AirqloudDropdown';
import ImportExportIcon from '@material-ui/icons/ImportExport';
import GridsDashboardView from './components/GridsDashboard';
import AnalyticsBreadCrumb from './components/Breadcrumb';
import { useDispatch, useSelector } from 'react-redux';
import {
  loadGridsAndCohortsSummary,
  setActiveGrid,
  loadGridDetails,
  loadCohortDetails,
  setActiveCohort
} from 'redux/Analytics/operations';
import { isEmpty } from 'underscore';
import CohortsDashboardView from './components/CohortsDashboard';
import { loadDevicesData } from 'redux/DeviceRegistry/operations';
import { useDevicesData } from 'redux/DeviceRegistry/selectors';
import AddCohortToolbar from './components/AddCohortForm';
import AddGridToolbar from './components/AddGridForm';
import { withPermission } from '../../containers/PageAccess';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(4)
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

const Analytics = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [isCohort, setIsCohort] = useState(true);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork') || {});

  const devices = useDevicesData();
  const [deviceOptions, setDeviceOptions] = useState([]);

  const combinedGridAndCohortsSummary = useSelector(
    (state) => state.analytics.combinedGridAndCohortsSummary
  );
  const activeGrid = useSelector((state) => state.analytics.activeGrid);
  const activeGridDetails = useSelector((state) => state.analytics.activeGridDetails);
  const activeCohort = useSelector((state) => state.analytics.activeCohort);
  const activeCohortDetails = useSelector((state) => state.analytics.activeCohortDetails);

  const handleSwitchAirqloudTypeClick = () => {
    setIsCohort(!isCohort);
  };

  useEffect(() => {
    setLoading(true);
    if (!isEmpty(activeNetwork)) {
      dispatch(loadGridsAndCohortsSummary(activeNetwork.net_name));
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isEmpty(activeGrid)) {
      if (!isEmpty(combinedGridAndCohortsSummary)) {
        const gridsList = combinedGridAndCohortsSummary.grids;
        if (!isEmpty(gridsList)) {
          dispatch(setActiveGrid(gridsList[0]));
        }
      }
    }
  }, [combinedGridAndCohortsSummary, activeGrid]);

  useEffect(() => {
    if (isEmpty(activeCohort)) {
      if (!isEmpty(combinedGridAndCohortsSummary)) {
        const cohortsList = combinedGridAndCohortsSummary.cohorts;
        if (!isEmpty(cohortsList)) {
          dispatch(setActiveCohort(cohortsList[0]));
        }
      }
    }
  }, [combinedGridAndCohortsSummary, activeCohort]);

  useEffect(() => {
    if (!isEmpty(activeGrid)) {
      dispatch(loadGridDetails(activeGrid._id));
    }
  }, [activeGrid]);

  useEffect(() => {
    if (!isEmpty(activeCohort)) {
      dispatch(loadCohortDetails(activeCohort._id));
    }
  }, [activeCohort]);

  useEffect(() => {
    if (isEmpty(devices)) {
      if (!isEmpty(activeNetwork)) {
        dispatch(loadDevicesData(activeNetwork.net_name));
      }
    }
  }, [devices]);

  useEffect(() => {
    if (!isEmpty(devices)) {
      const deviceOptions = createDeviceOptions(Object.values(devices));
      setDeviceOptions(deviceOptions);
    }
  }, [devices]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <ErrorBoundary>
      <div className={classes.root}>
        <AnalyticsBreadCrumb isCohort={isCohort} />
        <Box
          display={'flex'}
          flexDirection={{ xs: 'column', sm: 'column', md: 'row', lg: 'row', xl: 'row' }}
          justifyContent={'space-between'}
          alignItems={'center'}
          width={'100%'}
        >
          <Box
            width={'100%'}
            maxWidth={{ xs: 'none', sm: 'none', md: '400px', lg: '400px', xl: '400px' }}
            marginBottom={{ xs: '20px', sm: '20px', md: '0', lg: '0', xl: '0' }}
          >
            <AnalyticsAirqloudsDropDown
              isCohort={isCohort}
              airqloudsData={
                combinedGridAndCohortsSummary &&
                (isCohort
                  ? combinedGridAndCohortsSummary.cohorts
                  : combinedGridAndCohortsSummary.grids)
              }
            />
          </Box>
          <Box width={'100%'} display={'flex'} justifyContent={'center'} alignItems={'flex-end'}>
            <Button
              margin="dense"
              color="primary"
              style={{
                width: 'auto',
                textTransform: 'initial',
                height: '44px'
              }}
              variant="outlined"
              onClick={handleClickOpen}
            >
              <ImportExportIcon /> Add New {isCohort ? 'Cohort' : 'Grid'}
            </Button>
            <Box width={'16px'} />
            <Button
              margin="dense"
              color="primary"
              style={{
                width: 'auto',
                textTransform: 'initial',
                height: '44px'
              }}
              variant="contained"
              onClick={handleSwitchAirqloudTypeClick}
            >
              <ImportExportIcon /> Switch to {isCohort ? 'Grid View' : 'Cohort View'}
            </Button>
          </Box>
        </Box>

        {/* Shows create grid/cohort if no cohorts and grids exist*/}
        {combinedGridAndCohortsSummary &&
          (isEmpty(combinedGridAndCohortsSummary.grids) ||
            isEmpty(combinedGridAndCohortsSummary.cohorts)) &&
          !loading && (
            <Box
              display={'flex'}
              flexDirection={'column'}
              justifyContent={'center'}
              alignItems={'center'}
              width={'100%'}
              height={'100%'}
            >
              <Box height={'100px'} />
              <Typography variant={'h4'}>No {isCohort ? 'cohorts' : 'grids'} found</Typography>
              <Box height={'20px'} />
              <Typography variant={'subtitle1'}>
                Create a new {isCohort ? 'cohorts' : 'grids'} to get started
              </Typography>
            </Box>
          )}

        {!isCohort && !isEmpty(activeGrid) && activeGrid.name !== 'Empty' && (
          <GridsDashboardView grid={activeGrid} gridDetails={activeGridDetails} />
        )}

        {isCohort && !isEmpty(activeCohort) && activeCohort.name !== 'Empty' && (
          <CohortsDashboardView cohort={activeCohort} cohortDetails={activeCohortDetails} />
        )}

        {/* Shows add new cohort dialog */}
        <AddCohortToolbar
          open={open}
          handleClose={handleClose}
          deviceOptions={deviceOptions}
          isCohort={isCohort}
        />

        {/* Shows add new grid dialog */}
        <AddGridToolbar open={open} handleClose={handleClose} isCohort={isCohort} />
      </div>
    </ErrorBoundary>
  );
};

export default withPermission(Analytics, 'CREATE_UPDATE_AND_DELETE_NETWORK_DEVICES');
