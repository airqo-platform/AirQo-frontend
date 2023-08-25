import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Box, Button, Grid, Typography, makeStyles } from '@material-ui/core';
import ErrorBoundary from 'views/ErrorBoundary/ErrorBoundary';
import 'chartjs-plugin-annotation';
import { AveragesChart, ExceedancesChart } from '../../Dashboard/components';
import GridSitesTable from './SitesTable';

const useStyles = makeStyles((theme) => ({
  chartCard: {},
  chartContainer: {
    minHeight: 250,
    position: 'relative'
  }
}));

const GridsDashboardView = ({ grid, gridDetails }) => {
  const classes = useStyles();

  const [gridInfo, setGridInfo] = useState({
    name: 'N/A',
    admin_level: 'N/A',
    numberOfSites: 0,
    visibility: 'N/A',
    sites: []
  });

  useEffect(() => {
    if (gridDetails) {
      setGridInfo({
        name: gridDetails.name,
        admin_level: gridDetails.admin_level,
        numberOfSites: gridDetails.numberOfSites,
        visibility: gridDetails.visibility,
        sites: gridDetails.sites
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
          <AveragesChart classes={classes} analyticsSites={grid.sites} isGrids={true} />

          <Grid item lg={6} md={6} sm={12} xl={6} xs={12}>
            <ExceedancesChart
              className={clsx(classes.chartCard)}
              date={dateValue}
              chartContainer={classes.chartContainer}
              idSuffix="exceedances"
              analyticsSites={grid.sites}
              isGrids={true}
            />
          </Grid>

          <Grid item lg={12} md={12} sm={12} xl={12} xs={12}>
            <GridSitesTable sites={gridInfo.sites} />
          </Grid>
        </Grid>
      </Box>
    </ErrorBoundary>
  );
};

export default GridsDashboardView;
