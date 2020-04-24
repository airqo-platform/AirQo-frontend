import React , { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Grid,Button,FormControl,MenuItem,Input,TextField,InputLabel,Card,CardContent } from '@material-ui/core';
import Select from 'react-select';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import DateFnsUtils from '@date-io/date-fns';
import {MuiPickersUtilsProvider, KeyboardTimePicker, KeyboardDatePicker} from '@material-ui/pickers';
import axios from 'axios';
const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(4)
  },
  differenceIcon: {
    color: theme.palette.text.secondary,
  },
  button:{
    color:'white',
    background:'blue'
  },
sec:{
  width:'50%',
  padding:'15px',
  color:"black"
},

}));

const Download = () => {
  const classes = useStyles();
 const [times, setTimes] =useState([]);
  const [pollutionValues, setPollutionValues] = useState([]);
  const [backgroundColors, setBackgroundColors] = useState([]);
  const [selectedDate, setSelectedStartDate] = useState(new Date('2020-04-16T21:11:54'));
  const handleDateChange = (date) => {
    setSelectedStartDate(date);
  };
  const [selectedEndDate, setSelectedEndDate] = useState(new Date('2020-04-16T21:11:54'));
  const handleEndDateChange = (date) => {
    setSelectedEndDate(date);
  };

  const [filterLocations,setFilterLocations] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/v1/dashboard/monitoringsites/locations?organisation_name=KCCA')
      .then(res => res.json())
      .then((filterLocationsData) => {
        setFilterLocations(filterLocationsData.airquality_monitoring_sites)
      })
      .catch(console.log)
  },[]);

  const filterLocationsOptions = filterLocations

  const [values, setReactSelectValue] = useState({ selectedOption: [] });

  const handleMultiChange = selectedOption => {
    //setValue('reactSelect', selectedOption);
    setReactSelectValue({ selectedOption });
  }

    const frequencyOptions = [
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const [selectedFrequency, setSelectedFrequency] =  useState({value: 'daily' });

  const handleFrequencyChange = selectedFrequencyOption => {
    setSelectedFrequency(selectedFrequencyOption);
  };

  const pollutantOptions = [
    { value: 'PM 2.5', label: 'PM 2.5' },
    { value: 'PM 10', label: 'PM 10' },
    { value: 'NO2', label: 'NO2' }
  ];

  const [selectedPollutant, setSelectedPollutant] =  useState({value: 'PM 2.5' });

  const handlePollutantChange = selectedPollutantOption => {
    setSelectedPollutant(selectedPollutantOption);
  };


  const typeOptions = [
    { value: 'JSON', label: 'JSON' },
    { value: 'CSV', label: 'CSV'}
  ];

  const [selectedType, setSelectedType] =  useState({value: 'CSV' });

  const handleTypeChange = selectedTypeOption => {
    setSelectedType(selectedTypeOption);
  };
const degreeOfClean =[
{ value: 'Raw Data', label:'Raw Data'},{value: 'Clean Data', label:'Clean Data'}
]
const [selectedClean,setSelectedClean] =useState({value: 'Clean Data'})
  const handleCleanessChange = selecteddegreeOfClean => {
    setSelectedClean(selecteddegreeOfClean);
  };

    let  handleSubmit = (e) => {
    e.preventDefault();

    let params ={ 
      locations: values.selectedOption,
      startDate:  selectedDate,
      endDate:  selectedEndDate,
      frequency:  selectedFrequency.value,
      pollutant: selectedPollutant.value,
      fileType:selectedType.value,
      degreeOfClean:selectedClean.value,
      organisation_name: 'KCCA'     
    }
    console.log(JSON.stringify(params));
  /*const args = {
method: 'GET',
headers: { 'content-type': 'application/json' },
data: JSON.stringify(params) ,
url: 'http://127.0.0.1:5000/api/v1/device/graph'
}; 
axios.get(args).then(function (response) {
  console.log('response is : ' + response.data);
}).catch( 
    console.log
);}*/
var headers = {
          'Content-Type': 'application/json'
        }

axios.get( 'http://127.0.0.1:5000/api/v1/device/graph',JSON.stringify(params),
 { 
    headers
}).then((res) => {
console.log("post response: " + res);
}
).catch( 
    console.log
);

  }  


  return (
    <div className={classes.root}>
    <form className={classes.rform} form onSubmit={handleSubmit}>
     
 <FormControl margin ="normal" className ={classes.sec} fullWidth>
  <label className="reactSelectLabel">Location(s)</label>
  <Select
    className="reactSelect"
    name="location"
    placeholder="Location(s)"
    value={values.selectedOption}
    options={filterLocationsOptions}
    onChange={handleMultiChange}
    isMulti
  />
     </FormControl>
<FormControl margin ="normal" className ={classes.sec} fullWidth>
  <MuiPickersUtilsProvider utils={DateFnsUtils}>
    <Grid 
      container 
      justify="space-around"
    >
      <KeyboardDatePicker
        disableToolbar
        variant="inline"
        format="yyyy-MM-dd"
        margin="normal"
        id="date-picker-inline"
        label="Start Date"
        value={selectedDate}
        onChange={handleDateChange}
        KeyboardButtonProps={{
          'aria-label': 'change date',
        }}
      />                
    <KeyboardTimePicker
        disableToolbar
        variant="inline"
        margin="normal"
        id="time-picker"
        label=" Start Time "
        value={selectedDate}
        onChange={handleDateChange}
        KeyboardButtonProps={{
          'aria-label': 'change time',
        }}
      />
      </Grid>
  </MuiPickersUtilsProvider>
</FormControl>

 <FormControl margin ="normal" className ={classes.sec} fullWidth>
  <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Grid 
      container 
      justify="space-around"
    >
      <KeyboardDatePicker
        disableToolbar
        variant="inline"
        format="yyyy-MM-dd"
        margin="normal"
        id="date-picker-inline"
        label="End Date"
        value={selectedEndDate}
        onChange={handleEndDateChange}
        KeyboardButtonProps={{
          'aria-label': 'change end date',
        }}
      />                
      <KeyboardTimePicker
        disableToolbar
        variant="inline"
        margin="normal"
        id="time-picker"
        label=" End Time "
        value={selectedEndDate}
        onChange={handleEndDateChange}
        KeyboardButtonProps={{
          'aria-label': 'change end time',
        }}
      />
      </Grid>
  </MuiPickersUtilsProvider>
     </FormControl>
 <FormControl margin ="normal" className ={classes.sec} fullWidth>

   <label className="reactSelectLabel">Frequency</label>
  <Select
    className="reactSelect"
    name="chart-type"
    placeholder="Frequency"
    value={selectedFrequency}
    options={frequencyOptions}
    onChange={handleFrequencyChange}              
  />
     </FormControl>
 <FormControl margin ="normal" className ={classes.sec} fullWidth>
 <label className="reactSelectLabel">Degree of Cleaning</label>
  <Select
    className="reactSelect"
    name="chart-type"
    placeholder="Cleaness"
    value={selectedClean}
    options={degreeOfClean}
    onChange={handleCleanessChange}              
  /> </FormControl>

 <FormControl margin ="normal" className ={classes.sec} fullWidth>
  <label className="reactSelectLabel">File Type</label>
  <Select
    className="reactSelect"
    name="chart-type"
    placeholder="Type"
    value={selectedType}
    options={typeOptions}
    onChange={handleTypeChange}              
  />
 </FormControl>
 <FormControl margin ="normal" className ={classes.sec} fullWidth>
  <label className="reactSelectLabel">Pollutant</label>
  <Select
    className="reactSelect"
    name="pollutant"
    placeholder="Pollutant"
    value={selectedPollutant}
    options={pollutantOptions}
    onChange={handlePollutantChange}              
  />
 </FormControl>

 <FormControl margin ="normal" >
<Button color = "primary" className ={classes.button} type ="submit">Download</Button>
  </FormControl>
  </form>
    </div>
  );
};


export default Download;
