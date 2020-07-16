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
import Map from "./Map/Map";

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
import palette from "../../../assets/theme/palette";
import { Line, Bar, Pie } from "react-chartjs-2";

const useStyles = makeStyles(styles);

export default function DeviceManagement() {
  const [inActiveDevices, setInActiveDevices] = useState([]);
  const [inActiveDevicesCount, setInActiveDevicesCount] = useState(0);

  useEffect(() => {
    axios.get(constants.GET_LATEST_OFFLINE_DEVICES).then(({ data }) => {
      console.log(data);

      let devices = data.map((x) => [
        x["name"],
        x["time_offline"],
        x["mobility"],
        x["power"],
      ]);
      setInActiveDevices(devices.slice(2, 7));
      setInActiveDevicesCount(data.length);
    });
  }, []);

  const [
    worstPerformingDevicesInTwentyFourHours,
    setWorstPerformingDevicesInTwentyFourHours,
  ] = useState([]);
  const [
    worstPerformingDevicesAllTime,
    setWorstPerformingDevicesAllTime,
  ] = useState([]);
  const [
    worstPerformingDevicesInTwentyEightDays,
    setWorstPerformingDevicesInTwentyEightDays,
  ] = useState([]);
  const [
    worstPerformingDevicesInTwelveMonths,
    setWorstPerformingInTwelveMonths,
  ] = useState([]);
  const [
    worstPerformingDevicesInSevenDays,
    setWorstPerformingDevicesInSevenDays,
  ] = useState([]);
  useEffect(() => {
    axios
      .get(constants.GET_NETWORK_WORST_PERFORMING_DEVICES)
      .then(({ data }) => {
        console.log(data);
        let twenty_four_data = data["24 hours"];
        let all_time_data = data["all time"];
        let seven_days_data = data["7 days"];
        let twenty_eight_days_data = data["28 days"];
        let twelve_months_data = data["12 months"];

        let devicesSevenDays = seven_days_data.map((x) => [
          x["device_channel_id"],
          x["device_uptime_in_percentage"],
          x["device_downtime_in_percentage"],
        ]);
        setWorstPerformingDevicesInSevenDays(devicesSevenDays.slice(0, 5));

        let devices_all_time = all_time_data.map((x) => [
          x["device_channel_id"],
          x["device_uptime_in_percentage"],
          x["device_downtime_in_percentage"],
        ]);
        setWorstPerformingDevicesAllTime(devices_all_time.slice(0, 5));

        let devicesTwentyFourHour = twenty_four_data.map((x) => [
          x["device_channel_id"],
          x["device_uptime_in_percentage"],
          x["device_downtime_in_percentage"],
        ]);
        setWorstPerformingDevicesInTwentyFourHours(
          devicesTwentyFourHour.slice(0, 5)
        );

        let devicesTwentyEightDays = twenty_eight_days_data.map((x) => [
          x["device_channel_id"],
          x["device_uptime_in_percentage"],
          x["device_downtime_in_percentage"],
        ]);
        setWorstPerformingDevicesInTwentyEightDays(
          devicesTwentyEightDays.slice(0, 5)
        );

        let devicesTwelveMonths = twelve_months_data.map((x) => [
          x["device_channel_id"],
          x["device_uptime_in_percentage"],
          x["device_downtime_in_percentage"],
        ]);
        setWorstPerformingInTwelveMonths(devicesTwelveMonths.slice(0, 5));
      });
  }, []);

  const [
    bestPerformingDevicesInTwentyFourHours,
    setBestPerformingDevicesInTwentyFourHours,
  ] = useState([]);
  const [
    bestPerformingDevicesAllTime,
    setBestPerformingDevicesAllTime,
  ] = useState([]);
  const [
    bestPerformingDevicesInTwentyEightDays,
    setBestPerformingDevicesInTwentyEightDays,
  ] = useState([]);
  const [
    bestPerformingDevicesInTwelveMonths,
    setBestPerformingInTwelveMonths,
  ] = useState([]);
  const [
    bestPerformingDevicesInSevenDays,
    setBestPerformingDevicesInSevenDays,
  ] = useState([]);

  useEffect(() => {
    axios
      .get(constants.GET_NETWORK_BEST_PERFORMING_DEVICES)
      .then(({ data }) => {
        console.log(data);
        let twenty_four_data = data["24 hours"];
        let all_time_data = data["all time"];
        let seven_days_data = data["7 days"];
        let twenty_eight_days_data = data["28 days"];
        let twelve_months_data = data["12 months"];

        let devicesSevenDays = seven_days_data.map((x) => [
          x["device_channel_id"],
          x["device_uptime_in_percentage"],
          x["device_downtime_in_percentage"],
        ]);
        setBestPerformingDevicesInSevenDays(devicesSevenDays.slice(0, 5));

        let devices_all_time = all_time_data.map((x) => [
          x["device_channel_id"],
          x["device_uptime_in_percentage"],
          x["device_downtime_in_percentage"],
        ]);
        setBestPerformingDevicesAllTime(devices_all_time.slice(0, 5));

        let devicesTwentyFourHour = twenty_four_data.map((x) => [
          x["device_channel_id"],
          x["device_uptime_in_percentage"],
          x["device_downtime_in_percentage"],
        ]);
        setBestPerformingDevicesInTwentyFourHours(
          devicesTwentyFourHour.slice(0, 5)
        );

        let devicesTwentyEightDays = twenty_eight_days_data.map((x) => [
          x["device_channel_id"],
          x["device_uptime_in_percentage"],
          x["device_downtime_in_percentage"],
        ]);
        setBestPerformingDevicesInTwentyEightDays(
          devicesTwentyEightDays.slice(0, 5)
        );

        let devicesTwelveMonths = twelve_months_data.map((x) => [
          x["device_channel_id"],
          x["device_uptime_in_percentage"],
          x["device_downtime_in_percentage"],
        ]);
        setBestPerformingInTwelveMonths(devicesTwelveMonths.slice(0, 5));
      });
  }, []);

  const [onlineStatusUpdateTime, setOnlineStatusUpdateTime] = useState();
  const [onlineStatusChart, setOnlineStatusChart] = useState({
    data: {},
    options: {},
  });
  const [deviceStatusValues, setDeviceStatusValues] = useState([]);

  useEffect(() => {
    axios
      .get(constants.GET_DEVICE_STATUS_FOR_PIECHART_DISPLAY)
      .then(({ data }) => {
        console.log("data values");
        console.log(data);
        console.log("offline:" + data["data"]["offline_devices_percentage"]);
        console.log("online:" + data["data"]["online_devices_percentage"]);

        setDeviceStatusValues([
          data["data"]["offline_devices_percentage"],
          data["data"]["online_devices_percentage"],
        ]);
        let onlineStatusChartData = {
          data: {
            series: [
              data["data"]["offline_devices_percentage"],
              data["data"]["online_devices_percentage"],
            ],
            //labels: ['Offline', 'Online']
          },
          options: {
            donut: true,
            donutWidth: 60,
            donutSolid: true,
            startAngle: 270,
            showLabel: true,
          },
        };
        setOnlineStatusChart(onlineStatusChartData);
        setOnlineStatusUpdateTime(data["data"]["created_at"]);
        console.log(onlineStatusChartData);
      });
  }, []);

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
    axios.get(constants.GET_DEVICE_STATUS_SUMMARY).then(({ data }) => {
      //console.log(data[0].loc_power_suppy);
      let no_devices = 0;
      data.map((item) => {
        no_devices++;
      });
      setStatusSummary(data);
      setNoOfDevices(no_devices);
    });

    // get total number of devices on solar power or main power
    axios.get(constants.GET_DEVICE_POWER_TYPE).then(({ data }) => {
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

    // get number of devices due for maintenance,
    // look for the nextMaintenance field in devices collection
    axios.get(constants.GET_DEVICE_STATUS_SUMMARY).then(({ data }) => {
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

  const [networkUptime, setNetworkUptime] = useState([]);

  useEffect(() => {
    axios.get(constants.GET_NETWORK_UPTIME).then(({ data }) => {
      console.log(data);
      setNetworkUptime(data);
    });
  }, []);

  const uptimeData = {
    labels: networkUptime.uptime_labels,
    datasets: [
      {
        label: "Network Uptime",
        data: networkUptime.uptime_values,
        fill: false,
        borderColor: palette.primary.main,
        backgroundColor: "#BCBD22",
      },
    ],
  };

  const options_main = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    legend: { display: false },
    cornerRadius: 0,
    tooltips: {
      enabled: true,
      mode: "index",
      intersect: false,
      borderWidth: 1,
      borderColor: palette.divider,
      backgroundColor: palette.white,
      titleFontColor: palette.text.primary,
      bodyFontColor: palette.text.secondary,
      footerFontColor: palette.text.secondary,
    },
    layout: { padding: 0 },
    scales: {
      xAxes: [
        {
          barThickness: 35,
          //maxBarThickness: 10,
          barPercentage: 1,
          //categoryPercentage: 0.5,
          ticks: {
            fontColor: palette.text.secondary,
          },
          gridLines: {
            display: false,
            drawBorder: false,
          },
          scaleLabel: {
            display: true,
            labelString: "Time Periods",
          },
        },
      ],
      yAxes: [
        {
          ticks: {
            fontColor: palette.text.secondary,
            beginAtZero: true,
            min: 0,
          },
          gridLines: {
            borderDash: [2],
            borderDashOffset: [2],
            color: palette.divider,
            drawBorder: false,
            zeroLineBorderDash: [2],
            zeroLineBorderDashOffset: [2],
            zeroLineColor: palette.divider,
          },
          scaleLabel: {
            display: true,
            labelString: "Uptime(%)",
          },
        },
      ],
    },
  };

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
              <h3 className={classes.cardTitle}>0</h3>
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
        <GridItem xs={12} sm={12} md={12}>
          <Card>
            <div className={classes.mapContainer}>
              <Map />
            </div>
          </Card>
        </GridItem>
      </GridContainer>

      <GridContainer>
        <GridItem xs={12} sm={12} md={4}>
          <Card>
            <CardHeader color="primary">
              <h4 className={classes.cardTitleWhite}>Network Uptime</h4>
            </CardHeader>

            <CardBody>
              <div className={classes.chartContainer}>
                <Bar height={250} data={uptimeData} options={options_main} />
              </div>
            </CardBody>

            <CardFooter>
              <div className={classes.stats}>
                <AccessTime /> Last updated {networkUptime.created_at}
              </div>
            </CardFooter>
          </Card>
        </GridItem>

        <GridItem xs={12} sm={12} md={4}>
          <Card>
            <CardHeader color="info">
              <h4 className={classes.cardTitle}>Online Status</h4>
            </CardHeader>
            <CardBody>
              <Pie
                id="pie"
                height={200}
                data={{
                  labels: ["Offline", "Online"],
                  datasets: [
                    {
                      label: "Device Status",
                      data: deviceStatusValues,
                      backgroundColor: ["#BCBD22", "#17BECF"],
                    },
                  ],
                }}
                options={{
                  tooltips: {
                    callbacks: {
                      label: function (tooltipItem, data) {
                        var allData =
                          data.datasets[tooltipItem.datasetIndex].data;
                        var tooltipLabel = data.labels[tooltipItem.index];
                        var tooltipData = allData[tooltipItem.index];
                        var total = 0;
                        for (var i in allData) {
                          total += allData[i];
                        }
                        var tooltipPercentage = Math.round(
                          (tooltipData / total) * 100
                        );
                        return tooltipLabel + ": " + tooltipPercentage + "%";
                      },
                    },
                  },

                  maintainAspectRatio: true,
                  responsive: true,
                }}
              />
            </CardBody>
            <CardFooter chart>
              <div className={classes.stats}>
                <AccessTime /> Last updated on {onlineStatusUpdateTime}
              </div>
            </CardFooter>
          </Card>
        </GridItem>

        <GridItem xs={12} sm={12} md={4}>
          <Card>
            <CardHeader color="primary">
              <h4 className={classes.cardTitleWhite}>
                Offline Devices({inActiveDevicesCount})
              </h4>
            </CardHeader>
            <CardBody>
              <Table
                tableHeaderColor="primary"
                tableHead={["Device", "Time Offline", "Type", "Power Supply"]}
                tableData={inActiveDevices}
              />
            </CardBody>
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

        <GridItem xs={12} sm={12} md={3} lg={3}>
          <Card>
            <CardHeader color="primary">
              <h4 className={classes.cardTitleWhite}>Leaderboard</h4>
              <p className={classes.cardCategoryWhite}>
                Best performing 5 devices on network in the past 28 days
              </p>
            </CardHeader>
            <CardBody>
              <Table
                tableHeaderColor="primary"
                tableHead={["Device Channel", "Uptime(%)", "Downtime(%)"]}
                tableData={bestPerformingDevicesInTwentyEightDays}
              />
            </CardBody>
          </Card>
        </GridItem>
        <GridItem xs={12} sm={12} md={3} lg={3}>
          <Card>
            <CardHeader color="primary">
              <h4 className={classes.cardTitleWhite}>Leaderboard</h4>
              <p className={classes.cardCategoryWhite}>
                Worst performing 5 devices on network in the past 28 days
              </p>
            </CardHeader>
            <CardBody>
              <Table
                tableHeaderColor="primary"
                tableHead={["Device Channel", "Uptime(%)", "Downtime(%)"]}
                tableData={worstPerformingDevicesInTwentyEightDays}
              />
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer>
    </div>
  );
}
