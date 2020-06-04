import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import PropTypes from 'prop-types';
import { Grid, Button,Typography, Dialog, DialogActions, DialogContent, DialogContentText } from '@material-ui/core';
import clsx from 'clsx';
import Select from 'react-select';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import TextField from '@material-ui/core/TextField';
import NavPills from '../NavPills/NavPills';
import { Link } from "react-router-dom";
//import Select from '@material-ui/core/Select';


const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3)
  },
  content: {
    marginTop: theme.spacing(2)
  },
  title: {
    fontWeight: 700
  },
  avatar: {
    backgroundColor: theme.palette.success.main,
    height: 56,
    width: 56
  },
  icon: {
    height: 32,
    width: 32
  },
  difference: {
    marginTop: theme.spacing(2),
    display: 'flex',
    alignItems: 'center'
  },
  differenceIcon: {
    color: theme.palette.success.dark
  },
  differenceValue: {
    color: theme.palette.success.dark,
    marginRight: theme.spacing(1)
  },

  formControl: {
    margin: theme.spacing(3),
  },
  textField: {
    width: '250px',
    textAlign: 'left',
    marginLeft: 'auto',
    marginRight: 'auto',            
    paddingBottom: 0,
    marginTop: 0,
    fontWeight: 500,
    border: '2px solid #7575FF',    
},
  
}));


const selectStyles = {
  container: (provided) => ({
    ...provided,
    display: 'inline-block',
    width: '250px',
    minHeight: '1px',
    textAlign: 'left',
    border: 'none',
  }),
  control: (provided) => ({
    ...provided,
    //border: '2px solid #757575',
    border: '2px solid #7575FF',
    borderRadius: '0',
    minHeight: '1px',
    height: '56px',
  }),
  input: (provided) => ({
    ...provided,
    minHeight: '1px',
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    minHeight: '1px',
    paddingTop: '0',
    paddingBottom: '0',
    color: '#757575',
    //color:'#000000',
  }),
  indicatorSeparator: (provided) => ({
    ...provided,
    minHeight: '1px',
    height: '24px',
  }),
  clearIndicator: (provided) => ({
    ...provided,
    minHeight: '1px',
  }),
  valueContainer: (provided) => ({
    ...provided,
    minHeight: '1px',
    height: '40px',
    paddingTop: '0',
    paddingBottom: '0',
  }),
  singleValue: (provided) => ({
    ...provided,
    minHeight: '1px',
    paddingBottom: '2px',
  }),
};

const LocationEdit = props => {
  const { className, ...rest } = props;
  let params = useParams();
  const classes = useStyles();
  
  const [message, setMessage] = useState('');
  const [locationReference, setLocationReference] = useState('');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [hostName, setHostName] = useState('');
  const [mobile, setMobile] = useState(false);
  const [mobility, setMobility] = useState('');
  const mobilityOptions = [
    { value: 'Static', label: 'Static' },
    { value: 'Mobile', label: 'Mobile' },
  ];

  const [internet, setInternet] = useState('');
  const handleInternetChange = selectedInternet => {
	  setInternet(selectedInternet.value);
  }
  const internetOptions = [
    { value: 'SMS', label: 'SMS' },
    { value: 'WiFi', label: 'WiFi' },
	{ value: 'LoRa', label: 'LoRa' }
  ];

  const [power, setPower] = useState("");
  const handlePowerChange = selectedPower => {
	  setPower(selectedPower.value);
  }
  const powerOptions = [
    { value: 'Solar', label: 'Solar' },
    { value: 'Mains', label: 'Mains' },
  ];

  const [height, setHeight] = useState(0);
  const handleHeightChange = enteredHeight => {
    let re = /\s*|\d+(\.d+)?/
    if (re.test(enteredHeight.target.value)) {
      setHeight(enteredHeight.target.value);
  }
}

const [roadIntensity, setRoadIntensity] = useState("");
const handleRoadIntensityChange = selectedRoadIntensity => {
	  setRoadIntensity(selectedRoadIntensity.value);
  }
const roadIntensityOptions = [
    { value: 'Minimal', label: 'Minimal' },
    { value: 'Light', label: 'Light' },
    { value: 'Moderate', label: 'Moderate' },
	  { value: 'Heavy', label: 'Heavy' },
	  { value: 'Extreme', label: 'Extreme' },
    ];
const [installationType, setInstallationType] = useState("");
const handleInstallationTypeChange = enteredInstallationType => {
	  setInstallationType(enteredInstallationType.target.value);
  }

const [roadStatus, setRoadStatus] = useState('');
const handleRoadStatusChange = selectedRoadStatus => {
	  setRoadStatus(selectedRoadStatus.value);
  }
const roadStatusOptions = [
    { value: 'Paved', label: 'Paved' },
    { value: 'Unpaved', label: 'Unpaved' }
  ];

const [landuse, setLanduse] = useState('');
const handleLanduseChange = enteredLanduse => {
	  setLanduse(enteredLanduse.target.value);
  }

  const [dialogStatus, setDialogStatus] = useState(false)
  const [dialogMessage, setDialogMessage] = useState('')
  

  const getLocation = ref => {
    axios.get('http://127.0.0.1:4000/api/v1/location_registry/edit?loc_ref='+ref)
      .then(response => {
        let myData = response.data
        //setCurrentLocation(response.data);
        setLocationReference(myData.loc_ref);
        setHostName(myData.host);
        setMobility(myData.mobility);
        setLatitude(myData.latitude);
        setLongitude(myData.longitude);
        setInternet(myData.internet);
        setPower(myData.power);
        setHeight(myData.height_above_ground);
        setRoadIntensity(myData.road_intensity);
        setInstallationType(myData.installation_type);
        setRoadStatus(myData.road_status);
        setLanduse(myData.landuse);
        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });
  };

  useEffect(() => {
    getLocation(params.loc_ref);
  }, [params.loc_ref]);

  /*
  const handleInputChange = event => {
    const { name, value } = event.target;
    setCurrentLocation({ ...currentLocation, [name]: value });
  };  
*/

  let changeHandler = event => {
    event.persist();
  
    let value = event.target.value;
    setHeight(value);
  
  };

  let handleConfirmClose = () => {
    setDialogStatus(false);
  };
  
  
  

  let  handleSubmit = (e) => {
    e.preventDefault();
    //setLoading(true);
    let filter ={ 
      locationReference: locationReference,
      internet:  internet,
      height: Number(height),      
      roadIntensity: roadIntensity, 
      installationType:	installationType,  
      roadStatus: roadStatus,
      landuse: landuse,	
      power:  power,
    }
    console.log(JSON.stringify(filter));
    
    axios.post(
      'http://127.0.0.1:4000/api/v1/location_registry/update', 
      JSON.stringify(filter),
      { headers: { 'Content-Type': 'application/json' } }
    )
    .then(
      res=>{
        const myData = res.data;
        console.log(myData);
        //setLoading(false) 
        setDialogMessage(myData.message);
        setDialogStatus(true);
    }).catch(
      console.log
    )
  }

    return(
    <div className={classes.root}>   
          
    <form onSubmit={handleSubmit}>
      <Grid container spacing={1}>
        <Grid container item xs={12} spacing={3}>
          <React.Fragment>
            <Grid item xs={6}>
            <div className={classes.formControl} style={{width: '250px'}}>
            <span>Location Reference</span>
              <TextField 
                className={classes.textField}
	              id="locationReference" 
                value = {locationReference}
                variant = "outlined"
                size = "medium"
                color ="secondary"
                margin ="normal"
		        InputProps={{
                  readOnly: true,
                }}
	            /> 
              </div>
          
            </Grid>
            <Grid item xs={6}>

           <div className={classes.formControl} style={{width: '250px'}}>
           <span>Height above ground (m)</span>
              <TextField 
                className={classes.textField}
                id="height" 
                value = {height}
                keyboardType="numeric"
                onChange={changeHandler}
                variant = "outlined"
                size = "medium"
                color ="secondary"
                margin ="normal"
                disabled = {mobile}
	            /> 
              </div>
            </Grid>
          </React.Fragment>
        </Grid>

        <Grid container item xs={12} spacing={3}>
          <React.Fragment>
            <Grid item xs={6}>
            <div className={classes.formControl} style={{width: '250px'}}>
            <span>Host Name</span>
              <TextField 
                required 
                className={classes.textField}
	            id="hostName" 
                value = {hostName}
                variant = "outlined"
                size = "medium"
                color ="secondary"
                margin ="normal"
                InputProps={{
                  readOnly: true,
                }}
	            /> 
              </div>
            </Grid>
            <Grid item xs={6}>
            <div className={classes.formControl} style={{width: '250px',height:10}}>
            <span>Road Intensity</span>
              <Select
                className="reactSelect"
                name="roadIntensity"
                //value={roadIntensity.value}
               // value="myRoadIntensity"
                //value = {roadIntensity}
                options={roadIntensityOptions}
                onChange={handleRoadIntensityChange}  
                value={roadIntensityOptions.filter(function(option) {
                    return option.value === roadIntensity;
                  })} 
                variant = "outlined"
                autoWidth   
                autoFocus={true}     
                styles={selectStyles}   
                isDisabled ={mobile}
              />
              </div>
            </Grid>
          </React.Fragment>
        </Grid>

        <Grid container item xs={12} spacing={3}>
          <React.Fragment>
            <Grid item xs={6}>
            <div className={classes.formControl} style={{width: '250px'}}>
            <span>Mobility</span>
              <Select 
                className="reactSelect"
                name="mobility"
                //value={mobility}
                value={mobilityOptions.filter(function(option) {
                    return option.value === mobility;
                  })}
                options={mobilityOptions}
                defaultValue = "Mobility"
                styles={selectStyles} 
                isDisabled={ true }
               />
               </div>
            </Grid>
            <Grid item xs={6}>
            <div className={classes.formControl} style={{width: '250px'}}>
            <span>Installation Type</span>
              <TextField 
                className={classes.textField}
	            id="installationType" 
                value = {installationType}
                onChange = {handleInstallationTypeChange}
                variant = "outlined"
                size = "medium"
                color ="secondary"
                margin ="normal"
                disabled = {mobile}
	            /> 
              </div>
            </Grid>
          </React.Fragment>
        </Grid>


        <Grid container item xs={12} spacing={3}>
          <React.Fragment>
            <Grid item xs={6}>
            <div className={classes.formControl} style={{width: '250px'}}>
            <span>Latitude</span>
              <TextField 
                className={classes.textField}
                id="latitude" 
                value = {latitude}
                keyboardType="numeric"
		        variant = "outlined"
                //type = "number"
                size = "medium"
                color ="secondary"
                margin ="normal"
                InputProps={{
                    readOnly: true,
                    }}
                //disabled = {mobile}
	             /> 
               </div>
            </Grid>
            <Grid item xs={6}>
            <div className={classes.formControl} style={{width: '250px'}}>
              <span>Road Status</span>
              <Select
                className="reactSelect"
                name="roadStatus"
                //value={roadStatus}
                options={roadStatusOptions}
                onChange={handleRoadStatusChange}   
                styles={selectStyles}    
                isDisabled ={mobile}  
                value={roadStatusOptions.filter(function(option) {
                    return option.value === roadStatus;
                  })}    
              />
            </div>
            </Grid>
           </React.Fragment>
        </Grid>

        <Grid container item xs={12} spacing={3}>
          <React.Fragment>
            <Grid item xs={6}>
            <div className={classes.formControl} style={{width: '250px'}}>
            <span>Longitude</span>
              <TextField 
                className={classes.textField}
                id="longitude" 
                value = {longitude}
                keyboardType="numeric"
		        variant = "outlined"
                //type = "number"
                size = "medium"
                color ="secondary"
                margin ="normal"
                InputProps={{
                  readOnly: true,
                    }}
                //disabled = {mobile}
	             /> 
               </div>
            </Grid>
            <Grid item xs={6}>
            <div className={classes.formControl} style={{width: '250px'}}>
            <span>Landuse</span>
              <TextField  
                className={classes.textField}
	            id="landuse" 
                onChange = {handleLanduseChange}
                variant = "outlined"
                size = "medium"
                color ="secondary"
                margin ="normal"
                disabled = {mobile}
                value = {landuse}
	            /> 
	          </div>
            </Grid>
           </React.Fragment>
        </Grid>

        <Grid container item xs={12} spacing={3}>
          <React.Fragment>
            <Grid item xs={6}>
            <div className={classes.formControl} style={{width: '250px'}}>
            <span>Internet Option</span>
              <Select
                className="reactSelect"
                name="internet"
                //value={internet}
                options={internetOptions}
                onChange={handleInternetChange}
                styles={selectStyles} 
                isDisabled ={mobile}
                value={internetOptions.filter(function(option) {
                    return option.value === internet;
                  })}
              />
              </div>
              </Grid>
            <Grid item xs={6}>
            <div className={classes.formControl} style={{width: '250px'}}>
            <span>Power Type</span>
              <Select
                className="reactSelect"
                name="power"
                //value={power}
                value={powerOptions.filter(function(option) {
                    return option.value === power;
                  })}
                options={powerOptions}
                onChange={handlePowerChange} 
                styles={selectStyles} 
                isDisabled ={mobile}            
              />
	          </div>
            </Grid>
           </React.Fragment>
        </Grid>
        </Grid>
        <div className={classes.formControl} style={{width: '900px'}}>

        <Button 
          variant="contained" 
          color="primary"              
          type="submit"
          align = "centre"
        > Save Changes
        </Button>
      </div>           
      </form>
      {dialogStatus? (
      <Dialog
            open={dialogStatus}
            onClose={handleConfirmClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                {dialogMessage}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
            <div>    
           {/* <Link to='/location'>*/}
           <Link to={`/locations/${locationReference}`}>
              <Button 
               variant="contained" 
               color="primary"              
               align = "centre"
              > OK
              </Button>
            </Link>  
            </div>  
            </DialogActions>
          </Dialog>
          ) : null}

    </div>
    )

  }
 


LocationEdit.propTypes = {
  className: PropTypes.string
};

export default LocationEdit;