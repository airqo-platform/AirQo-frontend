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
import { Update, Delete, Edit } from '@material-ui/icons';
import Tooltip from '@material-ui/core/Tooltip';
//import Select from 'react-select';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import CheckBoxIcon from '@material-ui/icons/CheckBox';

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
    color: '#3344FF',
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
  const [locationID, setLocationID] = useState('');
  const handleLocationIDChange = enteredLocation => {
    setLocationID(enteredLocation)
  }
  const [height, setHeight] = useState(null);
  const handleHeightChange = enteredHeight => {
    let re = /\s*|\d+(\.d+)?/
    if (re.test(enteredHeight.target.value)) {
      setHeight(enteredHeight.target.value);
    }
  }
  const [power, setPower] = useState({value: ''});
  const handlePowerChange = selectedPower => {
	  setPower(selectedPower);
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

  useEffect(() => {
    //code to retrieve all devices' data
    setIsLoading(true);
    axios.get(
      'http://127.0.0.1:4001/api/v1/device/monitor/devices'
      //constants.ALL_LOCATIONS_URI
    )
    .then(
      res=>{
        setIsLoading(false);
        const ref = res.data;
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
 
  let handleMaintenanceClick = (name) => {
    return (event) => {
      console.log(name);
      setDeviceName(name);
      handleMaintenanceOpen();
    }
  }

  let handleDeployClick = (name) => {
    return (event) => {
      console.log('Deploying '+name);
      //console.log(name);
      setDeviceName(name);
      handleDeployOpen();
      //handleMaintenanceOpen();
    }
  }
  
  let  handleDeploySubmit = (e) => {
    //e.preventDefault();
    //setLoading(true);
    //setIsLoading(true);
   /*
    let filter ={ 
      unit: deviceName,
      activity:  maintenanceDescription,
	    date: selectedDate.toString(),
      
    }*/
    //console.log(JSON.stringify(filter));
  }
  
  let  handleMaintenanceSubmit = (e) => {
    //e.preventDefault();
    //setLoading(true);
    //setIsLoading(true);

    let filter ={ 
      unit: deviceName,
      activity:  maintenanceDescription,
	    date: selectedDate.toString(),
      
    }
    console.log(JSON.stringify(filter));
  /*
    axios.post(
      //'http://127.0.0.1:4000/api/v1/location_registry/register', 
      constants.REGISTER_LOCATION_URI,
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

        //setLoading(false) 
    }).catch(
      console.log
    )*/
  }


  return (
    <div className={classes.root}> 
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
              /*
             { title: 'Reference', 
               field: 'loc_ref', 
               render: rowData => <Link className={classes.link} to={`/locations/${rowData.loc_ref}`}>{rowData.loc_ref}</Link>
             },*/
             { title: 'Name', field: 'airqo_ref', cellStyle:{ fontFamily: 'Open Sans'} },
             { title: 'Channel ID', field: 'chan_id', cellStyle:{ fontFamily: 'Open Sans'} },
             { title: 'Location ID', field: 'location_ID', cellStyle:{ fontFamily: 'Open Sans'} },
             { title: 'Power Type', field: 'loc_power_suppy', cellStyle:{ fontFamily: 'Open Sans'} },
             { title: 'Last Maintained', field: 'last_maintained', cellStyle:{ fontFamily: 'Open Sans'} },
             { title: 'Actions',
               //field: '', 
               cellStyle: {fontFamily: 'Open Sans'},
               //render: rowData => <Link className={classes.link} onClick={handleMaintenanceClick(rowData.airqo_ref)}> Update Maintenance log </Link>,
               render: rowData => <div>
                                    <Tooltip title="Update Maintenance Log">
                                      <Link 
                                        className={classes.link} 
                                        onClick = {handleMaintenanceClick(rowData.airqo_ref)}
                                      > 
                                        <Update></Update>
                                      </Link>
                                    </Tooltip>

                                    <Tooltip title="Deploy Device">
                                      <Link 
                                        className={classes.link} 
                                        onClick = {handleDeployClick(rowData.airqo_ref)}
                                      > 
                                      Deploy
                                      {/*
                                        <Icon>
                                          <img  src="../../../../assets/img/icons/deploy.svg"/>
                                        </Icon>
                                          */}
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
       
             //{ title: 'District', field: 'district', cellStyle:{ fontFamily: 'Open Sans'} },
             //{ title: 'Subcounty', field: 'subcounty', cellStyle:{ fontFamily: 'Open Sans'} },
             //{ title: 'Parish', field: 'parish', cellStyle:{ fontFamily: 'Open Sans'} },
             //{title: 'Birth Place',mfield: 'birthCity', lookup: { 34: 'İstanbul', 63: 'Şanlıurfa' },},
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

    {maintenanceOpen? (
       
       <Dialog
           open={maintenanceOpen}
           onClose={handleMaintenanceClose}
           aria-labelledby="form-dialog-title"
           aria-describedby="form-dialog-description"
         >
           <DialogTitle id="form-dialog-title">Update Maintenance Log</DialogTitle>
           
           <DialogContent>
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
                  </DialogContent> 
          
          
                 <DialogActions>
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
                 <Grid item xs={6}>
                    <TextField 
                      id="standard-basic" 
                      label="height" 
                      value = {height}
                      onChange = {handleHeightChange}
                    />
                  </Grid>
                </Grid>
                <Grid container item xs={12} spacing={3}>
                 <Grid item xs={6}>
                   <FormControl className={classes.formControl}>
                     <InputLabel htmlFor="demo-dialog-native">Location ID</InputLabel>
                     <Select
                       native
                       value={locationID}
                       onChange={handleLocationIDChange}
                       input={<Input id="demo-dialog-native" />}
                     >
                      <option aria-label="None" value="" />
                      <option value={10}>Ten</option>
                      <option value={20}>Twenty</option>
                      <option value={30}>Thirty</option>
                     </Select>
                   </FormControl>
                  </Grid>
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
                      </Select>
                    </FormControl>
                   </Grid>
                  </Grid>
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
                    </Grid>
                  </Grid>
                </DialogContent> 
          
          
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
