import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Box, Grid, Typography, makeStyles } from '@material-ui/core';
import ErrorBoundary from 'views/ErrorBoundary/ErrorBoundary';
import 'chartjs-plugin-annotation';
import {
  AveragesChart,
  ExceedancesChart,
  AddChart,
  PollutantCategory
} from '../../Dashboard/components';
import { useUserDefaultGraphsData } from 'redux/Dashboard/selectors';
import { loadUserDefaultGraphData } from 'redux/Dashboard/operations';
import D3CustomisableChart from '../../../components/d3/CustomisableChart';
import { useDispatch } from 'react-redux';
import { isEmpty } from 'validate.js';
import { PM_25_CATEGORY } from '../../../../utils/categories';
import { loadMapEventsData } from 'redux/MapData/operations';
import { useEventsMapData } from 'redux/MapData/selectors';
import { formatString } from './AirqloudDropdown';

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

const GridsDashboardView = ({ grid, gridDetails, loading }) => {
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

  const [pm2_5SiteCount, setPm2_5SiteCount] = useState({
    Good: 0,
    Moderate: 0,
    UHFSG: 0,
    Unhealthy: 0,
    VeryUnhealthy: 0,
    Hazardous: 0
  });
  const recentEventsData = useEventsMapData();

  useEffect(() => {
    dispatch(loadMapEventsData());
  }, []);

  useEffect(() => {
    const initialCount = {
      Good: [],
      Moderate: [],
      UHFSG: [],
      Unhealthy: [],
      VeryUnhealthy: [],
      Hazardous: []
    };

    if (gridInfo && gridInfo.sites && gridInfo.sites.length > 0) {
      const gridSites = gridInfo.sites;
      const gridSitesObj = gridSites.reduce((acc, curr) => {
        acc[curr._id] = curr;
        return acc;
      }, {});

      recentEventsData.features &&
        recentEventsData.features.forEach((feature) => {
          const siteId = feature.properties.site_id;
          const site = gridSitesObj[siteId];

          if (gridSitesObj[siteId]) {
            const pm2_5 = feature.properties.pm2_5.value;
            Object.keys(PM_25_CATEGORY).map((key) => {
              const valid = PM_25_CATEGORY[key];
              if (pm2_5 > valid[0] && pm2_5 <= valid[1]) {
                initialCount[key].push({ ...site, pm2_5 });
              }
            });
          }
        });
    }
    // console.log(initialCount);
    setPm2_5SiteCount(initialCount);
  }, [recentEventsData, gridInfo]);

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
          <Grid container spacing={4} alignItems="flex-start" justify="center">
            <Grid item lg={4} sm={6} xl={3} xs={12}>
              <Typography variant="subtitle2">Grid name</Typography>
              <Typography variant="h2" style={{ textTransform: 'capitalize' }}>
                {loading ? '...' : formatString(grid.name || gridInfo.name)}
              </Typography>
            </Grid>
            <Grid item lg={4} sm={6} xl={3} xs={12}>
              <Typography variant="subtitle2">Admin level</Typography>
              <Typography variant="h2" style={{ textTransform: 'capitalize' }}>
                {loading ? '...' : formatString(gridInfo.admin_level)}
              </Typography>
            </Grid>
            <Grid item lg={4} sm={6} xl={3} xs={12}>
              <Typography variant="subtitle2">Number of sites</Typography>
              <Typography variant="h2">
                {loading ? '...' : grid.numberOfSites || gridInfo.numberOfSites}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Grid container spacing={4}>
          <Grid item lg={2} sm={6} xl={2} xs={12}>
            <PollutantCategory pm25level="Good" sites={pm2_5SiteCount.Good} iconClass="pm25Good" />
          </Grid>
          <Grid item lg={2} sm={6} xl={2} xs={12}>
            <PollutantCategory
              pm25level="Moderate"
              sites={pm2_5SiteCount.Moderate}
              iconClass="pm25Moderate"
            />
          </Grid>
          <Grid item lg={2} sm={6} xl={2} xs={12}>
            <PollutantCategory
              pm25level="UHFSG"
              sites={pm2_5SiteCount.UHFSG}
              iconClass="pm25UH4SG"
            />
          </Grid>

          <Grid item lg={2} sm={6} xl={2} xs={12}>
            <PollutantCategory
              pm25level="Unhealthy"
              sites={pm2_5SiteCount.Unhealthy}
              iconClass="pm25UnHealthy"
            />
          </Grid>

          <Grid item lg={2} sm={6} xl={2} xs={12}>
            <PollutantCategory
              pm25level="Very Unhealthy"
              sites={pm2_5SiteCount.VeryUnhealthy}
              iconClass="pm25VeryUnHealthy"
            />
          </Grid>
          <Grid item lg={2} sm={6} xl={2} xs={12}>
            <PollutantCategory
              pm25level="Hazardous"
              sites={pm2_5SiteCount.Hazardous}
              iconClass="pm25Harzadous"
            />
          </Grid>
        </Grid>

        {
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
        }
      </Box>
    </ErrorBoundary>
  );
};

export default GridsDashboardView;
