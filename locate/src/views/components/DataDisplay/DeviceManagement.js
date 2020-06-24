import React, { useState, useEffect } from "react";
// react plugin for creating charts
import ChartistGraph from "react-chartist";
// @material-ui/core
import { makeStyles } from "@material-ui/core/styles";
import Icon from "@material-ui/core/Icon";
// @material-ui/icons
import DevicesIcon from "@material-ui/icons/Devices";
import AccessTime from "@material-ui/icons/AccessTime";
import BugReport from "@material-ui/icons/BugReport";
import Code from "@material-ui/icons/Code";
import Cloud from "@material-ui/icons/Cloud";
import RestoreIcon from "@material-ui/icons/Restore";
import WbSunnyIcon from "@material-ui/icons/WbSunny";
import PowerIcon from "@material-ui/icons/Power";
import NotificationsNoneIcon from "@material-ui/icons/NotificationsNone";
import ScheduleIcon from "@material-ui/icons/Schedule";
import TasksWithoutEdits from "../Tasks/TasksWithoutEdits";
// core components
import GridItem from "../Grid/GridItem.js";
import GridContainer from "../Grid/GridContainer.js";
import Table from "../Table/Table.js";
import Tasks from "../Tasks/Tasks.js";
import CustomTabs from "../CustomTabs/CustomTabs";
import Card from "../Card/Card.js";
import CardHeader from "../Card/CardHeader.js";
import CardIcon from "../Card/CardIcon.js";
import CardBody from "../Card/CardBody.js";
import CardFooter from "../Card/CardFooter.js";

import {
  dailySalesChart,
  emailsSubscriptionChart,
  completedTasksChart,
  OnlineStatusChart,
} from "../../variables/charts.js";

import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";

const useStyles = makeStyles(styles);

export default function DeviceManagement(props) {
  const { className, mappedAuth, mappedAlerts, mappedIssues, ...rest } = props;

  const { user } = mappedAuth;
  const { alerts } = mappedAlerts;
  const { issues } = mappedIssues;

  useEffect(() => {
    props.fetchAlerts();
  }, []);

  useEffect(() => {
    props.fetchIssues();
  }, []);

  const classes = useStyles();
  return (
    <div>
      <GridContainer>
        <GridItem xs={12} sm={6} md={3}>
          <Card>
            <CardHeader color="primary" stats icon>
              <CardIcon color="primary">
                <DevicesIcon />
              </CardIcon>
              <p className={classes.cardCategory}>Devices on the network</p>
              <h3 className={classes.cardTitle}>70</h3>
            </CardHeader>
            <CardFooter stats></CardFooter>
          </Card>
        </GridItem>
        <GridItem xs={12} sm={6} md={3}>
          <Card>
            <CardHeader color="primary" stats icon>
              <CardIcon color="primary">
                <RestoreIcon />
              </CardIcon>
              <p className={classes.cardCategory}>Due for maintenance</p>
              <h3 className={classes.cardTitle}>20</h3>
            </CardHeader>
            <CardFooter stats></CardFooter>
          </Card>
        </GridItem>
        <GridItem xs={12} sm={6} md={3}>
          <Card>
            <CardHeader color="primary" stats icon>
              <CardIcon color="primary">
                <WbSunnyIcon />
              </CardIcon>
              <p className={classes.cardCategory}>Solar powered</p>
              <h3 className={classes.cardTitle}>30</h3>
            </CardHeader>
            <CardFooter stats></CardFooter>
          </Card>
        </GridItem>
        <GridItem xs={12} sm={6} md={3}>
          <Card>
            <CardHeader color="primary" stats icon>
              <CardIcon color="primary">
                <PowerIcon />
              </CardIcon>
              <p className={classes.cardCategory}>Mains Powered</p>
              <h3 className={classes.cardTitle}>40</h3>
            </CardHeader>
            <CardFooter stats></CardFooter>
          </Card>
        </GridItem>
      </GridContainer>
      <GridContainer>
        <GridItem xs={12} sm={12} md={4}>
          <Card chart>
            <CardHeader color="info">
              <ChartistGraph
                className="ct-chart"
                data={dailySalesChart.data}
                type="Line"
                options={dailySalesChart.options}
                listener={dailySalesChart.animation}
              />
            </CardHeader>
            <CardBody>
              <h4 className={classes.cardTitle}>
                Average network uptime analysis
              </h4>
            </CardBody>
            <CardFooter chart>
              <div className={classes.stats}>
                <AccessTime /> updated 4 minutes ago
              </div>
            </CardFooter>
          </Card>
        </GridItem>
        <GridItem xs={12} sm={12} md={4}>
          <Card>
            <CardHeader color="primary">
              <h4 className={classes.cardTitleWhite}>Inactive Devices</h4>
            </CardHeader>
            <CardBody>
              <Table
                tableHeaderColor="primary"
                tableHead={["Device", "Location", "Type", "Carrier"]}
                tableData={[
                  [
                    "Bwaise-2020-01-15T13:16:43.218Z",
                    "Bwaise",
                    "static",
                    "MTN",
                  ],
                  [
                    "Kamwokya-2020-01-15T13:16:43.218Z",
                    "Kamwokya",
                    "Static",
                    "Airtel",
                  ],
                  [
                    "Lugazi-2020-01-15T13:16:43.218Z",
                    "Lugazi",
                    "Static",
                    "MTN",
                  ],
                ]}
              />
            </CardBody>
          </Card>
        </GridItem>
        <GridItem xs={12} sm={12} md={4}>
          <Card chart>
            <CardHeader color="info">
              <ChartistGraph
                className="ct-chart"
                data={OnlineStatusChart.data}
                type="Pie"
                options={OnlineStatusChart.options}
              />
            </CardHeader>
            <CardBody>
              <h4 className={classes.cardTitle}>Online Status</h4>
            </CardBody>
            <CardFooter chart>
              <div className={classes.stats}>
                <AccessTime /> updated 2 minutes ago
              </div>
            </CardFooter>
          </Card>
        </GridItem>
      </GridContainer>
      <GridContainer>
        <GridItem xs={12} sm={12} md={6}>
          <CustomTabs
            title="Incident Report:"
            headerColor="primary"
            /** for each object within the array
             * I will map to construct an appropriate array which has
             * the unit name and the activity which as carried out
             */
            tabs={[
              {
                tabName: "Alerts",
                tabIcon: NotificationsNoneIcon,
                tabContent: (
                  <TasksWithoutEdits
                    checkedIndexes={[0]}
                    tasksIndexes={[0, 1, 2, 3, 4, 5]}
                    tasks={alerts.map(function (alert) {
                      return alert.unit + "-" + alert.activity;
                    })}
                  />
                ),
              },
              {
                tabName: "Issues",
                tabIcon: BugReport,
                tabContent: (
                  <TasksWithoutEdits
                    checkedIndexes={[0]}
                    tasksIndexes={[0, 1, 2, 3, 4, 5]}
                    tasks={issues.map(function (issue) {
                      return issue.unit + "-" + alert.issue;
                    })}
                  />
                ),
              },
              {
                tabName: "Schedule",
                tabIcon: ScheduleIcon,
                tabContent: (
                  <TasksWithoutEdits
                    checkedIndexes={[0]}
                    tasksIndexes={[0, 1, 2, 3, 4, 5]}
                    tasks={alerts.map(function (alert) {
                      return alert.unit + "-" + alert.activity;
                    })}
                  />
                ),
              },
            ]}
          />
        </GridItem>
        <GridItem xs={12} sm={12} md={6}>
          <Card>
            <CardHeader color="primary">
              <h4 className={classes.cardTitleWhite}>Leaderboard</h4>
              <p className={classes.cardCategoryWhite}>
                Best and worst performing devices
              </p>
            </CardHeader>
            <CardBody>
              <Table
                tableHeaderColor="primary"
                tableHead={["Device", "Location", "Type", "Days Active"]}
                tableData={[
                  ["1", "Bwaise-2020-01-15T13:16:43.218Z", "Bwaise", "Static"],
                  [
                    "2",
                    "Kamwokya-2020-01-15T13:16:43.218Z",
                    "Kamwokya",
                    "Static",
                  ],
                  ["3", "Lugazi-2020-01-15T13:16:43.218Z", "Lugazi", "Static"],
                  ["4", "Lugazi-2020-01-15T13:16:43.218Z", "Lugazi", "Static"],
                ]}
              />
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer>
    </div>
  );
}
