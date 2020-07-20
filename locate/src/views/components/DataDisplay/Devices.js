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
import { Update, DeleteOutlined, EditOutlined, CloudUploadOutlined, UndoOutlined } from '@material-ui/icons';
import Tooltip from '@material-ui/core/Tooltip';
//import Select from 'react-select';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import DeleteDialog from './Dialogs/DeleteDialog.js'

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
}
}));


const DevicesTable = props => {
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
  };

  const [editOpen, setEditOpen] = useState(false);
  const handleEditOpen = () => {
    setEditOpen(true);
  };
  const handleEditClose = () => {
    setEditOpen(false);
  };

  const [maintenanceOpen, setMaintenanceOpen]= useState(false);
  const handleMaintenanceOpen = () => {
    setMaintenanceOpen(true);
  };
  const handleMaintenanceClose = () => {
    setMaintenanceOpen(false);
  };

  const [deployOpen, setDeployOpen]= useState(false);
  const handleDeployOpen = () => {
    setDeployOpen(true);
  };
  const handleDeployClose = () => {
    setDeployOpen(false);
  };

  const [recallOpen, setRecallOpen] = useState(false);
  const handleRecallOpen = () => {
    setRecallOpen(true);
  };
  const handleRecallClose = () => {
    setRecallOpen(false);
  }

  const [deleteOpen, setDeleteOpen] = useState(false);
  const handleDeleteOpen = () => {
    setDeleteOpen(true);
  };
  const handleDeleteClose = () => {
    setDeleteOpen(false);
  }

  const [responseOpen, setResponseOpen] = useState(false);
  const handleResponseOpen = () => {
    setResponseOpen(true);
  };
  const handleResponseClose = () => {
    setResponseOpen(false);
  }


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
  
  //deployment parameters
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

  const [locationID, setLocationID] = useState('');
  const handleLocationIDChange = (event) => {
    setLocationID(event.target.value);
  }
  const [height, setHeight] = useState(null);
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

  const [deploymentDate, setDeploymentDate] = useState(null);
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

  //Delete parameters
  const [deviceID, setDeviceID] = useState('');

  //Register parameters
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

  const [latitude, setLatitude] = useState(null);
  const handleLatitudeChange = lat => {
    let re = /\s*|\d+(\.d+)?/
    if (re.test(lat.target.value)) {
      setLatitude(lat.target.value);
    }
  }
  const [longitude, setLongitude] = useState(null);
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
  
  let handleEditClick = (name, manufacturer,product, owner, description, visibility, ISP, lat, long, phone) => {
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

  let handleDeleteClick = (id) => {
    return (event) => {
      //setDeviceName(name);
      setDeviceID(id);
      handleDeleteOpen();
    }
  }

  
  let handleDeploySubmit = (e) => {
    //e.preventDefault();
    //setLoading(true);
    //setIsLoading(true);
   
    let filter ={ 
      deviceName: deviceName,
      locationName: locationID,
      mountType: installationType,
      height: height,
      powerType: power,
      date: deploymentDate.toString(),
      isPrimaryInLocation: primaryChecked,
      isUserForCollocaton: collocationChecked,
      //unit: deviceName,
      //activity:  maintenanceDescription,
	    //date: selectedDate.toString(),
      
    }
    console.log(JSON.stringify(filter));
    axios.post(
      //"http://127.0.0.1:3000/api/v1/devices/ts/deploy/device",
      constants.DEPLOY_DEVICE_URI,
      JSON.stringify(filter),
      { headers: { 'Content-Type': 'application/json' } }
    )
    .then(
      res=>{
        const myData = res.data;
        console.log(myData.message);
        setDialogResponseMessage(myData.message);
        setDeployOpen(false);
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
        setMaintenanceOpen(false);
        setResponseOpen(true);
        setMaintenanceDescription('');
    }).catch(
      console.log
    )
  }

  let handleRecallSubmit = (e) => {
    let filter ={ 
      unit: deviceName,
	    location: locationID,
      
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
      description: description
    }
    console.log(JSON.stringify(filter));
    axios.post(
      //"http://127.0.0.1:3000/api/v1/devices/ts",
      constants.REGISTER_DEVICE_URI,
      JSON.stringify(filter),
      { headers: { 'Content-Type': 'application/json' } }
    )
    .then(
      res=>{
        const myData = res.data;
        console.log(myData.message);
        setDialogResponseMessage(myData.message);
        setRegisterOpen(false);
        setResponseOpen(true);

        setRegisterName('');
        setLatitude('');
        setLongitude('');
        setVisibility('');
        setManufacturer('');
        setProductName('');
        setOwner('');
        setISP('');
        setPhone('');
        setDescription('');
        //setMaintenanceDescription('');
    }).catch(
      console.log
    )
  }

  let handleEditSubmit = (e) => {
    console.log('Updating');
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
      description: description
    }
    console.log(JSON.stringify(filter));
    /*
    axios.post(
      //"http://127.0.0.1:3000/api/v1/devices/ts/update?device=",
      constants.EDIT_DEVICE_URI+channelID,
      JSON.stringify(filter),
      { headers: { 'Content-Type': 'application/json' } }
    )
    .then(
      res=>{
        const myData = res.data;
        console.log(myData.message);
        setDialogResponseMessage(myData.message);
        setEditOpen(false);
        setResponseOpen(true);

        setRegisterName('');
        setLatitude('');
        setLongitude('');
        setVisibility('');
        setManufacturer('');
        setProductName('');
        setOwner('');
        setISP('');
        setPhone('');
        setDescription('');
    }).catch(
      console.log
    )*/
  }

  let handleDeleteSubmit = (e) => {
    console.log('Deleting ...');
    let filter = {
      device: deviceID
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
               field: 'location_id', 
               cellStyle:{ fontFamily: 'Open Sans'},
               render: rowData => <Link className={classes.link} to={`/locations/${rowData.location_id}`}>{rowData.location_id}</Link>
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
                                          rowData.longitude, rowData.phoneNumber)}
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

                                    <Tooltip title="Delete Device">
                                      <Link 
                                        className={classes.link} 
                                        onClick = {handleDeleteClick(rowData.channelID)}
                                      > 
                                        <DeleteOutlined></DeleteOutlined>
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
                   id="standard-basic" 
                   label="Device Name"
                   value = {deviceName}
                   /> <br/>
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
                   <FormControl className={classes.formControl}>
                     <InputLabel htmlFor="demo-dialog-native">Location ID</InputLabel>
                     <Select
                       native
                       required
                       value={locationID}
                       onChange={handleLocationIDChange}
                       input={<Input id="demo-dialog-native" />}
                       required
                     >
                       {locationsOptions.map( (loc_id) =>
                       <option value={loc_id}>{loc_id}</option>)}
                     </Select>
                   </FormControl>
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
                            /*
                            KeyboardButtonProps={{
                               'aria-label': 'change date',
                            }}*/
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
                  onClick = {handleRecallClose}
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
                <div>
                 <TextField 
                   id="standard-basic" 
                   label="Device Name"
                   value = {registerName}
                   fullWidth = {true}
                   onChange = {handleRegisterNameChange}
                   required
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
                   required
                   /><br/>
                   <TextField 
                   id="standard-basic" 
                   label="Product Name" 
                   value = {productName}
                   onChange = {handleProductNameChange}
                   fullWidth = {true}
                   required
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
                   <FormControl className={classes.formControl} fullWidth={true}>
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
                 
                 </div>
                 
                  </DialogContent> 
          
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
           </DialogActions>
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
                <div>
                 <TextField 
                   id="standard-basic" 
                   label="Device Name"
                   value = {registerName}
                   fullWidth = {true}
                   onChange = {handleRegisterNameChange}
                   required
                   InputProps={{
                    classes: {
                      notchedOutline: classes.notchedOutline,
                      focused: classes.focused
                    },
                    className: classes.input,
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
                   required
                   /><br/>
                   <TextField 
                   id="standard-basic" 
                   label="Product Name" 
                   value = {productName}
                   onChange = {handleProductNameChange}
                   fullWidth = {true}
                   required
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
                   <FormControl className={classes.formControl} fullWidth={true}>
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
                 
                 </div>
                 
                  </DialogContent> 
          
                 <DialogActions>
                 <Grid container alignItems="center" alignContent="center" justify="center">
                 <Button 
                  variant="contained" 
                  color="primary"              
                  onClick={handleEditSubmit}
                 > Update
                </Button>
               &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
               <Button 
                variant="contained" 
                color="primary"              
                //type="button"
                onClick = {handleEditClose}
               > Cancel
               </Button>
               </Grid>
           </DialogActions>
         </Dialog>
         ) : null}

     {deleteOpen? (
       
       <Dialog
           open={deleteOpen}
           onClose={handleDeleteClose}
           aria-labelledby="form-dialog-title"
           aria-describedby="form-dialog-description"
         >
           <DialogTitle id="form-dialog-title" style={{alignContent:'center'}}>Delete a device</DialogTitle>
           
                <DialogContent>
                  Are you sure you want to delete device {deviceName}?
                </DialogContent> 
          
          
                <DialogActions>
                <Grid container alignItems="center" alignContent="center" justify="center">
                 <Button 
                  variant="contained" 
                  color="primary"              
                  onClick={handleDeleteSubmit}
                 > YES
                </Button>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
               <Button 
                variant="contained" 
                color="primary"              
                //type="button"
                onClick = {handleDeleteClose}
               > NO
               </Button>
               </Grid>
           </DialogActions>
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
