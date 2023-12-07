import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, makeStyles } from '@material-ui/core';
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
import MoreDropdown from './components/MoreDropdown';
import { deleteCohortApi, deleteGridApi, refreshGridApi } from '../../apis/deviceRegistry';
import { createAlertBarExtraContentFromObject } from 'utils/objectManipulators';
import { updateMainAlert } from 'redux/MainAlert/operations';
import { downloadDataApi } from '../../apis/analytics';
import { roundToEndOfDay, roundToStartOfDay } from '../../../utils/dateTime';
import Papa from 'papaparse';
import { LargeCircularLoader } from '../../components/Loader/CircularLoader';
import { addActiveNetwork } from 'redux/AccessControl/operations';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(4),
    position: 'relative',
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2)
    }
  }
}));

export const createDeviceOptions = (devices) => {
  const options = [];
  devices.map((device) => {
    options.push({
      value: device._id,
      label: device.name
    });
  });
  return options;
};

export const createSiteOptions = (sites) => {
  const options = [];
  sites.map((site) => {
    options.push({
      value: site._id,
      label: site.site_name
    });
  });
  return options;
};

const extractGridSitesIds = (sites = []) => {
  try {
    const sitesIds = [];
    sites.map((site) => {
      if (site && site._id) {
        sitesIds.push(site._id);
      }
    });
    return sitesIds;
  } catch (error) {
    console.error('Error in extractGridSitesIds:', error);
    return [];
  }
};

const extraCohortDevicesIds = (devices = []) => {
  try {
    const devicesIds = [];
    devices.map((device) => {
      if (device && device._id) {
        devicesIds.push(device._id);
      }
    });
    return devicesIds;
  } catch (error) {
    console.error('Error in extraCohortDevicesIds:', error);
    return [];
  }
};

const Analytics = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [isCohort, setIsCohort] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloadingData, setDownloadingData] = useState(false);
  const activeNetwork = useSelector((state) => state.accessControl.activeNetwork);
  const combinedGridAndCohortsSummary = useSelector(
    (state) => state.analytics.combinedGridAndCohortsSummary
  );
  const activeGrid = useSelector((state) => state.analytics.activeGrid);
  const activeGridDetails = useSelector((state) => state.analytics.activeGridDetails);
  const activeCohort = useSelector((state) => state.analytics.activeCohort);
  const activeCohortDetails = useSelector((state) => state.analytics.activeCohortDetails);
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [isGridLoading, setIsGridLoading] = useState(false);
  const [isCohortLoading, setIsCohortLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);
  const [gridError, setGridError] = useState(null);
  const [cohortError, setCohortError] = useState(null);

  const handleSwitchAirqloudTypeClick = () => {
    setIsCohort(!isCohort);
  };

  useEffect(() => {
    if (isEmpty(activeNetwork)) {
      const activeNtkString = localStorage.getItem('activeNetwork');
      const activeNtk = activeNtkString ? JSON.parse(activeNtkString) : {};
      dispatch(addActiveNetwork(activeNtk));
    }
  }, []);

  useEffect(() => {
    const loadSummaryAsync = async () => {
      if (!activeNetwork) {
        return;
      }

      setIsSummaryLoading(true);
      await dispatch(loadGridsAndCohortsSummary(activeNetwork.net_name));
    };

    loadSummaryAsync().catch((error) => {
      console.error('Error in loadSummaryAsync:', error);
      setSummaryError(error);
    });
  }, [activeNetwork]);

  useEffect(() => {
    const gridsList = combinedGridAndCohortsSummary.grids;
    const cohortsList = combinedGridAndCohortsSummary.cohorts;
    if (!isEmpty(gridsList)) {
      dispatch(setActiveGrid(gridsList[0]));
      localStorage.setItem('activeGrid', JSON.stringify(gridsList[0]));
    }
    if (!isEmpty(cohortsList)) {
      dispatch(setActiveCohort(cohortsList[0]));
      localStorage.setItem('activeCohort', JSON.stringify(cohortsList[0]));
    }
  }, [combinedGridAndCohortsSummary]);

  useEffect(() => {
    if (activeGrid && activeGrid._id) {
      setIsSummaryLoading(false);
    }

    if (activeCohort && activeCohort._id) {
      setIsSummaryLoading(false);
    }
  }, [activeGrid, activeCohort]);

  useEffect(() => {
    const loadGridDetailsAsync = async () => {
      if (activeGrid && activeGrid._id) {
        setIsGridLoading(true);
        try {
          await dispatch(loadGridDetails(activeGrid._id));
        } catch (error) {
          console.error(error);
        } finally {
          setIsGridLoading(false);
        }
      }
    };
    loadGridDetailsAsync();
  }, [activeGrid]);

  useEffect(() => {
    const loadCohortDetailsAsync = async () => {
      if (activeCohort && activeCohort._id) {
        setIsCohortLoading(true);
        try {
          await dispatch(loadCohortDetails(activeCohort._id));
        } catch (error) {
          console.error(error);
        } finally {
          setIsCohortLoading(false);
        }
      }
    };
    loadCohortDetailsAsync();
  }, [activeCohort]);

  const handleClickMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleRefreshGrid = async () => {
    setIsGridLoading(true);
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
        setIsGridLoading(false);
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
        setIsGridLoading(false);
      });
  };

  // Function to export data as a file
  const exportData = (data, fileName, type) => {
    try {
      const blob = new Blob([data], { type });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      dispatch(
        updateMainAlert({
          message: 'Error exporting data',
          show: true,
          severity: 'error'
        })
      );
    }
  };

  const downloadDataFunc = async (body) => {
    await downloadDataApi(body)
      .then((response) => response.data)
      .then((resData) => {
        let filename = `${isCohort ? 'cohort' : 'grid'}_data.csv`;

        const csvData = Papa.unparse(resData);

        exportData(csvData, filename, 'text/csv;charset=utf-8;');

        setDownloadingData(false);
        dispatch(
          updateMainAlert({
            message: 'Air quality data download successful',
            show: true,
            severity: 'success'
          })
        );
      })
      .catch((err) => {
        if (err.response.data.status === 'success') {
          dispatch(
            updateMainAlert({
              message: 'Uh-oh! No data found',
              show: true,
              severity: 'success'
            })
          );
        } else {
          dispatch(
            updateMainAlert({
              message: err.response.data.message,
              show: true,
              severity: 'error'
            })
          );
        }

        setDownloadingData(false);
      });
  };

  const submitExportData = async (e) => {
    setDownloadingData(true);

    let exportData = [];
    let body = {};

    const getBody = (exportData) => {
      return {
        sites: !isCohort ? exportData : [],
        devices: isCohort ? exportData : [],
        startDateTime: roundToStartOfDay(
          new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        ),
        endDateTime: roundToEndOfDay(new Date().toISOString()),
        frequency: 'hourly',
        pollutants: ['pm2_5', 'pm10'],
        downloadType: isCohort ? 'csv' : 'json',
        outputFormat: 'airqo-standard'
      };
    };

    if (!isCohort) {
      if (!isEmpty(activeGridDetails.sites)) {
        exportData = extractGridSitesIds(activeGridDetails.sites);

        if (!isEmpty(exportData)) {
          body = getBody(exportData);
        } else {
          dispatch(
            updateMainAlert({
              message: 'No sites found',
              show: true,
              severity: 'error'
            })
          );
        }

        try {
          await downloadDataFunc(body);
        } catch (error) {
          console.log(error.message);
        } finally {
          setDownloadingData(false);
        }
      }
    } else {
      if (!isEmpty(activeCohortDetails.devices)) {
        exportData = extraCohortDevicesIds(activeCohortDetails.devices);

        if (!isEmpty(exportData)) {
          body = getBody(exportData);
        } else {
          dispatch(
            updateMainAlert({
              message: 'No devices found',
              show: true,
              severity: 'error'
            })
          );
        }

        try {
          await downloadDataFunc(body);
        } catch (error) {
          dispatch(
            updateMainAlert({
              message: error.message || 'An error occurred while downloading data',
              show: true,
              severity: 'error'
            })
          );
        } finally {
          setDownloadingData(false);
        }
      }
    }

    setDownloadingData(false);
  };

  return (
    <ErrorBoundary>
      <div className={classes.root}>
        <AnalyticsBreadCrumb isCohort={isCohort} />
        {combinedGridAndCohortsSummary && (
          <Box
            display={'flex'}
            flexDirection={{ xs: 'column', sm: 'column', md: 'row', lg: 'row', xl: 'row' }}
            justifyContent={'space-between'}
            alignItems={'center'}
            width={'100%'}
            position={'relative'}>
            <Box
              display={'flex'}
              justifyContent={'space-between'}
              gap={'16px'}
              width={'100%'}
              maxWidth={'450px'}
              marginBottom={{ xs: '20px', sm: '20px', md: '0', lg: '0', xl: '0' }}>
              <AnalyticsAirqloudsDropDown
                isCohort={isCohort}
                airqloudsData={
                  combinedGridAndCohortsSummary &&
                  (isCohort
                    ? combinedGridAndCohortsSummary.cohorts
                    : combinedGridAndCohortsSummary.grids)
                }
              />

              {!isCohort && (
                <MoreDropdown
                  dropdownItems={[
                    {
                      title: 'Refresh Grid',
                      onClick: handleRefreshGrid,
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
            <Box
              width={'auto'}
              marginTop={{ xs: '25px', sm: '25px', md: '0', lg: '0', xl: '0' }}
              display={'flex'}
              gridGap="12px">
              <Button
                margin="dense"
                color="primary"
                style={{
                  width: 'auto',
                  textTransform: 'initial',
                  height: '44px',
                  position: 'relative'
                }}
                variant="outlined"
                onClick={submitExportData}
                disabled={downloadingData || isGridLoading || isCohortLoading || isSummaryLoading}>
                Download data
              </Button>
              <Button
                margin="dense"
                color="primary"
                style={{
                  width: 'auto',
                  textTransform: 'initial',
                  height: '44px',
                  position: 'relative'
                }}
                variant="contained"
                onClick={handleSwitchAirqloudTypeClick}>
                <ImportExportIcon /> Switch to {isCohort ? 'Grid View' : 'Cohort View'}
              </Button>
            </Box>
          </Box>
        )}

        {!isCohort && !isEmpty(activeGrid) && activeGrid.name !== 'Empty' && (
          <GridsDashboardView
            grid={activeGrid}
            gridDetails={activeGridDetails}
            loading={isGridLoading}
          />
        )}

        {isCohort && !isEmpty(activeCohort) && activeCohort.name !== 'Empty' && (
          <CohortsDashboardView
            cohort={activeCohort}
            cohortDetails={activeCohortDetails}
            loading={isCohortLoading}
          />
        )}

        {isSummaryLoading || isGridLoading || isCohortLoading ? (
          <Box height="60vh" display="flex" justifyContent={'center'} alignItems="center">
            <LargeCircularLoader loading={isSummaryLoading} />
          </Box>
        ) : combinedGridAndCohortsSummary &&
          combinedGridAndCohortsSummary.grids &&
          combinedGridAndCohortsSummary.cohorts ? (
          combinedGridAndCohortsSummary.grids.length === 0 ||
          combinedGridAndCohortsSummary.cohorts.length === 0 ? (
            <Box height="60vh" display="flex" justifyContent={'center'} alignItems="center">
              <Typography variant="h5" color="textSecondary">
                {!isCohort && combinedGridAndCohortsSummary.grids.length === 0
                  ? 'No grids yet'
                  : 'No cohorts yet'}
              </Typography>
            </Box>
          ) : null
        ) : (
          <Box height="60vh" display="flex" justifyContent={'center'} alignItems="center">
            <Typography variant="h5" color="textSecondary">
              No data found
            </Typography>
          </Box>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Analytics;
