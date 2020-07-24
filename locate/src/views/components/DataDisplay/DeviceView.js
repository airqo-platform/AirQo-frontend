import React, { useState, useEffect } from "react";
import ChartistGraph from "react-chartist";
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

import { useParams } from 'react-router-dom';

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

export default function DeviceView() {
  let params = useParams();
  
  const classes = useStyles();
  
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
       
        setDeviceStatusValues([
          data["data"]["offline_devices_percentage"],
          data["data"]["online_devices_percentage"],
        ]);
      
       
        setOnlineStatusUpdateTime(data["data"]["created_at"]);
        
      });
  }, []);


    
  const [networkUptime, setNetworkUptime] = useState([]);

  useEffect(() => {
    let channelID = params.channelId
    axios.get(constants.GET_DEVICE_UPTIME+channelID).then(({ data }) => {
      console.log(data);
      setNetworkUptime(data);
    });
  }, []);

  const uptimeData = {
    labels: networkUptime.uptime_labels,
    datasets: [
      {
        label: "Device Uptime",
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
        <GridItem xs={12} sm={12} md={4}>
          <Card>
            <CardHeader color="primary">
              <h4 className={classes.cardTitleWhite}>Device Uptime</h4>
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
              <h4 className={classes.cardTitle}>Device Online Status</h4>
            </CardHeader>
            <CardBody>
             
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
                
              </h4>
            </CardHeader>
            <CardBody>
             
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer>

     
    </div>
  );
}
