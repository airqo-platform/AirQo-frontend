import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { makeStyles } from "@material-ui/styles";
import { Grid } from "@material-ui/core";
import clsx from "clsx";
import PropTypes from "prop-types";
import {
  AddChart,
  AveragesChart,
  CustomisableChart,
  PollutantCategory,
  ExceedancesChart,
} from "./components";
import "chartjs-plugin-annotation";
import { useUserDefaultGraphsData } from "redux/Dashboard/selectors";
import { loadUserDefaultGraphData } from "redux/Dashboard/operations";
import { loadMapEventsData } from "redux/MapData/operations";
import { useEventsMapData } from "redux/MapData/selectors";
import { PM_25_CATEGORY } from "utils/categories";
import { isEmpty } from "underscore";
import { useInitScrollTop } from "utils/customHooks";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(4),
  },
  chartCard: {},
  customChartCard: {
    height: "70vh",
  },
  differenceIcon: {
    color: theme.palette.text.secondary,
  },
  chartContainer: {
    minHeight: 250,
    position: "relative",
  },
  actions: {
    justifyContent: "flex-end",
  },
  chartSaveButton: {},
}));

const Dashboard = () => {
  useInitScrollTop();
  const classes = useStyles();

  const dispatch = useDispatch();
  const userDefaultGraphs = useUserDefaultGraphsData();
  const recentEventsData = useEventsMapData();

  const [pm2_5SiteCount, setPm2_5SiteCount] = useState({
    Good: 0,
    Moderate: 0,
    UHFSG: 0,
    Unhealthy: 0,
    VeryUnhealthy: 0,
    Hazardous: 0,
  });

  useEffect(() => {
    if (isEmpty(recentEventsData.features))
      dispatch(loadMapEventsData({ recent: "yes", external: "no" }));
  }, []);

  useEffect(() => {
    const initialCount = {
      Good: 0,
      Moderate: 0,
      UHFSG: 0,
      Unhealthy: 0,
      VeryUnhealthy: 0,
      Hazardous: 0,
    };
    recentEventsData.features &&
      recentEventsData.features.map((feature) => {
        const pm2_5 =
          feature.properties &&
          feature.properties.pm2_5 &&
          feature.properties.pm2_5.value;
        Object.keys(PM_25_CATEGORY).map((key) => {
          const valid = PM_25_CATEGORY[key];
          if (pm2_5 > valid[0] && pm2_5 <= valid[1]) {
            initialCount[key]++;
          }
        });
      });
    setPm2_5SiteCount(initialCount);
  }, [recentEventsData]);

  function appendLeadingZeroes(n) {
    if (n <= 9) {
      return "0" + n;
    }
    return n;
  }

  let todaysDate = new Date();
  const dateValue = appendLeadingZeroes(
    todaysDate.getDate() +
      "/" +
      appendLeadingZeroes(todaysDate.getMonth() + 1) +
      "/" +
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
    <div className={classes.root}>
      <Grid container spacing={4}>
        <Grid item lg={2} sm={6} xl={2} xs={12}>
          <PollutantCategory
            pm25level="Good"
            pm25levelCount={pm2_5SiteCount.Good}
            iconClass="pm25Good"
          />
        </Grid>
        <Grid item lg={2} sm={6} xl={2} xs={12}>
          <PollutantCategory
            pm25level="Moderate"
            pm25levelCount={pm2_5SiteCount.Moderate}
            iconClass="pm25Moderate"
          />
        </Grid>
        <Grid item lg={2} sm={6} xl={2} xs={12}>
          <PollutantCategory
            pm25level="UHFSG"
            pm25levelCount={pm2_5SiteCount.UHFSG}
            iconClass="pm25UH4SG"
          />
        </Grid>

        <Grid item lg={2} sm={6} xl={2} xs={12}>
          <PollutantCategory
            pm25level="Unhealthy"
            pm25levelCount={pm2_5SiteCount.Unhealthy}
            iconClass="pm25UnHealthy"
          />
        </Grid>

        <Grid item lg={2} sm={6} xl={2} xs={12}>
          <PollutantCategory
            pm25level="Very Unhealthy"
            pm25levelCount={pm2_5SiteCount.VeryUnhealthy}
            iconClass="pm25VeryUnHealthy"
          />
        </Grid>
        <Grid item lg={2} sm={6} xl={2} xs={12}>
          <PollutantCategory
            pm25level="Hazardous"
            pm25levelCount={pm2_5SiteCount.Hazardous}
            iconClass="pm25Harzadous"
          />
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        <AveragesChart classes={classes} />

        <Grid item lg={6} md={6} sm={12} xl={6} xs={12}>
          <ExceedancesChart
            className={clsx(classes.chartCard)}
            date={dateValue}
            chartContainer={classes.chartContainer}
            idSuffix="exceedances"
          />
        </Grid>

        {userDefaultGraphs &&
          userDefaultGraphs.map((filter, key) => {
            return (
              <CustomisableChart
                className={clsx(classes.customChartCard)}
                defaultFilter={filter}
                idSuffix={`custom-${key + 1}`}
                key={key}
              />
            );
          })}

        <Grid item lg={6} md={6} sm={12} xl={6} xs={12}>
          <AddChart className={classes.customChartCard} />
        </Grid>
      </Grid>
    </div>
  );
};

Dashboard.propTypes = {
  className: PropTypes.string,
  mappedAuth: PropTypes.object.isRequired,
  fetchDefaults: PropTypes.func.isRequired,
};

export default Dashboard;
