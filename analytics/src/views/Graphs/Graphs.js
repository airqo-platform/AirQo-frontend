import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Display, Filters } from './components';
import { Pie, Bar, Line } from 'react-chartjs-2';
import PropTypes from 'prop-types';
import { Card, CardContent, Grid, Typography, Button } from '@material-ui/core';
import clsx from 'clsx';
import Select from 'react-select';
import DateFnsUtils from '@date-io/date-fns';
import {MuiPickersUtilsProvider, KeyboardTimePicker, KeyboardDatePicker} from '@material-ui/pickers';
import axios from 'axios';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3)
  },
  content: {
    marginTop: theme.spacing(2)
  }
}));

/*const Graphs = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Grid
        container
        spacing={0.1}
      >
        <Grid
          item
          lg={8}
          sm={8}
          xl={8}
          xs={12}
        >
        <Display />
        </Grid>
        <Grid
          item
          lg={4}
          sm={4}
          xl={4}
          xs={12}
        >
        <Filters />
        </Grid>
      </Grid>
    </div>
  );
};*/

const Graphs = props => {
  const { className, ...rest } = props;

  const classes = useStyles();
  const [times, setTimes] =useState([]);
  const [pollutionValues, setPollutionValues] = useState([]);

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

  const chartTypeOptions = [
    { value: 'line', label: 'Line' },
    { value: 'bar', label: 'Bar' },
    { value: 'pie', label: 'Pie' }
  ];

  const [selectedChart, setSelectedChartType] =  useState({value: 'line' });

  const handleChartTypeChange = selectedChartType => {
    setSelectedChartType(selectedChartType);
  };

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

  let  handleSubmit = (e) => {
    e.preventDefault();

    let filter ={ 
      locations: values.selectedOption,
      startDate:  selectedDate,
      endDate:  selectedEndDate,
      chartType:  selectedChart.value,
      frequency:  selectedFrequency.value,
      pollutant: selectedPollutant.value,
      organisation_name: 'KCCA'     
    }
    console.log(JSON.stringify(filter));

    axios.post(
      'http://127.0.0.1:5000/api/v1/device/graph', 
      JSON.stringify(filter),
      { headers: { 'Content-Type': 'application/json' } }
    )
    .then(
      res=>{
        console.log(res.data);
        const myData = res.data;
        if ('time' in myData){
          let myTimes = [];
          let myValues = [];
          myData.forEach(element => {
            myTimes.push(element.time);
            myValues.push(element.pm2_5ConcMass.value);
          });
          setTimes(myTimes);
          setPollutionValues(myValues)
        }
        else{
          let myValues = [];
          myData.forEach(element => {
            myValues.push(element);
          });
          setPollutionValues(myValues)
        }

    }).catch(
      console.log
    )
  }

  

  if (selectedChart=='line'){
    return(
      <div className={classes.root}>
        <Grid
        container
        spacing = {0.1}
        >
          <Grid
          item
          lg={8}
          sm={8}
          xl={8}
          xs={12}
          >
          <div>
          <Line
          data= {
              {
              labels: times,
              datasets:[
                 {
                    label:'Line Graph showing Air Quality over time',
                    data: pollutionValues,
                    backgroundColor: 'rgba(75, 192, 192, 1)',
                    borderColor: 'rgba(0,0,0,1)'
                 }
              ]
           }
          }
          options={{
            title:{
              display:true,
              text: 'Air quality data over time',
            },
            legend:{
              display: true,
              position: 'right'
            },
            maintainAspectRatio: true
            }}/>
          </div>
          </Grid>

          <Grid
          item
          lg={4}
          sm={4}
          xl={4}
          xs={12}
          >
          <div>
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      <CardContent>
        <Grid
          container
          justify="space-between"
        >
        </Grid>

      <form onSubmit={handleSubmit}>

<div className={classes.formControl}>
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
</div>

<div className={classes.formControl}> 
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
        label="Time Picker "
        value={selectedDate}
        onChange={handleDateChange}
        KeyboardButtonProps={{
          'aria-label': 'change time',
        }}
      />
    </Grid>
  </MuiPickersUtilsProvider>
</div>

<div className={classes.formControl}>
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
        label="Time Picker "
        value={selectedEndDate}
        onChange={handleEndDateChange}
        KeyboardButtonProps={{
          'aria-label': 'change end time',
        }}
      />
    </Grid>
  </MuiPickersUtilsProvider>
</div>

<div className={classes.formControl}>
  <label className="reactSelectLabel">Chart Type</label>
  <Select
    className="reactSelect"
    name="chart-type"
    placeholder="Chart Type"
    value={selectedChart}
    options={chartTypeOptions}
    onChange={handleChartTypeChange}              
  />
</div>

<div className={classes.formControl}>
  <label className="reactSelectLabel">Frequency</label>
  <Select
    className="reactSelect"
    name="chart-type"
    placeholder="Frequency"
    value={selectedFrequency}
    options={frequencyOptions}
    onChange={handleFrequencyChange}              
  />
</div>

<div className={classes.formControl}>
  <label className="reactSelectLabel">Pollutant</label>
  <Select
    className="reactSelect"
    name="pollutant"
    placeholder="Pollutant"
    value={selectedPollutant}
    options={pollutantOptions}
    onChange={handlePollutantChange}              
  />
</div>

<div className={classes.formControl}>
  <Button 
    variant="contained" 
    color="primary"              
    type="submit"
  > Generate Graph
  </Button>
</div>       
</form>

</CardContent>
    </Card>

    </div>

    </Grid>

        </Grid>
      </div>
    )

  }
  else if (selectedChart=='pie'){

    return(
      <div className={classes.root}>
        <Grid
        container
        spacing = {0.1}
        >
          <Grid
          item
          lg={8}
          sm={8}
          xl={8}
          xs={12}
          >
          <div>
          <Pie
          data= {
            {
              labels: ['Good', 'Moderate', 'UH4SG', 'Unhealthy', 'Very Unhealthy', 'Hazardous', 'Other'],
              datasets: [{
                label: 'Air Quality',
                data: pollutionValues, 
                backgroundColor: ['Green', 'Yellow', 'Orange', 'Red','Purple', 'Maroon', 'Grey']
              }
            ]
          }
          }
          options={{
            title:{
              display:true,
              text: 'Air quality data over time',
            },
            legend:{
              display: true,
              position: 'right'
            },
            maintainAspectRatio: true
            }}/>
          </div>
          </Grid>

          <Grid
          item
          lg={4}
          sm={4}
          xl={4}
          xs={12}
          >
          <div>
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      <CardContent>
        <Grid
          container
          justify="space-between"
        >
        </Grid>

      <form onSubmit={handleSubmit}>

<div className={classes.formControl}>
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
</div>

<div className={classes.formControl}> 
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
        label="Time Picker "
        value={selectedDate}
        onChange={handleDateChange}
        KeyboardButtonProps={{
          'aria-label': 'change time',
        }}
      />
    </Grid>
  </MuiPickersUtilsProvider>
</div>

<div className={classes.formControl}>
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
        label="Time Picker "
        value={selectedEndDate}
        onChange={handleEndDateChange}
        KeyboardButtonProps={{
          'aria-label': 'change end time',
        }}
      />
    </Grid>
  </MuiPickersUtilsProvider>
</div>

<div className={classes.formControl}>
  <label className="reactSelectLabel">Chart Type</label>
  <Select
    className="reactSelect"
    name="chart-type"
    placeholder="Chart Type"
    value={selectedChart}
    options={chartTypeOptions}
    onChange={handleChartTypeChange}              
  />
</div>

<div className={classes.formControl}>
  <label className="reactSelectLabel">Frequency</label>
  <Select
    className="reactSelect"
    name="chart-type"
    placeholder="Frequency"
    value={selectedFrequency}
    options={frequencyOptions}
    onChange={handleFrequencyChange}              
  />
</div>

<div className={classes.formControl}>
  <label className="reactSelectLabel">Pollutant</label>
  <Select
    className="reactSelect"
    name="pollutant"
    placeholder="Pollutant"
    value={selectedPollutant}
    options={pollutantOptions}
    onChange={handlePollutantChange}              
  />
</div>

<div className={classes.formControl}>
  <Button 
    variant="contained" 
    color="primary"              
    type="submit"
  > Generate Graph
  </Button>
</div>       
</form>

</CardContent>
    </Card>

    </div>

    </Grid>

        </Grid>
      </div>
    )


  }
  else{

    return(
      <div className={classes.root}>
        <Grid
        container
        spacing = {0.1}
        >
          <Grid
          item
          lg={8}
          sm={8}
          xl={8}
          xs={12}
          >
          <div>
          <Bar
          data= {
              {
              labels: times,
              datasets:[
                 {
                    label:'Bar Graph showing Air Quality over time',
                    data: pollutionValues,
                    backgroundColor: 'rgba(75, 192, 192, 1)',
                    borderColor: 'rgba(0,0,0,1)'
                 }
              ]
           }
          }
          options={{
            title:{
              display:true,
              text: 'Air quality data over time',
            },
            legend:{
              display: true,
              position: 'right'
            },
            maintainAspectRatio: true
            }}/>
          </div>
          </Grid>

          <Grid
          item
          lg={4}
          sm={4}
          xl={4}
          xs={12}
          >
          <div>
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      <CardContent>
        <Grid
          container
          justify="space-between"
        >
        </Grid>

      <form onSubmit={handleSubmit}>

<div className={classes.formControl}>
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
</div>

<div className={classes.formControl}> 
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
        label="Time Picker "
        value={selectedDate}
        onChange={handleDateChange}
        KeyboardButtonProps={{
          'aria-label': 'change time',
        }}
      />
    </Grid>
  </MuiPickersUtilsProvider>
</div>

<div className={classes.formControl}>
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
        label="Time Picker "
        value={selectedEndDate}
        onChange={handleEndDateChange}
        KeyboardButtonProps={{
          'aria-label': 'change end time',
        }}
      />
    </Grid>
  </MuiPickersUtilsProvider>
</div>

<div className={classes.formControl}>
  <label className="reactSelectLabel">Chart Type</label>
  <Select
    className="reactSelect"
    name="chart-type"
    placeholder="Chart Type"
    value={selectedChart}
    options={chartTypeOptions}
    onChange={handleChartTypeChange}              
  />
</div>

<div className={classes.formControl}>
  <label className="reactSelectLabel">Frequency</label>
  <Select
    className="reactSelect"
    name="chart-type"
    placeholder="Frequency"
    value={selectedFrequency}
    options={frequencyOptions}
    onChange={handleFrequencyChange}              
  />
</div>

<div className={classes.formControl}>
  <label className="reactSelectLabel">Pollutant</label>
  <Select
    className="reactSelect"
    name="pollutant"
    placeholder="Pollutant"
    value={selectedPollutant}
    options={pollutantOptions}
    onChange={handlePollutantChange}              
  />
</div>

<div className={classes.formControl}>
  <Button 
    variant="contained" 
    color="primary"              
    type="submit"
  > Generate Graph
  </Button>
</div>       
</form>

</CardContent>
    </Card>

    </div>

    </Grid>

        </Grid>
      </div>
    )

  }


  return (
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      <CardContent>
        <Grid
          container
          justify="space-between"
        >
          {/* 
          <Grid item>
            <Typography
              className={classes.title}
              color="textSecondary"
              gutterBottom
              variant="body2"
            >
              Filters
            </Typography>
          </Grid>
          */}
        </Grid>

        <form onSubmit={handleSubmit}>

<div className={classes.formControl}>
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
</div>

<div className={classes.formControl}> 
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
        label="Time Picker "
        value={selectedDate}
        onChange={handleDateChange}
        KeyboardButtonProps={{
          'aria-label': 'change time',
        }}
      />
    </Grid>
  </MuiPickersUtilsProvider>
</div>

<div className={classes.formControl}>
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
        label="Time Picker "
        value={selectedEndDate}
        onChange={handleEndDateChange}
        KeyboardButtonProps={{
          'aria-label': 'change end time',
        }}
      />
    </Grid>
  </MuiPickersUtilsProvider>
</div>

<div className={classes.formControl}>
  <label className="reactSelectLabel">Chart Type</label>
  <Select
    className="reactSelect"
    name="chart-type"
    placeholder="Chart Type"
    value={selectedChart}
    options={chartTypeOptions}
    onChange={handleChartTypeChange}              
  />
</div>

<div className={classes.formControl}>
  <label className="reactSelectLabel">Frequency</label>
  <Select
    className="reactSelect"
    name="chart-type"
    placeholder="Frequency"
    value={selectedFrequency}
    options={frequencyOptions}
    onChange={handleFrequencyChange}              
  />
</div>

<div className={classes.formControl}>
  <label className="reactSelectLabel">Pollutant</label>
  <Select
    className="reactSelect"
    name="pollutant"
    placeholder="Pollutant"
    value={selectedPollutant}
    options={pollutantOptions}
    onChange={handlePollutantChange}              
  />
</div>

<div className={classes.formControl}>
  <Button 
    variant="contained" 
    color="primary"              
    type="submit"
  > Generate Graph
  </Button>
</div>       
</form>

</CardContent>
    </Card>
  );
};
Filters.propTypes = {
  className: PropTypes.string
};


class BarGraph extends React.Component{
  render(){
    return(
        <div>
        <Bar
          data={ 
            {
              //labels: times,
              datasets:[
                 {
                    label:'Bar Graph showing Air Quality over time',
                    //data: pollutionValues,
                    backgroundColor: 'rgba(75, 192, 192, 1)',
                    borderColor: 'rgba(0,0,0,1)'
                   /* backgroundColor:[
                     'rgba(255,105,145,0.6)',
                     'rgba(155,100,210,0.6)',
                     'rgba(90,178,255,0.6)',
                     'rgba(240,134,67,0.6)',
                     'rgba(120,120,120,0.6)',
                     'rgba(250,55,197,0.6)'
                  ]*/
                 }
              ]
           }

          }
          options={{
            title:{
              display:true,
              text: 'Air quality data over time',
            },
            legend:{
              display: true,
              position: 'right'
            },
            maintainAspectRatio: true
            }}/>
     </div>
      )
      /*<div>
        <Bar
          data:{ state },
          options:{{
            title:{
              display:true,
              text: 'Air quality data over time',
            },
            legend:{
              display: true,
              position: 'right'
            }
          }}
          />
      </div>*/
  }
}


export default Graphs;
//module.exports = App;                              
