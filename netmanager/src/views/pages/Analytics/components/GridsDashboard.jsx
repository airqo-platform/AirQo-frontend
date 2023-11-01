import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Box, Grid, Typography, makeStyles } from '@material-ui/core';
import ErrorBoundary from 'views/ErrorBoundary/ErrorBoundary';
import 'chartjs-plugin-annotation';
import { AveragesChart, ExceedancesChart, AddChart } from '../../Dashboard/components';
import { useUserDefaultGraphsData } from 'redux/Dashboard/selectors';
import { loadUserDefaultGraphData } from 'redux/Dashboard/operations';
import D3CustomisableChart from '../../../components/d3/CustomisableChart';
import { useDispatch } from 'react-redux';
import { isEmpty } from 'validate.js';

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

const GridsDashboardView = ({ grid, gridDetails }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const userDefaultGraphs = useUserDefaultGraphsData();

  const [gridInfo, setGridInfo] = useState({
    name: 'N/A',
    admin_level: 'N/A',
    numberOfSites: 0,
    visibility: 'N/A',
    sites: []
  });

  useEffect(() => {
    if (gridDetails && gridDetails.sites && gridDetails.sites.length > 0) {
      setGridInfo({
        name: gridDetails.long_name,
        admin_level: gridDetails.admin_level,
        numberOfSites: gridDetails.numberOfSites,
        visibility: gridDetails.visibility,
        sites: gridDetails.sites
      });
    } else {
      setGridInfo({
        name: 'N/A',
        admin_level: 'N/A',
        numberOfSites: 0,
        visibility: 'N/A',
        sites: []
      });
    }
  }, [gridDetails]);

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

  useEffect(() => {
    dispatch(loadUserDefaultGraphData(true, grid._id));
  }, [grid]);

  return (
    <ErrorBoundary>
      <Box marginTop={'40px'}>
        <Box marginBottom={'20px'}>
          <Grid container spacing={4} alignItems="center" justify="center">
            <Grid item lg={3} sm={6} xl={3} xs={12}>
              <Typography variant="subtitle2">Grid name</Typography>
              <Typography variant="h2" style={{ textTransform: 'capitalize' }}>
                {gridInfo.name}
              </Typography>
            </Grid>
            <Grid item lg={3} sm={6} xl={3} xs={12}>
              <Typography variant="subtitle2">Admin level</Typography>
              <Typography variant="h2" style={{ textTransform: 'capitalize' }}>
                {gridInfo.admin_level}
              </Typography>
            </Grid>
            <Grid item lg={3} sm={6} xl={3} xs={12}>
              <Typography variant="subtitle2">Number of sites</Typography>
              <Typography variant="h2">{gridInfo.numberOfSites}</Typography>
            </Grid>
          </Grid>
        </Box>

        <Grid container spacing={4}>
          <AveragesChart classes={classes} analyticsSites={gridInfo.sites} isGrids={true} />

          {gridInfo && gridInfo.sites && gridInfo.sites.length > 0 && (
            <Grid item lg={6} md={6} sm={12} xl={6} xs={12}>
              <ExceedancesChart
                className={clsx(classes.chartCard)}
                date={dateValue}
                chartContainer={classes.chartContainer}
                idSuffix="exceedances"
                analyticsSites={gridInfo.sites}
                isGrids={true}
              />
            </Grid>
          )}

          {userDefaultGraphs &&
            userDefaultGraphs.map((filter, key) => {
              return (
                <D3CustomisableChart
                  className={clsx(classes.customChartCard)}
                  defaultFilter={filter}
                  key={key}
                  isGrids
                  analyticsSites={gridInfo.sites}
                />
              );
            })}

          <Grid item lg={6} md={6} sm={12} xl={6} xs={12}>
            <AddChart
              className={classes.customChartCard}
              isGrids
              analyticsSites={gridInfo.sites}
              grid={grid}
            />
          </Grid>
        </Grid>
      </Box>
    </ErrorBoundary>
  );
};

export default GridsDashboardView;
