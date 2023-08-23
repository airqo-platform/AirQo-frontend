import React, { useEffect, useState } from 'react';
import { Box, Button, makeStyles } from '@material-ui/core';
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

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(4)
  }
}));

const Analytics = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [isCohort, setIsCohort] = useState(true);

  const combinedGridAndCohortsSummary = useSelector(
    (state) => state.analytics.combinedGridAndCohortsSummary
  );
  const activeGrid = useSelector((state) => state.analytics.activeGrid);
  const activeGridDetails = useSelector((state) => state.analytics.activeGridDetails);
  const activeCohort = useSelector((state) => state.analytics.activeCohort);
  const activeCohortDetails = useSelector((state) => state.analytics.activeCohortDetails);

  const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork') || {});

  const handleSwitchAirqloudTypeClick = () => {
    setIsCohort(!isCohort);
  };

  useEffect(() => {
    if (!isEmpty(activeNetwork)) {
      dispatch(loadGridsAndCohortsSummary(activeNetwork.net_name));
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
              onClick={handleSwitchAirqloudTypeClick}
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

        {!isCohort && <GridsDashboardView grid={activeGrid} gridDetails={activeGridDetails} />}

        {isCohort && (
          <CohortsDashboardView cohort={activeCohort} cohortDetails={activeCohortDetails} />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Analytics;
