import React, { useState, useEffect } from 'react';
import axios from 'axios';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles, mergeClasses } from '@material-ui/styles';
import { Card, CardContent, Grid, Button, Dialog, DialogActions, DialogContent, DialogTitle, SvgIcon, Icon } from '@material-ui/core';
import constants from '../../../../config/constants.js';
import TextField from '@material-ui/core/TextField';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import { Update, DeleteOutlined, EditOutlined, CloudUploadOutlined, UndoOutlined } from '@material-ui/icons';
import Tooltip from '@material-ui/core/Tooltip';

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

  const DeleteDialog = props => {
    const { className, users, ...rest } = props;
    const classes = useStyles();
    //const [data, setData] = useState([]);   
    //const [isLoading, setIsLoading] = useState(false);
    const [dialogLoading, setDialogLoading] = useState(true);
    const [dialogResponseMessage, setDialogResponseMessage] = useState('');
  
    const [maintenanceOpen, setMaintenanceOpen]= useState(false);
    const handleMaintenanceOpen = () => {
      setMaintenanceOpen(true);
    };
    const handleMaintenanceClose = () => {
      setMaintenanceOpen(false);
    };

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

  let handleMaintenanceClick = (name) => {
    return (event) => {
      console.log(name);
      setDeviceName(name);
      handleMaintenanceOpen();
    }
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
      "http://localhost:3000/api/v1/data/channels/maintenance/add",
      //constants.ADD_MAINTENANCE_URI,
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

  return(
    <div className={classes.root}> 
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
      </div>
  );
}

DeleteDialog.propTypes = {
    className: PropTypes.string,
    users: PropTypes.array.isRequired
  };
  
  export default DeleteDialog;