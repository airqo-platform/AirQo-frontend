import React, { useState, useEffect } from 'react';
import MaterialTable from "material-table";
import clsx from 'clsx';
import PropTypes from 'prop-types';
import PerfectScrollbar from 'react-perfect-scrollbar';
import axios from 'axios';
import { Link } from "react-router-dom";
import { makeStyles, mergeClasses } from '@material-ui/styles';
import { Card, CardContent, Grid, Button, Dialog, DialogActions, DialogContent, DialogTitle, SvgIcon, Icon } from '@material-ui/core';
import LoadingOverlay from 'react-loading-overlay';
import constants from '../../../config/constants.js';
import TextField from '@material-ui/core/TextField';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers';
//import { AccessAlarm, ThreeDRotation } from '@material-ui/icons';
import { Update, AddOutlined, EditOutlined, CloudUploadOutlined, UndoOutlined, EventBusy } from '@material-ui/icons';
import Tooltip from '@material-ui/core/Tooltip';
//import Select from 'react-select';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';

const useStyles = makeStyles(theme => ({
  root: {},
  content: {
    padding: 0,
  },
  inner: {
    minWidth: 1050
  },
  nameContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  avatar: {
    marginRight: theme.spacing(2)
  },
  actions: {
    justifyContent: 'flex-end'
  },
  link: {
    color: '#3344AA',
    //color: 'black',
    fontFamily: 'Open Sans'
    },
    
  table: {
    fontFamily:'Open Sans'
  },
formControl: {
  minWidth: 200,
  //marginLeft: theme.spacing(2)
  //margin: theme.spacing(2),
},
input: {
  color: 'black',
  fontFamily: 'Open Sans',
  fontweight:500,
  font: '100px',
  fontSize: 17
},

}));


const DevicesTable = props => {
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};
  const { className, users, ...rest } = props;
  const classes = useStyles();
  const [data, setData] = useState([]);   
  const [isLoading, setIsLoading] = useState(false);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [dialogResponseMessage, setDialogResponseMessage] = useState('');

  const [registerOpen, setRegisterOpen] = useState(false);
  const handleRegisterOpen = () => {
    setRegisterOpen(true);
  };
  const handleRegisterClose = () => {
    setRegisterOpen(false);
    setRegisterName('');
    setLatitude('0.332269');
    setLongitude('32.570077');
    setVisibility('');
    setManufacturer('');
    setProductName('');
    setOwner('');
    setISP('');
    setPhone(null);
    setDescription('');
    //setComponents([]);
  };

  const [editOpen, setEditOpen] = useState(false);
  const handleEditOpen = () => {
    setEditOpen(true);
  };
  const handleEditClose = () => {
    setEditOpen(false);
    setRegisterName('');
    setLatitude('0.332269');
    setLongitude('32.570077');
    setVisibility('');
    setManufacturer('');
    setProductName('');
    setOwner('');
    setISP('');
    setPhone(null);
    setDescription('');
    //setComponents([]);
  };

  const [maintenanceOpen, setMaintenanceOpen]= useState(false);
  const handleMaintenanceOpen = () => {
    setMaintenanceOpen(true);
  };
  const handleMaintenanceClose = () => {
    setMaintenanceOpen(false);
    setMaintenanceDescription('');
  };

  const [deployOpen, setDeployOpen]= useState(false);
  const handleDeployOpen = () => {
    setDeployOpen(true);
  };
  const handleDeployClose = () => {
    setDeployOpen(false);
    setDeviceName('');
    setLocationID('');
    setInstallationType('');
    setHeight('');
    setPower('');
    setDeploymentDate(new Date());
    setLatitude('');
    setLongitude('');
    setPrimaryChecked(true);
    setCollocationChecked(false);
  };

  const [recallOpen, setRecallOpen] = useState(false);
  const handleRecallOpen = () => {
    setRecallOpen(true);
  };
  const handleRecallClose = () => {
    setRecallOpen(false);
    setDeviceName('');
    setLocationID('');
    setRecallDate(new Date());
  }

  const [sensorOpen, setSensorOpen] = useState(false);
  const handleSensorOpen = () => {
    setSensorOpen(true);
  };
  const handleSensorClose = () => {
    setSensorOpen(false);
  }

  const [responseOpen, setResponseOpen] = useState(false);
  const handleResponseOpen = () => {
    setResponseOpen(true);
  };
  const handleResponseClose = () => {
    setResponseOpen(false);
  };

  const [hasError, setHasError] = useState(false); 


  //maintenance log parameters
  const [deviceName, setDeviceName] = useState('');
  const [maintenanceDescription, setMaintenanceDescription] = useState('');
  const handleMaintenanceDescriptionChange = description => {
    setMaintenanceDescription(description.target.value);
  } 
  const [selectedDate, setSelectedDate] = useState(new Date());
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };
  //sensor parameters
  const [sensorID, setSensorID] = useState('');
  const handleSensorIDChange = id => {
    setSensorID(id.target.value);
  } 
  const [sensorName, setSensorName] = useState('');
  const handleSensorNameChange = name => {
    setSensorName(name.target.value);
  } 
  const [quantityKind, setQuantityKind] = useState('');
  const handleQuantityKindChange = quantity => {
    setQuantityKind(quantity.target.value);
  } 
  const [measurementUnit, setMeasurementUnit] = useState('');
  const handleMeasurementUnitChange = unit => {
    setMeasurementUnit(unit.target.value);
  }
  
  //deployment parameters
  const [recallDate, setRecallDate] = useState(new Date());
  const [locationsOptions, setLocationsOptions] = useState([]);
  
  useEffect(() => {
    //code to retrieve all locations' data
    //setIsLoading(true);
    axios.get(
      //'http://127.0.0.1:4001/api/v1/device/monitor/devices'
      constants.ALL_LOCATIONS_URI
    )
    .then(
      res=>{
        //setIsLoading(false);
        const ref = res.data;
        console.log(ref);
        let locationArray = [];
        for (var i=0; i<ref.length; i++){
          //pass
          locationArray.push(ref[i].loc_ref)
        }
        setLocationsOptions(locationArray);

    }).catch(
      console.log
    )
  }, []);

  const [devicesInLocation, setDevicesInLocation] = useState([]);
  const [devicesLabel, setDevicesLabel] = useState('');

  let locationCoordinates = (loc_ref) => {
    axios.get(
      constants.EDIT_LOCATION_DETAILS_URI+loc_ref
    )
    .then(
      res => {
        const ref = res.data;
        console.log('Latitude:'+ref.latitude.toString())
        console.log('Longitude:'+ref.longitude.toString())
        setLatitude(ref.latitude);
        setLongitude(ref.longitude);
      }
    );

  }

  const [locationID, setLocationID] = useState('');
  const handleLocationIDChange = (event) => {
    let myLocation = event.target.value;
    setLocationID(myLocation);
    locationCoordinates(myLocation);
    console.log('Getting devices in location '+myLocation)
    axios.get(
      constants.DEVICES_IN_LOCATION_URI+myLocation
    )
    .then(
      res=>{
        const ref = res.data;
        console.log(ref);
        let devicesArray = [];
        if (ref.length != 0){
          for (var i=0; i<ref.length; i++){
            devicesArray.push(ref[i].name);
        }
        setDevicesLabel(devicesArray.join(', ')+ ' found in '+ myLocation);
      }
        else{
          setDevicesLabel('No devices found in '+ myLocation);
        }

    }).catch(
      console.log
    )
  }
  const [height, setHeight] = useState('');
  const handleHeightChange = enteredHeight => {
    let re = /\s*|\d+(\.d+)?/
    if (re.test(enteredHeight.target.value)) {
      setHeight(enteredHeight.target.value);
    }
  }
  const [power, setPower] = useState('');
  const handlePowerChange = (event) => {
	  setPower(event.target.value);
  }

  const [installationType, setInstallationType] = useState('');
  const handleInstallationTypeChange = enteredInstallationType => {
	  setInstallationType(enteredInstallationType.target.value);
  }

  const [deploymentDate, setDeploymentDate] = useState(new Date());
  const handleDeploymentDateChange = (date) => {
    setDeploymentDate(date);
  };

  const [primaryChecked, setPrimaryChecked] = useState(true);
  const handlePrimaryChange = (event) => {
    setPrimaryChecked(false);
  }

  const [collocationChecked, setCollocationChecked] = useState(false);
  const handleCollocationChange = (event) => {
    setCollocationChecked(true);
  }

  //Edit parameters
  const [deviceID, setDeviceID] = useState('');

  //Register and Edit parameters
  const [sensorsOptions, setSensorsOptions] = useState([]);
  
  useEffect(() => {
    //code to retrieve all sensors' data
    //setIsLoading(true);
    axios.get(
      //'http://127.0.0.1:4001/api/v1/device/monitor/devices'
      constants.ALL_SENSORS_URI
    )
    .then(
      res=>{
        //setIsLoading(false);
        const ref = res.data;
        console.log(ref);
        //console.log(ref[0].sensorID)
        let sensorArray = [];
        for (var i=0; i<ref.length; i++){
          //pass
          sensorArray.push(ref[i]);
          //sensorArray.push(ref[i].name+ " ( "+ ref[i].quantityKind.join(', ')+ ")")
        }
        setSensorsOptions(sensorArray);

    }).catch(
      console.log
    )
  }, []);

  const [registerName, setRegisterName] = useState('');
  const handleRegisterNameChange = name => {
	  setRegisterName(name.target.value);
  }
  const [manufacturer, setManufacturer] = useState('');
  const handleManufacturerChange = manufacturer => {
	  setManufacturer(manufacturer.target.value);
  }
  const [productName, setProductName] = useState('');
  const handleProductNameChange = name => {
	  setProductName(name.target.value);
  }
  const [owner, setOwner] = useState('');
  const handleOwnerChange = name => {
	  setOwner(name.target.value);
  }
  const [description, setDescription] = useState('');
  const handleDescriptionChange = (event) => {
	  setDescription(event.target.value);
  }
  const [visibility, setVisibility] = useState('');
  const handleVisibilityChange = (event) => {
	  setVisibility(event.target.value);
  }
  const [ISP, setISP] = useState('');
  const handleISPChange = (event) => {
	  setISP(event.target.value);
  }

  const [latitude, setLatitude] = useState('0.332269');
  const handleLatitudeChange = lat => {
    let re = /\s*|\d+(\.d+)?/
    if (re.test(lat.target.value)) {
      setLatitude(lat.target.value);
    }
  }
  const [longitude, setLongitude] = useState('32.570077');
  const handleLongitudeChange = long => {
    let re = /\s*|\d+(\.d+)?/
    if (re.test(long.target.value)) {
      setLongitude(long.target.value);
    }
  }
  const [phone, setPhone] = useState(null);
  const handlePhoneChange = event => {
    let re = /\s*|\d+(\.d+)?/
    if (re.test(event.target.value)) {
      setPhone(event.target.value);
    }
  }
/*
  const [components, setComponents] = useState([]);
  const handleComponentsChange = (event) => {
	  setComponents(event.target.value);
  }*/
  
  /*
  const handleChangeMultiple = (event) => {
    const { options } = event.target;
    const value = [];
    for (let i = 0, l = options.length; i < l; i += 1) {
      if (options[i].selected) {
        value.push(options[i].value);
      }
    }
    //setPersonName(value);
    setComponents(value);
  };*/

  useEffect(() => {
    //code to retrieve all devices' data
    setIsLoading(true);
    axios.get(
      //'http://127.0.0.1:4001/api/v1/device/monitor/devices'
      //"http://127.0.0.1:3000/api/v1/devices"
      constants.ALL_DEVICES_URI
      //constants.ALL_LOCATIONS_URI
    )
    .then(
      res=>{
        setIsLoading(false);
        const ref = res.data;
        console.log('Devices loading')
        console.log(ref);
        setData(ref);

    }).catch(
      console.log
    )
  }, []);
/*
  let handleMaintenanceClick = (e) => {
    e.preventDefault();
    //setDeviceName(rowData.airqo_ref);
    handleMaintenanceOpen();
  }*/

  function appendLeadingZeroes(n) {
    if (n <= 9) {
      return '0' + n;
    }
    return n;
  }

  let formatDate = (date) => {
    //setDate(new Date());
    //setDate(new Date());
    //let newTime = new Date();
    let time = appendLeadingZeroes(date.getDate()) +
    '-' +
    appendLeadingZeroes(date.getMonth() + 1) +
    '-' +
    date.getFullYear()

    return time;
    //setDate(time);
   }
  
  let handleEditClick = (name, manufacturer,product, owner, description, visibility, ISP, lat, long, phone, channelID) => {
    return (event) => {
      console.log(name);
      setRegisterName(name);
      setManufacturer(manufacturer);
      setProductName(product);
      setOwner(owner);
      setDescription(description);
      setVisibility(visibility);
      setISP(ISP);
      setLatitude(lat);
      setLongitude(long);
      setPhone(phone);
      setDeviceID(channelID);
      handleEditOpen();

    }
  }

  let handleMaintenanceClick = (name) => {
    return (event) => {
      console.log(name);
      setDeviceName(name);
      handleMaintenanceOpen();
    }
  }

  let handleRecallClick = (name, location) => {
    return (event) => {
      console.log(name);
      setDeviceName(name);
      setLocationID(location);
      setRecallDate(new Date());
      handleRecallOpen();
    }
  }

  let handleDeployClick = (name) => {
    return (event) => {
      console.log('Deploying '+name);
      //console.log(name);
      setDeviceName(name);
      handleDeployOpen();
    }
  }

  let handleSensorClick = (id) => {
    return (event) => {
      console.log('Adding sensors to channel '+id);
      //console.log(name);
      setDeviceID(id);
      handleSensorOpen();
    }
  }

  
  let handleDeploySubmit = (e) => {
       
    let filter ={ 
      deviceName: deviceName,
      locationName: locationID,
      mountType: installationType,
      height: height,
      powerType: power,
      date: deploymentDate,
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      isPrimaryInLocation: primaryChecked,
      isUserForCollocaton: collocationChecked
      
    }
    console.log(JSON.stringify(filter));
    //console.log(constants.DEPLOY_DEVICE_URI+"deploy",);
    
    axios.post(
      //"http://127.0.0.1:3000/api/v1/devices/ts/deploy/device",
      //constants.DEPLOY_DEVICE_URI,
      constants.DEPLOY_DEVICE_URI+"deploy",
      JSON.stringify(filter),
      { headers: { 'Content-Type': 'application/json' } }
    )
    .then(
      res=>{
        console.log('Response returned')
        const myData = res.data;
        console.log(myData.message);
        setDialogResponseMessage(myData.message);
        //setDeployOpen(false);
        handleDeployClose();
        setResponseOpen(true);
        //setMaintenanceDescription('');
    }).catch(
      console.log
    )
  }
  
  let  handleMaintenanceSubmit = (e) => {
    //e.preventDefault();
    //setDialogLoading(true);

    let filter ={ 
      unit: deviceName,
      activity:  maintenanceDescription,
	    date: selectedDate.toString(),  
    }
    console.log(JSON.stringify(filter));
    
    axios.post(
      //"http://localhost:3000/api/v1/data/channels/maintenance/add",
      constants.ADD_MAINTENANCE_URI,
      JSON.stringify(filter),
      { headers: { 'Content-Type': 'application/json' } }
    )
    .then(
      res=>{
        const myData = res.data;
        console.log(myData.message);
        setDialogResponseMessage(myData.message);
        //setMaintenanceOpen(false);
        handleMaintenanceClose();
        setResponseOpen(true);
    }).catch(
      console.log
    )
  }

  let handleRecallSubmit = (e) => {
    let filter ={ 
      deviceName: deviceName,
      locationName: locationID,
      date: recallDate,
      
    }
    console.log(JSON.stringify(filter));
    console.log(constants.DEPLOY_DEVICE_URI+"recall",);
    
    axios.post(
      constants.DEPLOY_DEVICE_URI+"recall",
      JSON.stringify(filter),
      { headers: { 'Content-Type': 'application/json' } }
    )
    .then(
      res=>{
        console.log('Response returned')
        const myData = res.data;
        console.log(myData.message);
        setDialogResponseMessage(myData.message);
        handleRecallClose();
        //setRecallOpen(false);
        setResponseOpen(true);
    }).catch(
      console.log
    )

  }

  let handleRegisterSubmit = (e) => {
    console.log('Registering');
    let filter = {
      name: registerName,
      latitude: latitude,
      longitude: longitude,
      visibility: visibility,
      device_manufacturer: manufacturer,
      product_name:productName,
      owner: owner,
      ISP: ISP,
      phoneNumber: phone,
      description: description,
      //sensors: components
    }
    console.log(JSON.stringify(filter));
   
    axios.post(
      //"http://127.0.0.1:3000/api/v1/devices/ts",
      constants.REGISTER_DEVICE_URI,
      JSON.stringify(filter),
      { headers: { 'Content-Type': 'application/json' } },
    ) 
    .then(
      res=>{
        console.log('RESPONSE');
        const myData = res.data;
        console.log(myData.message);
        setDialogResponseMessage(myData.message);
        //setRegisterOpen(false);
        handleRegisterClose();
        setResponseOpen(true);
    }).catch(
      console.log
    )
  }

  let handleEditSubmit = (e) => {
    console.log('Updating');
    let filter = {
      name: registerName,
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      visibility: visibility,
      device_manufacturer: manufacturer,
      product_name:productName,
      owner: owner,
      ISP: ISP,
      phoneNumber: phone,
      description: description,
      //sensors:components
    }
    console.log(JSON.stringify(filter));
    axios.put(
      //"http://127.0.0.1:3000/api/v1/devices/ts/update?device=",
      constants.EDIT_DEVICE_URI+deviceID.toString(),
      JSON.stringify(filter),
      { headers: { 'Content-Type': 'application/json' } }
    )
    .then(
      res=>{
        const myData = res.data;
        console.log(myData.message);
        setDialogResponseMessage(myData.message);
        //setEditOpen(false);
        handleEditClose();
        setResponseOpen(true);

        
    }).catch(
      console.log
    )
  }

  let handleSensorSubmit = (e) => {
    console.log('Adding sensor ...');
    let filter = {
      device: deviceID,
      sensorID: sensorID,
      quantityKind: quantityKind,
      measurementUnit: measurementUnit
    }
    console.log(JSON.stringify(filter));
    /*
    axios.post(
      "http://localhost:3000/api/v1/data/channels/maintenance/add"
      //constants.ADD_MAINTENANCE_URI,
      JSON.stringify(filter),
      { headers: { 'Content-Type': 'application/json' } }
    )
    .then(
      res=>{
        setIsLoading(false);
        const myData = res.data;
        console.log(myData);
        console.log(myData.message);
        setDialogMessage(myData.message);
        setDialogStatus(true);
    }).catch(
      console.log
    )*/

  }


  return (
    <div className={classes.root}>
      <br/>
    
      {/*<div alignContent ="right">*/}
      <Grid container alignItems="right" alignContent="right" justify="center">
    {/*<Link >*/}
     <Button 
          variant="contained" 
          color="primary"              
          type="submit"
          align = "right"
          onClick={handleRegisterOpen}
        > Add Device
        </Button>
    {/* </Link> */}
     </Grid>
     {/*</div> */} 
      <br/>

    <LoadingOverlay
      active={isLoading}
      spinner
      text='Loading Devices...'
    >
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      <CardContent className={classes.content}>
        <PerfectScrollbar>
          <MaterialTable
            className = {classes.table}
            title="Device Registry"
            columns={[
             { title: 'Device Name', field: 'name', cellStyle:{ fontFamily: 'Open Sans'} },
             { title: 'Description', field: 'description', cellStyle:{ fontFamily: 'Open Sans'} },
             { title: 'Device ID', field: 'channelID', cellStyle:{ fontFamily: 'Open Sans'} }, //should be channel ID
             { title: 'Registration Date', 
               field: 'createdAt', 
               cellStyle:{ fontFamily: 'Open Sans'},
               render: rowData => formatDate(new Date(rowData.createdAt))
             },
             { title: 'Location ID', 
               //field: 'location_id', 
               field: 'locationID',
               cellStyle:{ fontFamily: 'Open Sans'},
               render: rowData => <Link className={classes.link} to={`/locations/${rowData.locationID}`}>{rowData.locationID}</Link>
             },
             
             
            // { title: 'Location ID', field: 'location_id', cellStyle:{ fontFamily: 'Open Sans'} },
             { title: 'Actions',
               //field: '', 
               cellStyle: {fontFamily: 'Open Sans'},
               //render: rowData => <Link className={classes.link} onClick={handleMaintenanceClick(rowData.airqo_ref)}> Update Maintenance log </Link>,
               render: rowData => <div>
                                    <Tooltip title="Edit a device">
                                      
                                      <Link 
                                        className={classes.link} 
                                        onClick = {handleEditClick(rowData.name, rowData.device_manufacturer, rowData.product_name, 
                                          rowData.owner, rowData.description, rowData.visibility, rowData.ISP, rowData.latitude,
                                          rowData.longitude, rowData.phoneNumber, rowData.channelID)}
                                        //style={{color: 'black'}} 
                                        //activeStyle={{color: 'red'}}
                                      > 
                                        <EditOutlined></EditOutlined>
                                      </Link> 
                                    </Tooltip>
                                    &nbsp;&nbsp;&nbsp;

                                    <Tooltip title="Update Maintenance Log">
                                      
                                      <Link 
                                        className={classes.link} 
                                        onClick = {handleMaintenanceClick(rowData.name)}
                                        //style={{color: 'black'}} 
                                        //activeStyle={{color: 'red'}}
                                      > 
                                        <Update></Update>
                                      </Link> 
                                    </Tooltip>
                                    &nbsp;&nbsp;&nbsp;

                                    <Tooltip title="Deploy Device">
                                      <Link 
                                        className={classes.link} 
                                        onClick = {handleDeployClick(rowData.name)}
                                      > 
                                      <CloudUploadOutlined></CloudUploadOutlined>
                                        {/*Deploy
                                    
                                        <Icon>
                                          <img  src="../../../../assets/img/icons/deploy.svg"/>
                                        </Icon>
                                          */}
                                      </Link>
                                    </Tooltip>
                                    &nbsp;&nbsp;&nbsp;

                                    <Tooltip title="Recall Device">
                                      <Link 
                                        className={classes.link} 
                                        onClick = {handleRecallClick(rowData.name, rowData.locationID)}
                                      > 
                                        <UndoOutlined></UndoOutlined>
                                      </Link>
                                    </Tooltip>

                                    &nbsp;&nbsp;&nbsp;

                                    <Tooltip title="Add Component">
                                      <Link 
                                        className={classes.link} 
                                        onClick = {handleSensorClick(rowData.channelID)}
                                      > 
                                        <AddOutlined></AddOutlined>
                                      </Link>
                                    </Tooltip>
                                    {/*
                                    <Link 
                                      className={classes.link} 
                                      onClick = {handleDeployClick(rowData.airqo_ref)}
                                    > 
                                    Deploy 
                                        </Link>*/}
                                    </div>
            },
      ]}   
      data = {data}  
      options={{
        search: true,
        exportButton: true,
        searchFieldAlignment: 'left',
        showTitle: false,
        searchFieldStyle: {
          fontFamily: 'Open Sans',
          border: '2px solid #7575FF',
        },
        headerStyle: {
          fontFamily: 'Open Sans',
          fontSize: 16,
          fontWeight: 600
        },
        pageSizeOptions : [10, 25, 50, data.length],
        pageSize: 10
      }}
    />
        </PerfectScrollbar> 
      </CardContent> 
      </Card>

    </LoadingOverlay>

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

    {maintenanceOpen? (
       
       <Dialog
           open={maintenanceOpen}
           onClose={handleMaintenanceClose}
           aria-labelledby="form-dialog-title"
           aria-describedby="form-dialog-description"
         >
           <DialogTitle id="form-dialog-title">Update Maintenance Log</DialogTitle>

           
           <DialogContent>
                <div>
                 <TextField 
                   id="deviceName" 
                   label="Device Name"
                   value = {deviceName}
                   /> <br/>
                   
                 <TextField 
                   id="standard-basic" 
                   label="Description" 
                   value = {maintenanceDescription}
                   onChange = {handleMaintenanceDescriptionChange}
                   /><br/>
              {/*}
                <TextareaAutosize
                  id = "maintenanceDescription"
                  label = "Description"
                  value = {maintenanceDescription}
                  onChange = {handleMaintenanceDescriptionChange}
                  rowsMin={3}
                  //placeholder="Maximum 4 rows"
                  />*/}

                 <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    disableToolbar
                    variant="inline"
                    //format="MM/dd/yyyy"
                    format = "yyyy-MM-dd"
                    margin="normal"
                    id="maintenanceDate"
                    label="Date of Maintenance"
                    value={selectedDate}
                    onChange={handleDateChange}
                    KeyboardButtonProps={{
                    'aria-label': 'change date',
                   }}
                   />
                 </MuiPickersUtilsProvider>
                 </div>
                 
                  </DialogContent> 
          
                 <DialogActions>
                 <Grid container alignItems="center" alignContent="center" justify="center">
                 <Button 
                  variant="contained" 
                  color="primary"              
                  onClick={handleMaintenanceSubmit}
                 > Update
                </Button>
               &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
               <Button 
                variant="contained" 
                color="primary"              
                //type="button"
                onClick = {handleMaintenanceClose}
               > Cancel
               </Button>
               </Grid>
           </DialogActions>
         </Dialog>
         ) : null}

  {deployOpen? (
       
       <Dialog
           open={deployOpen}
           onClose={handleDeployClose}
           aria-labelledby="form-dialog-title"
           aria-describedby="form-dialog-description"
         >
           <DialogTitle id="form-dialog-title" style={{alignContent:'center'}}>Deploy a device</DialogTitle>
           
           <DialogContent>
             <Grid container spacing={1}>
               <Grid container item xs={12} spacing={3}>
                 <Grid item xs={6}>
                   <TextField 
                     id="standard-basic" 
                     label="Device Name"
                     value = {deviceName}
                     required
                   /> 
                 </Grid>
                {/* {devicesLoading?(*/}
                 <Grid item xs={6}>
                    <TextField 
                      id="standard-basic" 
                      label="height" 
                      value = {height}
                      onChange = {handleHeightChange}
                    />
                 </Grid> {/*): null }*/}
                </Grid>
                <Grid container item xs={12} spacing={3}>
                 <Grid item xs={6}>
                   <FormControl required className={classes.formControl}>
                     <InputLabel htmlFor="demo-dialog-native">Location ID</InputLabel>
                     <Select
                       native
                       required
                       value={locationID}
                       onChange={handleLocationIDChange}
                       input={<Input id="demo-dialog-native" />}
                       required
                     > 
                       <option aria-label="None" value="" />
                       {locationsOptions.map( (loc_id) =>
                       <option value={loc_id}>{loc_id}</option>)}
                     </Select>
                   </FormControl>
                       <h6 style = {{fontSize:14}}>{devicesLabel}</h6>
                  </Grid>
                  {/*{devicesLoading?(*/}
                    
                  <Grid item xs={6}>
                    <FormControl className={classes.formControl}>
                      <InputLabel htmlFor="demo-dialog-native">Power Type</InputLabel>
                      <Select
                        native
                        value={power}
                        onChange={handlePowerChange}
                        input={<Input id="demo-dialog-native" />}
                      >
                        <option aria-label="None" value="" />
                        <option value="Mains">Mains</option>
                        <option value="Solar">Solar</option>
                        <option value="Battery">Battery</option>
                      </Select>
                    </FormControl>
                   </Grid> {/*}): null }*/}
                  </Grid>
                  {/*{devicesLoading?(*/}
                    <div>
                  <Grid container item xs={12} spacing={3}>
                    <Grid item xs={6}>
                      <TextField 
                        id="standard-basic" 
                        label="Installation Type" 
                        value = {installationType}
                        onChange = {handleInstallationTypeChange}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                          <KeyboardDatePicker
                            disableToolbar
                            //variant="inline"
                            //format="MM/dd/yyyy"
                            format = "yyyy-MM-dd"
                            //margin="normal"
                            id="deploymentDate"
                            label="Date of Deployment"
                            value={deploymentDate}
                            onChange={handleDeploymentDateChange}
                            required
                            
                            KeyboardButtonProps={{
                               'aria-label': 'change date',
                            }}
                          />
                        </MuiPickersUtilsProvider>

                      </Grid>
                    </Grid>
                    <Grid container item xs={12} spacing={3}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={primaryChecked}
                            onChange={handlePrimaryChange}
                            name="primaryDevice"
                            color="primary"
                          />
                        } 
                        label="I wish to make this my primary device in this location"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={collocationChecked}
                            onChange={handleCollocationChange}
                            name="collocation"
                            color="primary"
                          />
                        } 
                      label="This deployment is a formal collocation"
                      />
                    </Grid> </div> {/*}): null }*/}
                  </Grid>
                </DialogContent> 
          
                {/*{devicesLoading?(*/}
                <DialogActions>
                <Grid container alignItems="center" alignContent="center" justify="center">
                 <Button 
                  variant="contained" 
                  color="primary"              
                  onClick={handleDeploySubmit}
                 > Deploy
                </Button>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
               <Button 
                variant="contained" 
                color="primary"              
                //type="button"
                onClick = {handleDeployClose}
               > Cancel
               </Button>
               </Grid>
           </DialogActions> {/*}): null }*/}
         </Dialog>
         ) : null}
        {recallOpen? (
       
       <Dialog
           open={recallOpen}
           onClose={handleRecallClose}
           aria-labelledby="form-dialog-title"
           aria-describedby="form-dialog-description"
         >
           <DialogTitle id="form-dialog-title" style={{alignContent:'center'}}>Recall a device</DialogTitle>
           
                <DialogContent>
                  Are you sure you want to recall device {deviceName} from location {locationID}?
                </DialogContent> 
          
          
                <DialogActions>
                <Grid container alignItems="center" alignContent="center" justify="center">
                 <Button 
                  variant="contained" 
                  color="primary"              
                  //onClick={handleRecallSubmit}
                  onClick = {handleRecallSubmit}
                 > YES
                </Button>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
               <Button 
                variant="contained" 
                color="primary"              
                //type="button"
                onClick = {handleRecallClose}
               > NO
               </Button>
               </Grid>
           </DialogActions>
         </Dialog>
         ) : null}

     {registerOpen? (
       
       <Dialog
           open={registerOpen}
           onClose={handleRegisterClose}
           aria-labelledby="form-dialog-title"
           aria-describedby="form-dialog-description"
         >
           <DialogTitle id="form-dialog-title">Add a device</DialogTitle>

           <DialogContent>
              {/*<div>*/}
              <form className={classes.formControl}> {/*onSubmit={handleRegisterSubmit}*/}
                {/*<Grid container>
                 <Grid container item>*/}
                 <TextField 
                   required
                   id="deviceName" 
                   value = {registerName}
                   onChange = {handleRegisterNameChange}
                   label="Device Name"
                   fullWidth = {true}                 
                   /><br/>
                 <TextField 
                   id="standard-basic" 
                   label="Description" 
                   value = {description}
                   onChange = {handleDescriptionChange}
                   fullWidth = {true}
                   required
                   /><br/>
                  <TextField 
                   id="standard-basic" 
                   label="Manufacturer" 
                   value = {manufacturer}
                   onChange = {handleManufacturerChange}
                   fullWidth = {true}
                  // required
                   /><br/>
                   <TextField 
                   id="standard-basic" 
                   label="Product Name" 
                   value = {productName}
                   onChange = {handleProductNameChange}
                   fullWidth = {true}
                   //required
                   /><br/>
                   <TextField 
                   id="standard-basic" 
                   label="Latitude" 
                   value = {latitude}
                   onChange = {handleLatitudeChange}
                   fullWidth = {true}
                   required
                   /><br/>
                   <TextField 
                   id="standard-basic" 
                   label="Longitude" 
                   value = {longitude}
                   onChange = {handleLongitudeChange}
                   fullWidth = {true}
                   required
                   /><br/>
                   <FormControl required  fullWidth={true}>
                      <InputLabel htmlFor="demo-dialog-native"> Visibility</InputLabel>
                      <Select
                        required
                        native
                        value={visibility}
                        onChange={handleVisibilityChange}
                        input={<Input id="demo-dialog-native" />}
                      >
                        <option aria-label="None" value="" />
                        <option value="Public">Public</option>
                        <option value="Private">Private</option>
                      </Select>
                   </FormControl>
                   <TextField 
                   required
                   id="standard-basic" 
                   label="Owner" 
                   value = {owner}
                   onChange = {handleOwnerChange}
                   fullWidth = {true}
                   /><br/>
                   <FormControl fullWidth={true}>
                      <InputLabel htmlFor="demo-dialog-native"> Internet Service Provider</InputLabel>
                      <Select
                        native
                        value={ISP}
                        onChange={handleISPChange}
                        input={<Input id="demo-dialog-native" />}
                      >
                        <option aria-label="None" value="" />
                        <option value="MTN">MTN</option>
                        <option value="Africell">Africell</option>
                        <option value="Airtel">Airtel</option>
                      </Select>
                   </FormControl>
                   <TextField 
                   id="standard-basic" 
                   label="Phone Number" 
                   value = {phone}
                   onChange = {handlePhoneChange}
                   fullWidth = {true}
                   /><br/>
                   {/*
                   <FormControl fullWidth={true}>
                     <InputLabel htmlFor="demo-dialog-native"Device >Components</InputLabel>
                     <Select
                       multiple
                       value={components}
                       onChange={handleComponentsChange}
                       //onChange = {handleChangeMultiple}
                       input={<Input id="demo-dialog-native" />}
                       MenuProps={MenuProps}
                     >
                       <option aria-label="None" value="" />
                       {sensorsOptions.map( (sensor) =>
                       <option value={sensor.sensorID}>{sensor.name+ " ( "+ sensor.quantityKind.join(', ')+ ")"}</option>)}
                     </Select>
                   </FormControl><br/> <br/>*/}
                   {/*</Grid>
                   </Grid> <br/>*/}
                   </form>
                   </DialogContent>

                   <DialogActions>
                  
                <Grid container alignItems="center" alignContent="center" justify="center">
                 <Button 
                  variant="contained" 
                  color="primary"  
                  type ="submit"            
                  onClick={handleRegisterSubmit}
                 > Register
                </Button>
               &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
               <Button 
                variant="contained" 
                color="primary"              
                type="button"
                onClick = {handleRegisterClose}
               > Cancel
               </Button>
               </Grid> <br/>
              </DialogActions>
              {/*</form>*/}
                 
                 {/*</div>
                 
                  </DialogContent> *?}
                  
              {/*}
                 <DialogActions>
                 <Grid container alignItems="center" alignContent="center" justify="center">
                 <Button 
                  variant="contained" 
                  color="primary"              
                  onClick={handleRegisterSubmit}
                 > Register
                </Button>
               &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
               <Button 
                variant="contained" 
                color="primary"              
                //type="button"
                onClick = {handleRegisterClose}
               > Cancel
               </Button>
               </Grid>
                       </DialogActions> */}
         </Dialog>
         ) : null}

     {editOpen? (
       
       <Dialog
           open={editOpen}
           onClose={handleEditClose}
           aria-labelledby="form-dialog-title"
           aria-describedby="form-dialog-description"
         >
           <DialogTitle id="form-dialog-title">Edit a device</DialogTitle>

           <DialogContent>
                <form  className={classes.formControl}> 
                {/*<Grid container>
                 <Grid container item>*/}
                 <TextField 
                   required
                   id="standard-basic" 
                   label="Device Name"
                   value = {registerName}
                   fullWidth = {true}
                   onChange = {handleRegisterNameChange} 
                   InputProps={{
                    readOnly:true
                }}
                   /> <br/>
                 <TextField 
                   id="standard-basic" 
                   label="Description" 
                   value = {description}
                   onChange = {handleDescriptionChange}
                   fullWidth = {true}
                   required
                   /><br/>
                  <TextField 
                   id="standard-basic" 
                   label="Manufacturer" 
                   value = {manufacturer}
                   onChange = {handleManufacturerChange}
                   fullWidth = {true}
                   /><br/>
                   <TextField 
                   id="standard-basic" 
                   label="Product Name" 
                   value = {productName}
                   onChange = {handleProductNameChange}
                   fullWidth = {true}
                   /><br/>
                   <TextField 
                   id="standard-basic" 
                   label="Latitude" 
                   value = {latitude}
                   onChange = {handleLatitudeChange}
                   fullWidth = {true}
                   required
                   /><br/>
                   <TextField 
                   id="standard-basic" 
                   label="Longitude" 
                   value = {longitude}
                   onChange = {handleLongitudeChange}
                   fullWidth = {true}
                   required
                   /><br/>
                   <FormControl required className={classes.formControl} fullWidth={true}>
                      <InputLabel htmlFor="demo-dialog-native"> Visibility</InputLabel>
                      <Select
                        native
                        value={visibility}
                        onChange={handleVisibilityChange}
                        input={<Input id="demo-dialog-native" />}
                      >
                        <option aria-label="None" value="" />
                        <option value="Public">Public</option>
                        <option value="Private">Private</option>
                      </Select>
                   </FormControl>
                   <TextField 
                   id="standard-basic" 
                   label="Owner" 
                   value = {owner}
                   onChange = {handleOwnerChange}
                   fullWidth = {true}
                   required
                   /><br/>
                   <FormControl className={classes.formControl} fullWidth={true}>
                      <InputLabel htmlFor="demo-dialog-native"> Internet Service Provider</InputLabel>
                      <Select
                        native
                        value={ISP}
                        onChange={handleISPChange}
                        input={<Input id="demo-dialog-native" />}
                      >
                        <option aria-label="None" value="" />
                        <option value="MTN">MTN</option>
                        <option value="Africell">Africell</option>
                        <option value="Airtel">Airtel</option>
                      </Select>
                   </FormControl>
                   <TextField 
                   id="standard-basic" 
                   label="Phone Number" 
                   value = {phone}
                   onChange = {handlePhoneChange}
                   fullWidth = {true}
                   /><br/>
                   {/*
                   <FormControl className={classes.formControl} fullWidth={true}>
                     <InputLabel htmlFor="demo-dialog-native"Device >Components</InputLabel>
                     <Select
                       multiple
                       value={components}
                       onChange={handleComponentsChange}
                       //onChange = {handleChangeMultiple}
                       input={<Input id="demo-dialog-native" />}
                       MenuProps={MenuProps}
                     >
                       <option aria-label="None" value="" />
                       {sensorsOptions.map( (sensor) =>
                       <option value={sensor.sensorID}>{sensor.name+ " ( "+ sensor.quantityKind.join(', ')+ ")"}</option>)}
                     </Select>
                       </FormControl><br/> <br/>*/}
                   </form>
                  {/*} </Grid>
                   </Grid> <br/>*/}

                 
                 {/*</div>*/}
                 
                  </DialogContent> 
          
                 <DialogActions>
                 <Grid container alignItems="center" alignContent="center" justify="center">
                 <Button 
                  variant="contained" 
                  type = "submit"
                  color="primary"              
                  onClick={handleEditSubmit}
                 > Update
                </Button>
               &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
               <Button 
                variant="contained" 
                color="primary"              
                type="button"
                onClick = {handleEditClose}
               > Cancel
               </Button>
               </Grid> <br/>
          </DialogActions>
         </Dialog>
         ) : null}

     {sensorOpen? (
       
       <Dialog
           open={sensorOpen}
           onClose={handleSensorClose}
           aria-labelledby="form-dialog-title"
           aria-describedby="form-dialog-description"
         >
           <DialogTitle id="form-dialog-title" style={{alignContent:'center'}}>Add a component</DialogTitle>
           <DialogContent>
                <div>
                  {/*
                 <TextField 
                   fullWidth={true}
                   id="deviceName" 
                   label="Device Name"
                   value = {deviceName}
                   /> <br/>*/}
                 <TextField 
                   //fullWidth={true}
                   id="sensorID" 
                   label="Component ID"
                   value = {sensorID}
                   fullWidth={true}
                   /> <br/>

                 <FormControl required  fullWidth={true}>
                  <InputLabel htmlFor="demo-dialog-native"> Component Name</InputLabel>
                   <Select
                    native
                    value={sensorName}
                    onChange={handleSensorNameChange}
                    input={<Input id="demo-dialog-native" />}
                   >
                        <option aria-label="None" value="" />
                        <option value="Alphasense OPC-N2">Alphasense OPC-N2</option>
                        <option value="pms5003">pms5003</option>
                        <option value="DHT11">DHT11</option>
                        <option value="Lithium Ion 18650">Lithium Ion 18650</option>
                        <option value="Generic">Generic</option>
                        <option value="Purple Air II">Purple Air II</option>
                        <option value="Bosch BME280">Bosch BME280</option>
                      </Select>
                   </FormControl><br/>

                  <FormControl required fullWidth={true}>
                  <InputLabel htmlFor="demo-dialog-native"> Quantity Measured</InputLabel>
                   <Select
                    native
                    value={quantityKind}
                    onChange={handleQuantityKindChange}
                    input={<Input id="demo-dialog-native" />}
                   >
                        <option aria-label="None" value="" />
                        <option value="pm1">PM 1</option>
                        <option value="pm2.5">PM 2.5</option>
                        <option value="pm10">PM 10</option>
                        <option value="ext_temp">External Temperature</option>
                        <option value="ext_rh">External Humidity</option>
                        <option value="int_temp">Internal Temperature</option>
                        <option value="int_rh">Internal Humidity</option>
                        <option value="battery">Battery Voltage</option>
                        <option value="gps">GPS</option>
                      </Select>
                   </FormControl><br/>

                   <FormControl required fullWidth={true}>
                    <InputLabel htmlFor="demo-dialog-native"> Unit of Measure</InputLabel>
                    <Select
                    native
                    value={measurementUnit}
                    onChange={handleMeasurementUnitChange}
                    input={<Input id="demo-dialog-native" />}
                    >
                        <option aria-label="None" value="" />
                        <option value="µg/m3">µg/m3</option>
                        <option value="%">%</option>
                        <option value="&#8451;">&#8451;</option>
                        <option style = {{fontFamily: 'Calibri'}} value="&#8457;">&#8457;</option>
                        <option value="V">V</option>
                        <option value="coords">GPS Coordinates</option>
                      </Select>
                   </FormControl><br/>
                 
                 {/*
                   
                 <TextField 
                   id="standard-basic" 
                   label="Description" 
                   value = {maintenanceDescription}
                   onChange = {handleMaintenanceDescriptionChange}
                   /><br/>
              
                 <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    disableToolbar
                    variant="inline"
                    //format="MM/dd/yyyy"
                    format = "yyyy-MM-dd"
                    margin="normal"
                    id="maintenanceDate"
                    label="Date of Maintenance"
                    value={selectedDate}
                    onChange={handleDateChange}
                    KeyboardButtonProps={{
                    'aria-label': 'change date',
                   }}
                   />
                 </MuiPickersUtilsProvider>*/}
                 </div>
                 
                  </DialogContent> 
          
                 <DialogActions>
                 <Grid container alignItems="center" alignContent="center" justify="center">
                 <Button 
                  variant="contained" 
                  color="primary"              
                  onClick={handleSensorSubmit}
                 > Add
                </Button>
               &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
               <Button 
                variant="contained" 
                color="primary"              
                //type="button"
                onClick = {handleSensorClose}
               > Cancel
               </Button>
               </Grid>
           </DialogActions>
              {/*}
                <DialogContent>
                  Are you sure you want to delete device {deviceName}?
                </DialogContent> 
          
          
                <DialogActions>
                <Grid container alignItems="center" alignContent="center" justify="center">
                 <Button 
                  variant="contained" 
                  color="primary"              
                  onClick={handleSensorSubmit}
                 > YES
                </Button>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
               <Button 
                variant="contained" 
                color="primary"              
                //type="button"
                onClick = {handleSensorClose}
               > NO
               </Button>
               </Grid>
     </DialogActions>*/}
         </Dialog>
         ) : null}
    </div>
    
  );
};

DevicesTable.propTypes = {
  className: PropTypes.string,
  users: PropTypes.array.isRequired
};

export default DevicesTable;


/*
export default function DeviceRegistry() {
  const [state, setState] = React.useState({
    columns: [
      { title: "Name", field: "name" },
      { title: "Location", field: "location" },
      {
        title: "Mount Type",
        field: "mountType",
        lookup: { 34: "wall", 63: "pole", 85: "motor bike" },
      },
      {
        title: "mobile",
        field: "mobile",
        lookup: { 35: "true", 64: "false" },
      },
      {
        title: "visibility",
        field: "visibility",
        lookup: { 36: "public", 68: "private" },
      },
      { title: "Distance to Road", field: "distanceToRoad" },
      { title: "Height", field: "height" },
      { title: "description", field: "description" },
    ],
    data: [
      {
        name: "Bwaise-2020-01-15T13:16:43.218Z",
        location: "Bwaise",
        distanceToRoad: 1987,
        mountType: "pole",
        mobile: true,
        visibility: "public",
        height: 23,
        description: "Bwaise second installation",
      },
      {
        name: "Katwe-2020-01-15T13:28:57.113Z",
        location: "Bwaise",
        distanceToRoad: 1987,
        mountType: "pole",
        mobile: true,
        visibility: "public",
        height: 23,
        description: "Katwe third installation",
      },
    ],
  });

  return (
    <MaterialTable
      title="Device Registry"
      columns={state.columns}
      data={state.data}
      editable={{
        onRowAdd: (newData) =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve();
              setState((prevState) => {
                const data = [...prevState.data];
                data.push(newData);
                return { ...prevState, data };
              });
            }, 600);
          }),
        onRowUpdate: (newData, oldData) =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve();
              if (oldData) {
                setState((prevState) => {
                  const data = [...prevState.data];
                  data[data.indexOf(oldData)] = newData;
                  return { ...prevState, data };
                });
              }
            }, 600);
          }),
        onRowDelete: (oldData) =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve();
              setState((prevState) => {
                const data = [...prevState.data];
                data.splice(data.indexOf(oldData), 1);
                return { ...prevState, data };
              });
            }, 600);
          }),
      }}
      options={{
        actionsColumnIndex: -1,
      }}
    />
  );
}
*/
