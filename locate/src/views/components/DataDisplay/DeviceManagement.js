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

import { bugs, website, server } from "../../variables/general.js";

import {
  dailySalesChart,
  emailsSubscriptionChart,
  completedTasksChart,
  OnlineStatusChart,
} from "../../variables/charts.js";

import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
import constants from "../../../config/constants";
import axios from "axios";

const useStyles = makeStyles(styles);

export default function DeviceManagement() {
  //set states for storing device status
  const [deviceStatusSummary, setStatusSummary] = useState();
  const [noOfDevices, setNoOfDevices] = useState(0);
  const [solarPowered, setSolarPowered] = useState(0);
  const [batteryPowered, setBatteryPowered] = useState(0);
  const [mainPowered, setMainPowered] = useState(0);
  const [noDueMaintenance, setNoDueMaintenance] = useState(0);

  //const [noOfDevicesTS, setNoOfDevicesTS] = useState(0); //TS= ThinkSpeak

  const classes = useStyles();

  useEffect(() => {
    // get total number of devices on the network
    axios
      .get("http://localhost:4000/api/v1/device/monitor/status")
      .then(({ data }) => {
        //console.log(data[0].loc_power_suppy);
        let no_devices = 0;
        data.map((item) => {
          no_devices++;
        });
        setStatusSummary(data);
        setNoOfDevices(no_devices);
      });

    // get total number of devices on solar power or main power
    axios
      .get("http://localhost:4000/api/v1/device/monitor/power_type")
      .then(({ data }) => {
        //console.log(data[0].loc_power_suppy);
        let no_solar = 0,
          no_main = 0,
          no_battery = 0;
        data.map((item) => {
          if (item.power == "Solar") {
            no_solar = no_solar + 1;
          }
          if (item.power == "Mains") {
            no_main = no_main + 1;
          }
          if (item.power == "Battery") {
            no_battery = no_battery + 1;
          }
        });

        setSolarPowered(no_solar);
        setMainPowered(no_main);
        setBatteryPowered(no_battery);
      });

    // get number of devices due for maintenance
    axios
      .get("http://localhost:4000/api/v1/device/monitor/maintenance_log")
      .then(({ data }) => {
        //console.log(data[0].loc_power_suppy);
        let due_maintenance = new Array();

        data.map((item) => {
          console.log("next maintained", item.nextMaintenance);
          let lst_maintained = item.nextMaintenance;
          let past_date = new Date(lst_maintained);
          let current_date = new Date();

          let month_difference =
            past_date.getFullYear() * 12 +
            past_date.getMonth() -
            (current_date.getFullYear() * 12 + current_date.getMonth());
          console.log(month_difference);
          if (month_difference <= 0) {
            // took two months without maintenance activity
            due_maintenance.push(month_difference);
          }
        });
        setNoDueMaintenance(due_maintenance.length);
      });

    //axios.get(constants.GET_TOTAL_DEVICES).then(({ data }) => {
    // getting total number of devices directly from thinkspeak
    //console.log(data.count);
    // setNoOfDevicesTS(data.count);
    //});
  }, []);

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
              <h3 className={classes.cardTitle}>{noOfDevices}</h3>
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
              <h3 className={classes.cardTitle}> {noDueMaintenance}</h3>
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
              <h3 className={classes.cardTitle}> {solarPowered}</h3>
              {/* <p className={classes.cardCategory}>Battery powered</p>
              <h3 className={classes.cardTitle}> {batteryPowered}</h3> */}
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
              <h3 className={classes.cardTitle}>{mainPowered}</h3>
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
            tabs={[
              {
                tabName: "Issues",
                tabIcon: BugReport,
                tabContent: (
                  <TasksWithoutEdits
                    checkedIndexes={[0]}
                    tasksIndexes={[0, 1, 2, 3]}
                    tasks={bugs}
                  />
                ),
              },
              {
                tabName: "Schedule",
                tabIcon: ScheduleIcon,
                tabContent: (
                  <TasksWithoutEdits
                    checkedIndexes={[0]}
                    tasksIndexes={[0, 1]}
                    tasks={website}
                  />
                ),
              },
              {
                tabName: "Alerts",
                tabIcon: NotificationsNoneIcon,
                tabContent: (
                  <TasksWithoutEdits
                    checkedIndexes={[0]}
                    tasksIndexes={[0]}
                    tasks={server}
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
