import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
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
import MoreDropdown from './components/MoreDropdown';
import { deleteCohortApi, deleteGridApi, refreshGridApi } from '../../apis/deviceRegistry';
import { createAlertBarExtraContentFromObject } from 'utils/objectManipulators';
import { updateMainAlert } from 'redux/MainAlert/operations';

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

  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

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
    if (!isEmpty(combinedGridAndCohortsSummary)) {
      const gridsList = combinedGridAndCohortsSummary.grids;
      if (!isEmpty(gridsList)) {
        dispatch(setActiveGrid(gridsList[0]));
        localStorage.setItem('activeGrid', JSON.stringify(gridsList[0]));
      }
    }
  }, [combinedGridAndCohortsSummary]);

  useEffect(() => {
    if (!isEmpty(combinedGridAndCohortsSummary)) {
      const cohortsList = combinedGridAndCohortsSummary.cohorts;
      if (!isEmpty(cohortsList)) {
        dispatch(setActiveCohort(cohortsList[0]));
        localStorage.setItem('activeCohort', JSON.stringify(cohortsList[0]));
      }
    }
  }, [combinedGridAndCohortsSummary]);

  useEffect(() => {
    if (activeGrid && activeGrid._id) {
      dispatch(loadGridDetails(activeGrid._id));
    }
  }, [activeGrid]);

  useEffect(() => {
    if (activeCohort && activeCohort._id) {
      dispatch(loadCohortDetails(activeCohort._id));
    }
  }, [activeCohort]);

  useEffect(() => {
    setLoading(true);
    if (!isEmpty(activeNetwork)) {
      dispatch(loadDevicesData(activeNetwork.net_name));
    }
    setLoading(false);
  }, []);

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

  const handleClickMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleRefreshGrid = async () => {
    setLoading(true);
    await refreshGridApi(activeGrid._id)
      .then((res) => {
        dispatch(loadGridDetails(activeGrid._id));
        dispatch(
          updateMainAlert({
            show: true,
            message: res.message,
            severity: 'success'
          })
        );
        handleCloseMenu();
        setLoading(false);
      })
      .catch((error) => {
        const errors = error.response && error.response.data && error.response.data.errors;
        dispatch(
          updateMainAlert({
            show: true,
            message: error.response && error.response.data && error.response.data.message,
            severity: 'error',
            extra: createAlertBarExtraContentFromObject(errors || {})
          })
        );
        setLoading(false);
      });
  };

  const handleDeleteGrid = async () => {
    setLoading(true);
    await deleteGridApi(activeGrid._id)
      .then((res) => {
        setLoading(false);
        dispatch(
          updateMainAlert({
            show: true,
            message: res.message,
            severity: 'success'
          })
        );
        handleCloseMenu();

        setTimeout(() => {
          window.location.reload();
        }, 3000);
      })
      .catch((error) => {
        const errors = error.response && error.response.data && error.response.data.errors;
        dispatch(
          updateMainAlert({
            show: true,
            message: error.response && error.response.data && error.response.data.message,
            severity: 'error',
            extra: createAlertBarExtraContentFromObject(errors || {})
          })
        );
        setLoading(false);
      });
  };

  const handleDeleteCohort = async () => {
    setLoading(true);
    await deleteCohortApi(activeCohort._id)
      .then((res) => {
        setLoading(false);
        dispatch(
          updateMainAlert({
            show: true,
            message: res.message,
            severity: 'success'
          })
        );
        handleCloseMenu();

        setTimeout(() => {
          window.location.reload();
        }, 3000);
      })
      .catch((error) => {
        const errors = error.response && error.response.data && error.response.data.errors;
        dispatch(
          updateMainAlert({
            show: true,
            message: error.response && error.response.data && error.response.data.message,
            severity: 'error',
            extra: createAlertBarExtraContentFromObject(errors || {})
          })
        );
        setLoading(false);
      });
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
            <Box width={'16px'} />
            {isCohort ? (
              <MoreDropdown
                dropdownItems={[
                  {
                    title: 'Delete Cohort',
                    onClick: handleDeleteCohort,
                    loading: loading
                  }
                ]}
                anchorEl={anchorEl}
                openMenu={openMenu}
                handleClickMenu={handleClickMenu}
                handleCloseMenu={handleCloseMenu}
              />
            ) : (
              <MoreDropdown
                dropdownItems={[
                  {
                    title: 'Refresh Grid',
                    onClick: handleRefreshGrid,
                    loading: loading
                  },
                  {
                    title: 'Delete Grid',
                    onClick: handleDeleteGrid,
                    loading: loading
                  }
                ]}
                anchorEl={anchorEl}
                openMenu={openMenu}
                handleClickMenu={handleClickMenu}
                handleCloseMenu={handleCloseMenu}
              />
            )}
          </Box>
        </Box>

        {!isCohort && !isEmpty(activeGrid) && activeGrid.name !== 'Empty' && (
          <GridsDashboardView grid={activeGrid} gridDetails={activeGridDetails} loading={loading} />
        )}

        {!isCohort && activeGrid && activeGrid.name === 'Empty' && (
          <Box
            display={'flex'}
            flexDirection={'column'}
            justifyContent={'center'}
            alignItems={'center'}
            width={'100%'}
            height={'100%'}
          >
            <Box height={'100px'} />
            <Typography variant={'h4'}>No grids found</Typography>
            <Box height={'20px'} />
            <Typography variant={'subtitle1'}>Create a new grids to get started</Typography>
          </Box>
        )}

        {isCohort && !isEmpty(activeCohort) && activeCohort.name !== 'Empty' && (
          <CohortsDashboardView
            cohort={activeCohort}
            cohortDetails={activeCohortDetails}
            loading={loading}
          />
        )}

        {isCohort && activeCohort && activeCohort.name === 'Empty' && (
          <Box
            display={'flex'}
            flexDirection={'column'}
            justifyContent={'center'}
            alignItems={'center'}
            width={'100%'}
            height={'100%'}
          >
            <Box height={'100px'} />
            <Typography variant={'h4'}>No cohorts found</Typography>
            <Box height={'20px'} />
            <Typography variant={'subtitle1'}>Create a new cohorts to get started</Typography>
          </Box>
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
