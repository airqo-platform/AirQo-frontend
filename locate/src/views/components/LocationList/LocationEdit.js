import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import PropTypes from 'prop-types';
import { Card, CardContent, Grid, Button,Typography } from '@material-ui/core';
import clsx from 'clsx';
import Select from 'react-select';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import TextField from '@material-ui/core/TextField';
import NavPills from '../NavPills/NavPills';
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
  const initialLocationState = {
    locRef: null,
    hostName: '',
    mobility: '',
    latitude: null,
    longitude:NavPills,
    internet:'',
    power:'',
    height:'',
    roadIntensity:'',
    installationType:'',
    roadStatus:'',
    landuse: ''
  };

  const [currentLocation, setCurrentLocation] = useState(initialLocationState);
  const [message, setMessage] = useState('');
  const getTutorial = ref => {
    axios.get('http://127.0.0.1:4000/api/v1/location_registry/edit?loc_ref='+ref)
      .then(response => {
        setCurrentLocation(response.data);
        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });
  };

  useEffect(() => {
    getTutorial(params.loc_ref);
  }, [params.loc_ref]);

  const handleInputChange = event => {
    const { name, value } = event.target;
    setCurrentLocation({ ...currentLocation, [name]: value });
  };



  const [locData, setLocData] = useState('');
  /*
  useEffect(() => {
    console.log(params.loc_ref)
    axios.get(
      'http://127.0.0.1:4000/api/v1/location_registry/edit?loc_ref='+params.loc_ref
    )
    .then(
      res=>{
        const data = res.data;
        console.log(data);
        setLocData(data);
        //console.log(locData);
    }).catch(
      console.log
    )
    //setLocData(data);
  }, []);*/

 /* useEffect(() => {
    axios.get(
      'http://127.0.0.1:4000/api/v1/location_registry?loc_ref='+params.loc_ref
    )
    .then(
      res=>{
        const data = res.data;
        console.log(data);
        setLocData(data);
    }).catch(
      console.log
    )
  }, []);*/
 
  //const [loading, setLoading] = useState({value: false})
  //const [submitBtn, setSubmitBtn] = useState(false);
  
  const [locationReference, setLocationReference] = useState(locData.loc_ref);
  /*const handleLocationReferenceChange = defaultLocationRef => {
	  setLocationReference(defaultLocationRef);
  }*/

  const [latitude, setLatitude] = useState(locData.latitude);
  /*const handleLatitudeChange = enteredLatitude =>{
    let re = /\s*|\d+(\.d+)?/
    if (re.test(enteredLatitude.target.value)) {
	  setLatitude(enteredLatitude.target.value);
  }
}*/
  
  const [longitude, setLongitude] = useState(locData.longitude);
  /*const handleLongitudeChange = enteredLongitude =>{
    let re = /\s*|\d+(\.d+)?/
    if (re.test(enteredLongitude.target.value)){
	  setLongitude(enteredLongitude.target.value);
  }
}*/
  
  const [hostName, setHostName] = useState(locData.host);

 /* const handleHostNameChange = enteredHostName => {
    setHostName(enteredHostName.target.value);
}*/
 
  
  const [internet, setInternet] = useState({value: locData.internet});
  const handleInternetChange = selectedInternet => {
	  setInternet(selectedInternet);
  }
  const internetOptions = [
    { value: 'sms', label: 'SMS' },
    { value: 'wifi', label: 'WiFi' },
	{ value: 'lora', label: 'LoRa' }
  ];
  
  const [power, setPower] = useState({value: locData.power});
  const handlePowerChange = selectedPower => {
	  setPower(selectedPower);
  }
  const powerOptions = [
    { value: 'solar', label: 'Solar' },
    { value: 'mains', label: 'Mains' },
  ];
  
  const [height, setHeight] = useState(locData.height_above_ground);
  const handleHeightChange = enteredHeight => {
    let re = /\s*|\d+(\.d+)?/
    if (re.test(enteredHeight.target.value)) {
      setHeight(enteredHeight.target.value);
  }
}
  
  const [roadIntensity, setRoadIntensity] = useState({value: locData.road_intensity});
  const handleRoadIntensityChange = selectedRoadIntensity => {
	  setRoadIntensity(selectedRoadIntensity);
  }
  const roadIntensityOptions = [
    { value: 'minimal', label: 'Minimal' },
    { value: 'light', label: 'Light' },
    { value: 'moderate', label: 'Moderate' },
	{ value: 'heavy', label: 'Heavy' },
	{ value: 'extreme', label: 'Extreme' },
	];
  
  const [mobile, setMobile] = useState(false);
  const [mobility, setMobility] = useState({value: locData.mobility});
  /*const handleMobilityChange = selectedMobility => {
    setMobility(selectedMobility);
    if(mobility.value == 'static' ){
      setMobile(true);
    }
  }*/
  const mobilityOptions = [
    { value: 'static', label: 'Static' },
    { value: 'mobile', label: 'Mobile' },
  ];
  

  const [installationType, setInstallationType] = useState(locData.installation_type);
  const handleInstallationTypeChange = enteredInstallationType => {
	  setInstallationType(enteredInstallationType.target.value);
  }
  
  const [landuse, setLanduse] = useState(locData.landuse);
  const handleLanduseChange = enteredLanduse => {
	  setLanduse(enteredLanduse.target.value);
  }
    
  const [roadStatus, setRoadStatus] = useState({value: locData.road_status});
  const handleRoadStatusChange = selectedRoadStatus => {
	  setRoadStatus(selectedRoadStatus);
  }
  const roadStatusOptions = [
    { value: 'paved', label: 'Paved' },
    { value: 'unpaved', label: 'Unpaved' }
  ];
  
  /*const [localActivities, setLocalActivities = useState([]);
  const [localActivities,setLocalActivities] = useState({ selectedOption: [] });
  const handleLocalActivitiesChange = selectedLocalActivities => {
	  //setLocalActivities(selectedLocalActivities);
	  setLocalActivities({ selectedLocalActivities});
  }
  const localActivitiesOptions = [
    { value: 'burning', label: 'Burning' },
    { value: 'cooking', label: 'Cooking' },
    { value: 'road dust', label: 'Road dust' },
	  { value: 'idling', label: 'Idling' }
  ];
  */

  let changeHandler = event => {
    event.persist();
  
    let value = event.target.value;
    setHeight(value);
  
  };
  
  

  let  handleSubmit = (e) => {
    e.preventDefault();
    //setLoading(true);

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
      'http://127.0.0.1:4000/api/v1/location_registry/edit', 
      JSON.stringify(filter),
      { headers: { 'Content-Type': 'application/json' } }
    )
    .then(
      res=>{
        const myData = res.data;
        console.log(myData);
        //setLoading(false) 
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
                //value = {locationReference}
                value = {currentLocation.loc_ref}
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
                  value ={currentLocation.height}
                
                //value = {height}
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
                //onChange = {handleHostNameChange}
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
                //className="react-selectcomponent"
                className="reactSelect"
                name="roadIntensity"
                //placeholder="Road Intensity"
                value={roadIntensity}
                options={roadIntensityOptions}
                onChange={handleRoadIntensityChange}   
                variant = "outlined"
                autoWidth   
                //placeholder={'Enter Road Intensity'}
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
                //placeholder="Mobility"
                value={mobility}
                options={mobilityOptions}
                //onChange={handleMobilityChange}
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
                //onChange = {handleLatitudeChange}
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
                //placeholder="Road Status"
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
                //onChange = {handleLongitudeChange}
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
                //placeholder="Internet"
                value={internet}
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
                //placeholder="Power"
                value={power}
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

      {/*  
        <Dialog
            open={confirmDialog}
            onClose={handleConfirmClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                {confirmDialogMsg}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleConfirmClose} color="primary">
                OK
              </Button>
            </DialogActions>
          </Dialog>
          */}
    </div>
    )

  }
 


LocationEdit.propTypes = {
  className: PropTypes.string
};

export default LocationEdit;