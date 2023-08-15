import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Box, Button, Grid, Typography, makeStyles } from '@material-ui/core';
import ErrorBoundary from 'views/ErrorBoundary/ErrorBoundary';
import { useDispatch } from 'react-redux';
import 'chartjs-plugin-annotation';
import { AveragesChart, ExceedancesChart } from '../../Dashboard/components';
import GridSitesTable from './sites_table';

const useStyles = makeStyles((theme) => ({
  chartCard: {},
  chartContainer: {
    minHeight: 250,
    position: 'relative'
  }
}));

const GridsDashboardView = ({ grid }) => {
  const classes = useStyles();

  const dispatch = useDispatch();

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
            <Grid item lg={2} sm={6} xl={2} xs={12}>
              <Typography variant="subtitle2">Grid name</Typography>
              <Typography variant="h2" style={{ textTransform: 'capitalize' }}>
                {grid.name}
              </Typography>
            </Grid>
            <Grid item lg={2} sm={6} xl={2} xs={12}>
              <Typography variant="subtitle2">Admin level</Typography>
              <Typography variant="h2" style={{ textTransform: 'capitalize' }}>
                {grid.admin_level}
              </Typography>
            </Grid>
            <Grid item lg={2} sm={6} xl={2} xs={12}>
              <Typography variant="subtitle2">Number of sites</Typography>
              <Typography variant="h2">{grid.numberOfSites}</Typography>
            </Grid>
            <Grid item lg={2} sm={6} xl={2} xs={12}>
              <Typography variant="subtitle2">Visibility</Typography>
              <Typography variant="h2">{grid.visibility}</Typography>
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
            <GridSitesTable />
          </Grid>
        </Grid>
      </Box>
    </ErrorBoundary>
  );
};

export default GridsDashboardView;
