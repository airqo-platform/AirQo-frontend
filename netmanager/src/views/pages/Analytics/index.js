import React, { useEffect, useState } from 'react';
import { Box, Button, makeStyles } from '@material-ui/core';
import ErrorBoundary from 'views/ErrorBoundary/ErrorBoundary';
import AnalyticsAirqloudsDropDown from './components/airqloud_dropdown';
import ImportExportIcon from '@material-ui/icons/ImportExport';
import GridsDashboardView from './components/grids_dashboard';
import AnalyticsBreadCrumb from './components/breadcrumb';
import { useDispatch, useSelector } from 'react-redux';
import {
  loadGridsAndCohortsSummary,
  setActiveGrid,
  loadGridDetails
} from 'redux/Analytics/operations';
import { isEmpty } from 'underscore';

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
    if (!isEmpty(activeGrid)) {
      dispatch(loadGridDetails(activeGrid._id));
    }
  }, [activeGrid]);

  return (
    <ErrorBoundary>
      <div className={classes.root}>
        <AnalyticsBreadCrumb isCohort={isCohort} />
        <Box
          display={'flex'}
          flexDirection={{ xs: 'column', sm: 'column', md: 'row', lg: 'row', xl: 'row' }}
          justifyContent={'space-between'}
          alignItems={'center'}
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

        {!isCohort && <GridsDashboardView grid={activeGrid} gridDetails={activeGridDetails} />}
      </div>
    </ErrorBoundary>
  );
};

export default Analytics;
