import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Box, Button, Grid, makeStyles } from '@material-ui/core';
import ErrorBoundary from 'views/ErrorBoundary/ErrorBoundary';
import D3CustomisableChart from 'views/components/d3/CustomisableChart';
import { isEmpty } from 'underscore';
import { useCurrentAirQloudData } from 'redux/AirQloud/selectors';
import { useDispatch } from 'react-redux';
import 'chartjs-plugin-annotation';
import { useUserDefaultGraphsData } from 'redux/Dashboard/selectors';
import { loadUserDefaultGraphData } from 'redux/Dashboard/operations';
import { loadMapEventsData } from 'redux/MapData/operations';
import { useEventsMapData } from 'redux/MapData/selectors';
import { PM_25_CATEGORY } from 'utils/categories';
import { flattenSiteOptions, siteOptionsToObject } from 'utils/sites';
import {
  AddChart,
  AveragesChart,
  PollutantCategory,
  ExceedancesChart
} from '../../Dashboard/components';

const useStyles = makeStyles((theme) => ({
  chartCard: {},
  customChartCard: {
    width: '100%',
    padding: '20px',
    minHeight: '200px'
  },
  chartContainer: {
    minHeight: 250,
    position: 'relative'
  }
}));

const GridsDashboardView = ({ grid }) => {
  const classes = useStyles();

  const currentAirQloud = useCurrentAirQloudData();
  const dispatch = useDispatch();
  const userDefaultGraphs = useUserDefaultGraphsData();
  const recentEventsData = useEventsMapData();

  const [pm2_5SiteCount, setPm2_5SiteCount] = useState({
    Good: 0,
    Moderate: 0,
    UHFSG: 0,
    Unhealthy: 0,
    VeryUnhealthy: 0,
    Hazardous: 0
  });

  useEffect(() => {
    if (isEmpty(recentEventsData.features))
      dispatch(
        loadMapEventsData({ recent: 'yes', external: 'no', metadata: 'site_id', active: 'yes' })
      );
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
    const airqloudSites = flattenSiteOptions(currentAirQloud.siteOptions);
    const airqloudSitesObj = siteOptionsToObject(currentAirQloud.siteOptions);
    recentEventsData.features &&
      recentEventsData.features.map((feature) => {
        if (airqloudSites.includes(feature.properties.site_id)) {
          const site_id = feature.properties.site_id || '';
          const site = airqloudSitesObj[site_id];
          const pm2_5 =
            feature.properties &&
            feature.properties.pm2_5 &&
            (feature.properties.pm2_5.calibratedValue || feature.properties.pm2_5.value);

          Object.keys(PM_25_CATEGORY).map((key) => {
            const valid = PM_25_CATEGORY[key];
            if (pm2_5 > valid[0] && pm2_5 <= valid[1]) {
              initialCount[key].push({ ...site, pm2_5 });
            }
          });
        }
      });
    setPm2_5SiteCount(initialCount);
  }, [recentEventsData, currentAirQloud]);

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
    if (isEmpty(userDefaultGraphs)) {
      dispatch(loadUserDefaultGraphData());
    }
  }, []);

  // componentWillUnmount
  useEffect(() => {
    return () => dispatch(loadUserDefaultGraphData());
  }, []);

  return (
    <ErrorBoundary>
      <Box marginTop={'40px'}>
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

          {userDefaultGraphs &&
            userDefaultGraphs.map((filter, key) => {
              return (
                <D3CustomisableChart
                  className={clsx(classes.customChartCard)}
                  defaultFilter={filter}
                  key={key}
                />
              );
            })}

          <Grid item lg={6} md={6} sm={12} xl={6} xs={12}>
            <AddChart className={classes.customChartCard} />
          </Grid>
        </Grid>
      </Box>
    </ErrorBoundary>
  );
};

export default GridsDashboardView;
