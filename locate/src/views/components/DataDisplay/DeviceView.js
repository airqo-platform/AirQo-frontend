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
//import Table from "../Table/Table.js";
import Tasks from "../Tasks/Tasks.js";
import CustomTabs from "../CustomTabs/CustomTabs";
import Card from "../Card/Card.js";
import CardHeader from "../Card/CardHeader.js";
import CardIcon from "../Card/CardIcon.js";
import CardBody from "../Card/CardBody.js";
import CardFooter from "../Card/CardFooter.js";
import { Map, TileLayer, Marker, Popup } from "react-leaflet";
import { TableContainer, Table, TableBody, TableCell, TableHead, TableRow, Paper } from "@material-ui/core";
import { DeleteOutlined, EditOutlined } from '@material-ui/icons';
import Tooltip from '@material-ui/core/Tooltip';
import { Link } from "react-router-dom";
import { useParams } from 'react-router-dom';
import { Grid, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
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
  const [maintenanceData, setMaintenanceData] = useState([]);
  
  function logs(name) {
    console.log(constants.DEVICE_MAINTENANCE_LOG_URI+name)
    axios
      .get(
        constants.DEVICE_MAINTENANCE_LOG_URI+name
      )
      .then(
      res=>{
        const ref = res.data;
        console.log('Maintenance history data ...')
        console.log(ref);
        console.log(typeof(ref));
        setMaintenanceData(ref);
      }
      );
    }
  const [componentsData, setComponentsData] = useState([]);
  function getComponents(name) {
    console.log('getting components...');
    console.log(constants.GET_COMPONENTS_URI+name);
    axios
      .get(
        constants.GET_COMPONENTS_URI+name
      )
      .then(
      res=>{
        console.log('Components data ...')
        //console.log(res);
        const ref = res.data;
        console.log(ref.components);
        //console.log(typeof(ref.components));
        setComponentsData(ref.components);
      }
      );
    }
  function jsonArrayToString(myJsonArray){
    let myArray = [];
    for (let i=0; i<myJsonArray.length; i++){
      let myString = myJsonArray[i].quantityKind+"("+myJsonArray[i].measurementUnit+")";
      myArray.push(myString);
    }
    return myArray.join(", ")
  }
  
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

  const [loaded, setLoaded] = useState(false);
  const [deviceData, setDeviceData] = useState([]);
  const [deviceName, setDeviceName] = useState('');
  useEffect(() => {
    let deviceID = params.channelId
    axios.get(
      constants.ALL_DEVICES_URI
    )
    .then(
      res=>{
        const ref = res.data;
        for (var i=0; i<ref.length; i++){
          if (ref[i].channelID==deviceID){
            //console.log('ref[i].name');
            //console.log(ref[i].name);
            setDeviceData(ref[i]);
            setDeviceName(ref[i].name);
            console.log('getting maintenance logs')
            console.log(logs(ref[i].name));
            console.log(getComponents(ref[i].name));
            setLoaded(true);
          }
        }
    }).catch(
      console.log
    )
  }, []);

  const [componentData, setComponentData] = useState([]);
  //const [deviceName, setDeviceName] = useState('');
  useEffect(() => {
    let deviceID = params.channelId
    axios.get(
      constants.ALL_DEVICES_URI
    )
    .then(
      res=>{
        const ref = res.data;
        for (var i=0; i<ref.length; i++){
          if (ref[i].channelID==deviceID){
            console.log('ref[i].name');
            console.log(ref[i].name);
            setDeviceData(ref[i]);
            setDeviceName(ref[i].name);
            console.log('getting maintenance logs')
            console.log(logs(ref[i].name));
            setLoaded(true);
          }
        }
    }).catch(
      console.log
    )
  }, []);
 
  //delete  dialog parameters
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [componentName, setComponentName] = useState('');
  //const [componentDescription, setComponentDescription] = useState('')
  //const [componentMeasurement, setComponentMeasurement] = useState('')

  const handleDeleteOpen = () => {
    setDeleteOpen(true);
  };
  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setComponentName('');
    //setLocationID('');
   
  };
  //response dialog
  const [dialogResponseMessage, setDialogResponseMessage] = useState('');
  const [responseOpen, setResponseOpen] = useState(false);
  const handleResponseOpen = () => {
    setResponseOpen(true);
  };
  const handleResponseClose = () => {
    setResponseOpen(false);
  };


 //opens dialog to delete a component
  const handleDeleteComponentClick = (name) => {
    return (event) => {
      console.log('Deleting component '+name);
      setComponentName(name);
      handleDeleteOpen();
    }
  }
  let handleDeleteSubmit = (e) => {
    let filter ={ 
      deviceName: deviceName,
      componentName: componentName,      
    }
    console.log(JSON.stringify(filter));
    console.log(constants.DELETE_COMPONENT_URI+componentName+"&device="+deviceName);
  
    axios.delete(
      constants.constants.DELETE_COMPONENT_URI+componentName+"&device="+deviceName,
      JSON.stringify(filter),
      { headers: { 'Content-Type': 'application/json' } }
    )
    .then(
      res=>{
        console.log('Response returned')
        const myData = res.data;
        console.log(myData.message);
        setDialogResponseMessage('Component successfully deleted');
        handleDeleteClose();
        setResponseOpen(true);
    }).catch(error => {
      setDialogResponseMessage('An error occured. Please try again');
      handleDeleteClose();
      setResponseOpen(true); 

  })

  }




  return (
    <div>
      
      <h4 style={{color: "#3f51b5"}}><b>{deviceData.name} : {deviceData.channelID}</b></h4>
      
     
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

        {/*}

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
  </GridItem> */}
  <GridItem xs={12} sm={12} md={4}>
          <Card>
            <CardHeader color="info">
              <h4 className={classes.cardTitle}>Device Location</h4>
            </CardHeader>
            {loaded? (
            <CardBody>
              {(deviceData.longitude==null) || (deviceData.longitude==0)?
              <Map 
              center={[1.3733, 32.2903]} 
              zoom={13} 
              scrollWheelZoom={false}
              style = {{width: '90%', height: '250px', }}
             //style={{ width: '30%', height: '250px', align:'center'}}
             >
              <TileLayer
               url ="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
             /> 
             {/*<Marker position={[deviceData.latitude, deviceData.longitude]}>
             <Popup>
              <span>
              <span>
                {/*{deviceData.name}
                {deviceName}
              </span>
              </span>
            </Popup>
            </Marker>*/}
            </Map>
               :<Map 
                 center={[deviceData.latitude, deviceData.longitude]} 
                 zoom={13} 
                 scrollWheelZoom={false}
                 style = {{width: '90%', height: '250px', }}
                //style={{ width: '30%', height: '250px', align:'center'}}
                >
                 <TileLayer
                  url ="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                /> 
                <Marker position={[deviceData.latitude, deviceData.longitude]}>
                <Popup>
                 <span>
                 <span>
                   {/*{deviceData.name}*/}
                   {deviceName}
                 </span>
                 </span>
               </Popup>
               </Marker>
               </Map> }
            </CardBody>
      
         ):  
       (
        <CardBody>
        <Map center={[0.3476, 32.5825]} 
       zoom={13} 
       scrollWheelZoom={false}
       style={{ width: '30%', height: '250px', align:'center'}}
       > 
       <TileLayer
            url ="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
      </Map> 
      </CardBody>
       )
    }

          </Card>
        </GridItem>
       {/*
        <GridItem xs={12} sm={12} md={4}>
          <Card>
            <CardHeader color="primary">
              <h4 className={classes.cardTitleWhite}>
                
              </h4>
            </CardHeader>
            <CardBody>
             
            </CardBody>
          </Card>
        </GridItem>*/}
         <GridItem xs={12} sm={12} md={4}>
          <Card>
            <CardHeader color="primary">
              <h4 className={classes.cardTitleWhite}>
                Device Details
              </h4>
            </CardHeader>
            <CardBody>
            <div alignContent = "left" style = {{alignContent:"left", alignItems:"left"}}>
            <TableContainer component={Paper} className = {classes.table}>  
             <Table stickyHeader  aria-label="sticky table" alignItems="left" alignContent="left">  
               <TableBody style = {{alignContent:"left", alignItems:"left"}} >  
                 <TableRow style={{ align: 'left' }} >  
                   <TableCell><b>Power Type: </b>{deviceData.powerType}</TableCell>
                   {/*<TableCell className = {classes.table}>: <b>{deviceData.powerType}</b></TableCell> */}
                 </TableRow>
                 <TableRow>
                   <TableCell align="left"> <b>Owner: </b>{deviceData.owner} </TableCell>
                 </TableRow>
                 <TableRow>
                   <TableCell><b>Manufacturer:</b> {deviceData.device_manufacturer}</TableCell>
                 </TableRow>
                 <TableRow>
                  <TableCell><b>Product Name: </b>{deviceData.productName}</TableCell>
                 </TableRow>
                 <TableRow>
                   <TableCell><b>ISP: </b>{deviceData.ISP}</TableCell>
                 </TableRow>
                 <TableRow>
                   <TableCell><b>Phone Number: </b>{"0"+deviceData.phoneNumber}</TableCell>
                 </TableRow>
               </TableBody>
            </Table>
          </TableContainer>
                
            </div>
             
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer>

      <GridContainer>
        
        <GridItem xs={12} sm={12} md={4}>
          <Card>
            <CardHeader color="primary">
              <h4 className={classes.cardTitleWhite}>Maintenance History</h4>
            </CardHeader>

            <CardBody>
        <div alignContent = "left" style = {{alignContent:"left", alignItems:"left"}}>
            <TableContainer component={Paper} className = {classes.table}>  
             <Table stickyHeader  aria-label="sticky table" alignItems="left" alignContent="left">  
               <TableBody style = {{alignContent:"left", alignItems:"left"}} >  
               
               {maintenanceData.map( (log) => (
                 <TableRow style={{ align: 'left' }} >  
                  <TableCell>{log.date}</TableCell>
                  <TableCell>{log.activity}</TableCell>
                </TableRow>))
                }
               </TableBody>
            </Table>
          </TableContainer>
                
              </div>
            </CardBody>
          </Card>
        </GridItem>

       

       {/*
       <GridItem xs={12} sm={12} md={4}>
          <Card>
            <CardHeader color="primary">
              <h4 className={classes.cardTitleWhite}>
                
              </h4>
            </CardHeader>
            <CardBody>
             
            </CardBody>
          </Card>
       </GridItem> */}

      <GridItem xs={12} sm={12} md={4}>
          <Card>
            <CardHeader color="info">
              <h4 className={classes.cardTitle}>Device Components</h4>
            </CardHeader>
            <CardBody>
            <div alignContent = "left" style = {{alignContent:"left", alignItems:"left"}}>
            <TableContainer component={Paper} className = {classes.table}>  
             <Table stickyHeader  aria-label="sticky table" alignItems="left" alignContent="left">
               <TableHead>
                 <TableRow style={{ align: 'left' }} >  
                  <TableCell>Description</TableCell>                  
                  <TableCell>Quantities</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
                 
              </TableHead>  
               <TableBody style = {{alignContent:"left", alignItems:"left"}} >  
               {componentsData.map( (component) => (
                 <TableRow style={{ align: 'left' }} >  
                  <TableCell>{component.description}</TableCell>                  
                  <TableCell>{jsonArrayToString(component.measurement)}</TableCell>
                  <TableCell>
                    {/*
                  <Tooltip title="Edit">
                    <Link onClick= {handleEditComponentClick} style = {{"color":"black"}}>
                    <EditOutlined> </EditOutlined> 
                    </Link>
                    </Tooltip>*/}
                  <Tooltip title="Delete">
                    <Link onClick= {handleDeleteComponentClick(component.name)} style = {{"color":"black"}}>
                    <DeleteOutlined> </DeleteOutlined> 
                    </Link>
                  </Tooltip>
                  
                  </TableCell>
                </TableRow>))
                }
               </TableBody>
            </Table>
          </TableContainer>
                
              </div>
             
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
              <h4 className={classes.cardTitleWhite}>Sensor Correlation</h4>
            </CardHeader>
            <CardBody>
            <div alignContent = "left" style = {{alignContent:"left", alignItems:"left"}}>
                
            </div>
             
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer>

      {responseOpen?
    (
      <Dialog
      open={responseOpen}
      onClose={handleResponseClose}
      aria-labelledby="form-dialog-title"
      aria-describedby="form-dialog-description"
      >
        <DialogContent>
          {dialogResponseMessage}
        </DialogContent> 
        
        <DialogActions>
          <Grid container alignItems="center" alignContent="center" justify="center">
            <Button 
              variant="contained" 
              color="primary"              
              onClick={handleResponseClose}
            > OK
            </Button>
          </Grid>
        </DialogActions>
    </Dialog>
    ): null   
  }

{deleteOpen? (
       
       <Dialog
           open={deleteOpen}
           onClose={handleDeleteClose}
           aria-labelledby="form-dialog-title"
           aria-describedby="form-dialog-description"
         >
           <DialogTitle id="form-dialog-title" style={{alignContent:'center'}}>Delete a component</DialogTitle>
           
                <DialogContent>
                  Are you sure you want to delete component {componentName} from device {deviceName}?
                </DialogContent> 
          
                <DialogActions>
                <Grid container alignItems="center" alignContent="center" justify="center">
                 <Button 
                  variant="contained" 
                  color="primary"              
                  onClick = {handleDeleteSubmit}
                 > YES
                </Button>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
               <Button 
                variant="contained" 
                color="primary"              
                onClick = {handleDeleteClose}
               > NO
               </Button>
               </Grid>
           </DialogActions>
         </Dialog>
         ) : null}

     
    </div>
  );
}
