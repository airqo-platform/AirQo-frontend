import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import PropTypes from 'prop-types';
import { Grid, Button,Typography, Dialog, DialogActions, DialogContent, DialogContentText, responsiveFontSizes } from '@material-ui/core';
import clsx from 'clsx';
import Select from 'react-select';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import TextField from '@material-ui/core/TextField';
import { Link } from "react-router-dom";
import LoadingOverlay from 'react-loading-overlay';
import CreatableSelect from 'react-select/creatable';
//import './assets/css/location-registry.css';
import '../../../assets/css/location-registry.css';


const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3),
    //marginLeft: 100,
    //marginRight: 100,
    //'&:hover $notchedOutline': {
     // border: '2px solid #7575FF',
    //}
  },
  notchedOutline: {
  },
  focused: {
    "& $notchedOutline": {
      borderColor: "blue"
    }
  },
 
  content: {
    marginTop: theme.spacing(2)
  },
  title: {
    fontWeight: 700,
    color: '#000000',
    fontSize: 24,
    fontFamily: 'Open Sans'
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
    fontFamily: 'Open Sans',
    marginLeft: 100,
    marginRight: 100
  },
  textField: {
    width: '250px',
    textAlign: 'left',
    //marginLeft: 'auto',
    //marginRight: 'auto',            
    paddingBottom: 0,
    marginTop: 0,
    //fontWeight: 500,
    //borderWidth: '2px',
    //borderColor: '#7575FF',
    borderRadius: 10,
    border: '2px solid #7575FF', 
  },

  input: {
    color: 'black',
    //fontFamily: 'Arial',
    fontFamily: 'Open Sans',
    fontweight:500,
    font: '100px',
    fontSize: 17
}
  
}));


const selectStyles = {
  container: (provided) => ({
    ...provided,
    display: 'inline-block',
    width: '250px',
    minHeight: '1px',
    textAlign: 'left',
    border: 'none',
    //borderRadius: 10,
    fontWeight: 500,
    //fontFamily: 'Arial',
    fontFamily: 'Open Sans',
    font: '100px',
    fontSize: 17
  }),
  control: (provided) => ({
    ...provided,
    //border: '2px solid #757575',
    border: '2px solid #7575FF',
    borderRadius: 10,
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
    color: '#7575FF',
  }),
  indicatorSeparator: (provided) => ({
    ...provided,
    minHeight: '1px',
    //height: '24px',
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

const multiStyles = {
  container: (provided) => ({
    ...provided,
    display: 'inline-block',
    width: '250px',
    minHeight: '1px',
    textAlign: 'left',
    border: 'none',
    //borderRadius: 10,
    fontWeight: 500,
    //fontFamily: 'Arial',
    fontFamily: 'Open Sans',
    font: '100px',
    fontSize: 17
  }),
  control: (provided) => ({
    ...provided,
    border: '2px solid #7575FF',
    borderRadius: 10,
    minHeight: '56px',
   // height: 'auto'
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
    color: '#7575FF',
  }),
  indicatorSeparator: (provided) => ({
    ...provided,
    minHeight: '1px',
    color: '#7575FF',
    //height: '24px',
  }),
  clearIndicator: (provided) => ({
    ...provided,
    minHeight: '1px',
  }),
  valueContainer: (provided) => ({
    ...provided,
    minHeight: '40px',
    //height: '40px',
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

  const InputProps = {
    classes: {
      root: classes.root,
      notchedOutline: classes.notchedOutline,
      focused: classes.focused
      //notchedOutline: classes.notchedOutline
    },
  };

  const [locationReference, setLocationReference] = useState('');
  
  useEffect(() => {
    //code to retrieve next location ID from backend
    axios.get(
      'http://127.0.0.1:4000/api/v1/location_registry/create_id'
    )
    .then(
      res=>{
        const ref = res.data;
        console.log(ref);
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

  const [latitude, setLatitude] = useState(null);
  const handleLatitudeChange = enteredLatitude =>{
    let re = /\s*|\d+(\.d+)?/
    if (re.test(enteredLatitude.target.value)) {
	  setLatitude(enteredLatitude.target.value);
  }
}
  
  const [longitude, setLongitude] = useState(null);
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
    { value: 'GSM', label: 'GSM' },
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
 
  
  const [localActivities, setLocalActivities] = useState([]);
  const handleLocalActivitiesChange = selectedOptions => {
    setLocalActivities(selectedOptions);
  }

 
/* const [localActivities, setLocalActivities] = useState({ selectedOption: [] });
 const handleLocalActivitiesChange = selectedOption => {
  setLocalActivities({ selectedOption });
}*/
const localActivitiesOptions = [
  { value: 'Burning', label: 'Burning' },
  { value: 'Cooking', label: 'Cooking' },
  { value: 'Dust', label: 'Dust' },
  { value: 'Construction', label: 'Construction' },
  { value:'Vehicle emissions', label: 'Vehicle Emissions'}
];
    
  const [roadStatus, setRoadStatus] = useState({value: ''});
  const handleRoadStatusChange = selectedRoadStatus => {
	  setRoadStatus(selectedRoadStatus);
  }
  const roadStatusOptions = [
    { value: 'Paved', label: 'Paved' },
    { value: 'Unpaved', label: 'Unpaved' }
  ];
  
  

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
      localActivities: localActivities,	
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
          
    <form onSubmit={handleSubmit} className={classes.formControl}>
    <h5 align = "center"><b>Add a Location</b></h5><br/>
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
                  classes: {
                    notchedOutline: classes.notchedOutline,
                    focused: classes.focused
                  },
                  className: classes.input,
                  readOnly:true
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
                InputProps={{
                  className: classes.input,
                  classes: {
                    notchedOutline: classes.notchedOutline,
                    focused: classes.focused
                  }  
              }}
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
                onChange = {handleHostNameChange}
                variant = "outlined"
                size = "medium"
                color ="secondary"
                margin ="normal"
                InputProps={{
                  className: classes.input,
                  classes: {
                    notchedOutline: classes.notchedOutline,
                    focused: classes.focused
                  }
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
                value = {installationType}
                onChange = {handleInstallationTypeChange}
                variant = "outlined"
                size = "medium"
                color ="secondary"
                margin ="normal"
                disabled = {mobile}
                InputProps={{
                  className: classes.input,
                  classes: {
                    notchedOutline: classes.notchedOutline,
                    focused: classes.focused
                  }
              }}
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
                onChange = {handleLatitudeChange}
                keyboardType="numeric"
		            variant = "outlined"
                //type = "number"
                size = "medium"
                color ="secondary"
                margin ="normal"
                disabled = {mobile}
                InputProps={{
                  className: classes.input,
                  classes: {
                    notchedOutline: classes.notchedOutline,
                    focused: classes.focused
                  }
              }}
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
                value = {longitude}
                onChange = {handleLongitudeChange}
                keyboardType="numeric"
		            variant = "outlined"
                size = "medium"
                color ="secondary"
                margin ="normal"
                disabled = {mobile}
                InputProps={{
                  className: classes.input,
                  classes: {
                    notchedOutline: classes.notchedOutline,
                    focused: classes.focused
                  }
              }}
	             /> 
               </div>
            </Grid>
            <Grid item xs={6}>
            <div className={classes.formControl} style={{width: '250px'}}>
            <span>Local Activities</span>
            <CreatableSelect
              //className="reactselect"
              className="basic-multi-select"
              classNamePrefix="select"
              name = "localActivities"
              //value={localActivities.selectedOption}
              value = {localActivities}
              options={localActivitiesOptions}
              onChange={handleLocalActivitiesChange}
              //styles = {selectStyles}
              styles = {multiStyles}
              isDisabled ={mobile} 
              closeMenuOnSelect={false}
              isMulti
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
          //align = "centre"
        > Register Location
        </Button>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <Link to={`/location`}>
        <Button 
          variant="contained" 
          color="primary"              
          type="button"
          //align = "centre"
        > Cancel
        </Button>
        </Link>
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