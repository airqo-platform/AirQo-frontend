import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import DevicesIcon from "@material-ui/icons/Devices";
import ReportProblem from "@material-ui/icons/ReportProblem";
import BatteryFullIcon from "@material-ui/icons/BatteryFull";
import AccessTime from "@material-ui/icons/AccessTime";
import RestoreIcon from "@material-ui/icons/Restore";
import WbSunnyIcon from "@material-ui/icons/WbSunny";
import PowerIcon from "@material-ui/icons/Power";
import Table from "../Table/Table.js";
import Card from "../Card/Card.js";
import CardBody from "../Card/CardBody.js";
import CardFooter from "../Card/CardFooter.js";
import { isEmpty } from "underscore";
import Map from "./Map/Map";
import constants from "../../../config/constants";
import axios from "axios";
import palette from "../../../assets/theme/palette";
import { Line, Pie } from "react-chartjs-2";
import {
  useDevicesStatusData,
  useNetworkUptimeData,
} from "redux/DeviceManagement/selectors";
import {
  loadDevicesStatusData,
  loadNetworkUptimeData,
} from "redux/DeviceManagement/operations";

import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
import "chartjs-plugin-annotation";
import "assets/scss/device-management.sass";

const useStyles = makeStyles(styles);

const OverviewCard = ({ label, icon, value }) => {
  return (
    <div className={"card-container"}>
      <Card style={{ margin: 0 }}>
        <div className={"card-title-wrapper"}>
          <span className={"card-title-icon"}>{icon}</span>
          <h3 className={"card-title"}>{value}</h3>
          <div className={"card-divider"} />
          <p className={"card-category"}>{label}</p>
        </div>
      </Card>
    </div>
  );
};

export default function DeviceManagement() {
  const classes = useStyles();
  const devicesStatusData = useDevicesStatusData();
  const networkUptimeData = useNetworkUptimeData();
  const dispatch = useDispatch();
  const [pieChartStatusValues, setPieChartStatusValues] = useState([]);
  const [networkUptimeLineValues, setNetworkUptimeLineValues] = useState([
    [],
    [],
  ]);

  useEffect(() => {
    if (isEmpty(devicesStatusData)) {
      dispatch(loadDevicesStatusData());
    }
    if (isEmpty(networkUptimeData)) {
      dispatch(loadNetworkUptimeData(28));
    }
  }, []);

  useEffect(() => {
    let label = [];
    let values = [];
    if (isEmpty(networkUptimeData)) {
      return;
    }

    networkUptimeData.map((val) => {
      label.push(val.created_at.split("T")[0]);
      values.push(parseFloat(val.uptime).toFixed(2));
    });

    setNetworkUptimeLineValues([label, values]);
  }, [networkUptimeData]);

  useEffect(() => {
    setPieChartStatusValues([
      devicesStatusData.count_of_offline_devices,
      devicesStatusData.count_of_online_devices,
    ]);
  }, [devicesStatusData]);

  const uptimeData = {
    labels: networkUptimeLineValues[0],
    datasets: [
      {
        label: "Network Uptime",
        data: networkUptimeLineValues[1],
        fill: false,
        borderColor: palette.primary.main,
        backgroundColor: "#BCBD22",
      },
    ],
  };

  const optionsNetworkUptime = {
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
            labelString: "Date",
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
            labelString: "Battery Voltage",
          },
        },
      ],
    },
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-around",
          margin: "20px 0",
        }}
      >
        <OverviewCard
          label={"Devices on the network"}
          value={devicesStatusData.total_active_device_count}
          icon={<DevicesIcon />}
        />

        <OverviewCard
          label={"Due for maintenance"}
          value={devicesStatusData.count_due_maintenance}
          icon={<RestoreIcon />}
        />

        <OverviewCard
          label={"Overdue for maintenance"}
          value={devicesStatusData.count_overdue_maintenance}
          icon={<ReportProblem />}
        />

        <OverviewCard
          label={"Solar powered"}
          value={devicesStatusData.count_of_solar_devices}
          icon={<WbSunnyIcon />}
        />

        <OverviewCard
          label={"Alternator"}
          value={devicesStatusData.count_of_alternator_devices}
          icon={<BatteryFullIcon />}
        />

        <OverviewCard
          label={"Mains Powered"}
          value={devicesStatusData.count_of_mains}
          icon={<PowerIcon />}
        />
      </div>

      <div className={"map-container"}>
        <Card style={{ height: "100%" }}>
          <div style={{ height: "100%" }}>
            <Map
              onlineDevices={devicesStatusData.online_devices || []}
              offlineDevices={devicesStatusData.offline_devices || []}
            />
          </div>
        </Card>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        <div
          className={"overview-item-container"}
          style={{ minWidth: "550px" }}
        >
          <h4 className={classes.cardTitleBlue}>Network Uptime</h4>

          <Card className={classes.cardBody}>
            <div className={classes.chartContainer}>
              <Line
                height={"400px"}
                data={uptimeData}
                options={optionsNetworkUptime}
              />
            </div>

            <div className={classes.stats}>
              <AccessTime /> Last updated{" "}
              {networkUptimeData.length > 0 && networkUptimeData[0].created_at}
            </div>
          </Card>
        </div>

        <div
          className={"overview-item-container"}
          style={{ minWidth: "550px" }}
        >
          <h4 className={classes.cardTitleGreen}>Online Status</h4>
          <Card className={classes.cardBody}>
            <div className={classes.chartContainer}>
              <Pie
                id="pie"
                height={"162px"}
                data={{
                  labels: ["Offline", "Online"],
                  datasets: [
                    {
                      label: "Device Status",
                      data: pieChartStatusValues,
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
            </div>
            <CardFooter chart>
              <div className={classes.stats}>
                <AccessTime /> Last updated on {devicesStatusData.created_at}
              </div>
            </CardFooter>
          </Card>
        </div>

        <div
          className={"overview-item-container"}
          style={{ minWidth: "550px" }}
        >
          <h4 className={classes.cardTitleBlue}>Leaderboard</h4>
          <Card className={classes.cardBody}>
            <p className={classes.cardCategoryWhite}>
              Best performing 5 devices on network in the past 28 days
            </p>

            <CardBody>
              <Table
                tableHeaderColor="primary"
                tableHead={["Device Channel", "Uptime(%)", "Downtime(%)"]}
                // tableData={bestPerformingDevicesInTwentyEightDays}
                tableData={[]}
              />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
