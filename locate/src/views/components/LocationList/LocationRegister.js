import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import PropTypes from 'prop-types';
import { Grid, Button,Typography, Dialog, DialogActions, DialogContent, DialogContentText } from '@material-ui/core';
import clsx from 'clsx';
import Select from 'react-select';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import TextField from '@material-ui/core/TextField';
import { Link } from "react-router-dom";
import LoadingOverlay from 'react-loading-overlay';


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
    //fontWeight: 500,
    border: '2px solid #7575FF', 
    fontFamily: 'Times New Roman', 
  
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
    //fontWeight: 500,
    //fontFamily: 'Times New Roman',
  }),
  control: (provided) => ({
    ...provided,
    //border: '2px solid #757575',
    border: '2px solid #7575FF',
    borderRadius: '0',
    minHeight: '1px',
    height: '56px',
    fontWeight: 500,
    //fontFamily: 'Times New Roman',
  }),
  input: (provided) => ({
    ...provided,
    minHeight: '1px',
    //fontweight:500,
    //fontFamily: 'Times New Roman',
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
    fontweight: 500,
  }),
  singleValue: (provided) => ({
    ...provided,
    minHeight: '1px',
    paddingBottom: '2px',
    fontweight: 500,
  }),
};

const LocationRegister = props => {
  const { className, ...rest } = props;
  let params = useParams();
  const classes = useStyles();

  const [locationReference, setLocationReference] = useState('');
  
  useEffect(() => {
    //code to retrieve next location ID from backend
    axios.get(
      'http://127.0.0.1:4000/api/v1/location_registry/create_id'
    )
    .then(
      res=>{
        const ref = res.data;
        setLocationReference(ref)

    }).catch(
      console.log
    )
  }, []);
 
  //const [loading, setLoading] = useState({value: false})
  //const [submitBtn, setSubmitBtn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [dialogStatus, setDialogStatus] = useState(false)
  const [dialogMessage, setDialogMessage] = useState('')

  const [latitude, setLatitude] = useState(0);
  const handleLatitudeChange = enteredLatitude =>{
    let re = /\s*|\d+(\.d+)?/
    if (re.test(enteredLatitude.target.value)) {
	  setLatitude(enteredLatitude.target.value);
  }
}
  
  const [longitude, setLongitude] = useState(0);
  const handleLongitudeChange = enteredLongitude =>{
    let re = /\s*|\d+(\.d+)?/
    if (re.test(enteredLongitude.target.value)){
	  setLongitude(enteredLongitude.target.value);
  }
}
  
  const [hostName, setHostName] = useState('');

  const handleHostNameChange = enteredHostName => {
    setHostName(enteredHostName.target.value);
}
 
  
  const [internet, setInternet] = useState({value: ''});
  const handleInternetChange = selectedInternet => {
	  setInternet(selectedInternet);
  }
  const internetOptions = [
    { value: 'SMS', label: 'SMS' },
    { value: 'WiFi', label: 'WiFi' },
	  { value: 'LoRa', label: 'LoRa' }
  ];
  
  const [power, setPower] = useState({value: ''});
  const handlePowerChange = selectedPower => {
	  setPower(selectedPower);
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
  
  const [roadIntensity, setRoadIntensity] = useState({value: ''});
  const handleRoadIntensityChange = selectedRoadIntensity => {
	  setRoadIntensity(selectedRoadIntensity);
  }
  const roadIntensityOptions = [
    { value: 'Minimal', label: 'Minimal' },
    { value: 'Light', label: 'Light' },
    { value: 'Moderate', label: 'Moderate' },
	  { value: 'Heavy', label: 'Heavy' },
	  { value: 'Extreme', label: 'Extreme' },
	];
  
  const [mobile, setMobile] = useState(false);
  const [mobility, setMobility] = useState({value: ''});
  const handleMobilityChange = selectedMobility => {
    setMobility(selectedMobility);
    if(selectedMobility.value == 'Mobile' ){
      setMobile(true);
    }
    else if (selectedMobility.value == 'Static'){
      setMobile(false);
    }
  }
  const mobilityOptions = [
    { value: 'Static', label: 'Static' },
    { value: 'Mobile', label: 'Mobile' },
  ];

  

  const [installationType, setInstallationType] = useState('');
  const handleInstallationTypeChange = enteredInstallationType => {
	  setInstallationType(enteredInstallationType.target.value);
  }
  
  const [landuse, setLanduse] = useState('');
  const handleLanduseChange = enteredLanduse => {
	  setLanduse(enteredLanduse.target.value);
  }
    
  const [roadStatus, setRoadStatus] = useState({value: ''});
  const handleRoadStatusChange = selectedRoadStatus => {
	  setRoadStatus(selectedRoadStatus);
  }
  const roadStatusOptions = [
    { value: 'Paved', label: 'Paved' },
    { value: 'Unpaved', label: 'Unpaved' }
  ];
  
  //const [localActivities, setLocalActivities = useState([]);
 /* const [localActivities,setLocalActivities] = useState({ selectedOption: [] });
  const handleLocalActivitiesChange = selectedLocalActivities => {
	  //setLocalActivities(selectedLocalActivities);
	  setLocalActivities({ selectedLocalActivities});
  }
  const localActivitiesOptions = [
    { value: 'burning', label: 'Burning' },
    { value: 'cooking', label: 'Cooking' },
    { value: 'road dust', label: 'Road dust' },
	  { value: 'idling', label: 'Idling' }
  ];*/

  let generateReference = () =>{
    axios.get(
      //'https://analytcs-bknd-service-dot-airqo-250220.uc.r.appspot.com/api/v1/device/graph',
      'http://127.0.0.1:4000/api/v1/location_registry/create_id'
    )
    .then(
      res=>{
        const ref = res.data;
        console.log(ref);
        //setLocationReference(ref)
        return ref

    }).catch(
      console.log
    )

  }

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
    setIsLoading(true);

    let filter ={ 
      locationReference: locationReference,
      hostName:  hostName,
	    mobility: mobility.value,
      latitude: Number(latitude),
      longitude:  Number(longitude),
      internet:  internet.value,
      height: Number(height),      
      roadIntensity: roadIntensity.value, 
      installationType:	installationType,  
      roadStatus: roadStatus.value,
      landuse: landuse,	
      power:  power.value,
    }
    console.log(JSON.stringify(filter));
    
    axios.post(
      //'https://analytcs-bknd-service-dot-airqo-250220.uc.r.appspot.com/api/v1/device/graph',
      'http://127.0.0.1:4000/api/v1/location_registry/register', 
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
    )
  }

    return(
    <div className={classes.root}>  
    <LoadingOverlay
      active={isLoading}
      spinner
      text='Saving Location...'
    >
          
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
                //label="Location Reference"
                value = {locationReference}
		            //placeholder="Location Reference"
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
                //label="Height above ground (m)"
                value = {height}
		            //placeholder="Height above ground"
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
                //label="Host Name"
                value = {hostName}
		            //placeholder="Host Name"
                onChange = {handleHostNameChange}
                variant = "outlined"
                size = "medium"
                color ="secondary"
                margin ="normal"
	            /> 
              </div>
            </Grid>
            <Grid item xs={6}>
            <div className={classes.formControl} style={{width: '250px',height:10}}>
            <span>Road Intensity</span>
              <Select
                className="reactSelect"
                name="roadIntensity"
                //value={roadIntensity}
                options={roadIntensityOptions}
                onChange={handleRoadIntensityChange}    
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
                options={mobilityOptions}
                onChange={handleMobilityChange}
                defaultValue = "Mobility"
                styles={selectStyles} 
               />
               </div>
            </Grid>
            <Grid item xs={6}>
            <div className={classes.formControl} style={{width: '250px'}}>
            <span>Installation Type</span>
              <TextField 
                className={classes.textField}
	              id="installationType" 
                //label="Installation Type"
                value = {installationType}
		            //placeholder="Installation Type"
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
                //label="Latitude"
                value = {latitude}
		            //placeholder="Latitude"
                onChange = {handleLatitudeChange}
                keyboardType="numeric"
		            variant = "outlined"
                //type = "number"
                size = "medium"
                color ="secondary"
                margin ="normal"
                disabled = {mobile}
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
                //label="Longitude"
                value = {longitude}
		            //placeholder="Longitude"
                onChange = {handleLongitudeChange}
                keyboardType="numeric"
		            variant = "outlined"
                //type = "number"
                size = "medium"
                color ="secondary"
                margin ="normal"
                disabled = {mobile}
	             /> 
               </div>
            </Grid>
            <Grid item xs={6}>
            <div className={classes.formControl} style={{width: '250px'}}>
            <span>Landuse</span>
              <TextField  
                className={classes.textField}
	              id="landuse" 
		            //label="Landuse"
		            //placeholder="Landuse"
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
        > Register Location
        </Button>
      </div>           
      </form>
      </LoadingOverlay>
       
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
 


LocationRegister.propTypes = {
  className: PropTypes.string
};

export default LocationRegister;