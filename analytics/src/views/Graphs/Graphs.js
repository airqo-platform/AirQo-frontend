import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Pie, Bar, Line } from 'react-chartjs-2';
import PropTypes from 'prop-types';
import { Card, CardContent, Grid, Button,Typography } from '@material-ui/core';
import clsx from 'clsx';
import Select from 'react-select';
import DateFnsUtils from '@date-io/date-fns';
import {MuiPickersUtilsProvider, KeyboardTimePicker, KeyboardDatePicker} from '@material-ui/pickers';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import LoadingSpinner from './loadingSpinner';
import 'chartjs-plugin-annotation';


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
}));

const Graphs = props => {
  const { className, ...rest } = props;
  let params = useParams();
  const classes = useStyles();
  const [times, setTimes] =useState([]);
  const [pollutionValues, setPollutionValues] = useState([]);
  const [backgroundColors, setBackgroundColors] = useState([]);
  const [loading, setLoading] = useState({value: false})

  useEffect(() => {
    let startdate = new Date();
    startdate.setMonth(startdate.getMonth() - 1);
    startdate.setHours(0,0,0,0);
  
    let effectFilter ={ 
      location: 'Civic Centre',
      startDate: startdate,
      endDate:  new Date(),
      chartType:  'bar',
      frequency:  'daily',
      pollutant: 'PM 2.5',
      organisation_name: 'KCCA' 
    }
    setLoading(true);

    axios.post(
      //'https://analytcs-bknd-service-dot-airqo-250220.uc.r.appspot.com/api/v1/device/graph',
      'http://127.0.0.1:5000/api/v1/device/graph', 
      JSON.stringify(effectFilter),
      { headers: { 'Content-Type': 'application/json' } }
      
    )
    .then(
      res=>{
        const myData = res.data;
        console.log(myData);
        setLoading(false);
        let myValues = [];
        let myTimes = [];
        let myColors = [];
        myData.forEach(element => {
          var newTime = new Date(element.time);
          var finalTime = newTime.getFullYear()+'-'+appendLeadingZeroes(newTime.getMonth()+1)+'-'+appendLeadingZeroes(newTime.getDate())+
          ' '+appendLeadingZeroes(newTime.getHours())+':'+ appendLeadingZeroes(newTime.getMinutes())+':'+appendLeadingZeroes(newTime.getSeconds());
          myTimes.push(finalTime);
          myColors.push(element.backgroundColor)
          myValues.push(element.characteristics.pm2_5ConcMass.value);
          });
          setTimes(myTimes);
          setPollutionValues(myValues);
          setBackgroundColors(myColors)
    }).catch(
      console.log
    )
  },[]);

  const [myChartType, setMyChartType] = useState({value: ""});
  const [myPollutant, setMyPollutant] = useState({value: ""});
  const [myLocation, setMyLocation] = useState({value:""})
  

  var startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 1);
  startDate.setHours(0,0,0,0);


  const [selectedDate, setSelectedStartDate] = useState(startDate);

  const handleDateChange = (date) => {
    setSelectedStartDate(date);
  };

  const [selectedEndDate, setSelectedEndDate] = useState(new Date());

  const handleEndDateChange = (date) => {
    setSelectedEndDate(date);
  };

  const [filterLocations,setFilterLocations] = useState([]);

  useEffect(() => {
    fetch('https://analytcs-bknd-service-dot-airqo-250220.uc.r.appspot.com/api/v1/dashboard/monitoringsites/locations?organisation_name=KCCA')
    //fetch('http://127.0.0.1:5000/api/v1/dashboard/monitoringsites/locations?organisation_name=KCCA')
      .then(res => res.json())
      .then((filterLocationsData) => {
        setFilterLocations(filterLocationsData.airquality_monitoring_sites)
        //console.log(filterLocationsData)
      })
      .catch(console.log)
  },[]);

  const filterLocationsOptions = filterLocations

  //const [values, setReactSelectValue] = useState({ selectedOption: [] });

  //const handleMultiChange = selectedOption => {
   // setReactSelectValue({ selectedOption });
  //}

  const [selectedLocation, setSelectedLocation] = useState({value: 'Civic Centre'})
  const handleLocationChange = selectedLocation => {
    setSelectedLocation(selectedLocation);
  };

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

  function generateAnnotations(pollutant){
    var annotations;
    if(pollutant == 'PM 2.5'){
      annotations = [{
        type: 'line',
        mode: 'horizontal',
        scaleID: 'y-axis-0',
        value: 0,
        borderColor: 'green',
        borderWidth: 2, 
      },
      {
        type: 'line',
        mode: 'horizontal',
        scaleID: 'y-axis-0',
        value: 12.1,
        borderColor: 'yellow',
        borderWidth: 2,
      },
      {
        type: 'line',
        mode: 'horizontal',
        scaleID: 'y-axis-0',
        value: 35.5,
        borderColor: 'orange',
        borderWidth: 2,
      },

      {
        type: 'line',
        mode: 'horizontal',
        scaleID: 'y-axis-0',
        value: 55.5,
        borderColor: 'red',
        borderWidth: 2,
      },
      {
        type: 'line',
        mode: 'horizontal',
        scaleID: 'y-axis-0',
        value: 150.5,
        borderColor: 'purple',
        borderWidth: 2,
      },
    ]
     
    }
    else if (pollutant == 'PM 10'){
      annotations = [{
        type: 'line',
        mode: 'horizontal',
        scaleID: 'y-axis-0',
        value: 0,
        borderColor: 'green',
        borderWidth: 2, 
      },
      {
        type: 'line',
        mode: 'horizontal',
        scaleID: 'y-axis-0',
        value: 55,
        borderColor: 'yellow',
        borderWidth: 2,
      },
    ]
    }
    else{
      annotations = [{
        type: 'line',
        mode: 'horizontal',
        scaleID: 'y-axis-0',
        value: 0,
        borderColor: 'green',
        borderWidth: 2, 
      },
    ]
    }
    return annotations;
  }

  function appendLeadingZeroes(n){
    if(n <= 9){
      return "0" + n;
    }
    return n
  }

  function generateLabel(pollutant){
    let superString="3";
    if (pollutant=='PM 2.5'){
      return "PM 2.5 (µg/m3)"
      //return "PM 2.5 Concentration"
    }
    else if (pollutant=='PM 10'){
      return "PM 10 (µg/m3)"
      //return "PM 10 Concentration"
    }
    else{
      return "NO2 Concentration"
    }

  }

  let  handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    let filter ={ 
      location: selectedLocation.label,
      startDate:  selectedDate,
      endDate:  selectedEndDate,
      chartType:  selectedChart.value,
      frequency:  selectedFrequency.value,
      pollutant: selectedPollutant.value,
      organisation_name: 'KCCA'     
    }
    console.log(JSON.stringify(filter));

    axios.post(
      //'https://analytcs-bknd-service-dot-airqo-250220.uc.r.appspot.com/api/v1/device/graph',
      'http://127.0.0.1:5000/api/v1/device/graph', 
      JSON.stringify(filter),
      { headers: { 'Content-Type': 'application/json' } }
    )
    .then(
      res=>{
        const myData = res.data;
        console.log(myData);
        setLoading(false)
        setMyChartType(selectedChart.value);
        setMyPollutant(selectedPollutant.value);
        setMyLocation(selectedLocation.label);
        if (typeof myData[0] == 'number'){
          let myValues = [];
          myData.forEach(element => {
            myValues.push(element);
          });
          setPollutionValues(myValues)
        }

        else if (typeof myData[0]== 'object'){
          let myTimes = [];
          let myValues = [];
          let myColors = [];
          myData.forEach(element => {
            var newTime = new Date(element.time);
            var finalTime = newTime.getFullYear()+'-'+appendLeadingZeroes(newTime.getMonth()+1)+'-'+appendLeadingZeroes(newTime.getDate())+
            ' '+appendLeadingZeroes(newTime.getHours())+':'+ appendLeadingZeroes(newTime.getMinutes())+':'+appendLeadingZeroes(newTime.getSeconds());
            myTimes.push(finalTime);
            
            myColors.push(element.backgroundColor)
            if (element.hasOwnProperty('characteristics') && element.characteristics.hasOwnProperty('pm2_5ConcMass')){
              myValues.push(element.characteristics.pm2_5ConcMass.value);
            }
            else if (element.hasOwnProperty('characteristics') && element.characteristics.hasOwnProperty('pm10ConcMass')){
              myValues.push(element.characteristics.pm10ConcMass.value);
            }
            else if (element.hasOwnProperty('characteristics') && element.characteristics.hasOwnProperty('no2Conc')){
              myValues.push(element.characteristics.no2Conc.value);
            }
            else{
              console.log('none of the above');
            }
          });
          setTimes(myTimes);
          setPollutionValues(myValues);
          setBackgroundColors(myColors)
        }
        else{
          //pass
        }

    }).catch(
      console.log
    )
  }

  
  if (myChartType=='line'){
    return(
      <div className={classes.root}>
        <Grid
        container
        spacing = {1}
        >
          <Grid
          item
          lg={8}
          sm={8}
          xl={8}
          xs={12}
          >
          
          <Card
            {...rest}
            className={clsx(classes.root, className)}
          >
            <CardContent>
              <Grid
                container
                justify="space-between"
              >
              <Grid item>
                <Typography
                  className={classes.title}
                  color="textSecondary"
                  gutterBottom
                  variant="body2"
                >
                  {params.locationname}
                </Typography>
              </Grid>           
              <Grid
              item
              lg={12}
              sm={12}
              xl={12}
              xs={12}
              >
              <div>
              {loading ? <LoadingSpinner /> : 
              <Line
              data= {
                  {
                  labels: times,
                  datasets:[
                    {
                        label:myPollutant,
                        data: pollutionValues,
                        backgroundColor: backgroundColors,
                        borderColor: 'blue',
                        borderWidth: 1,
                        fill: false,
                        pointStyle: 'star',
                        pointRadius: 3
                      
                    }
                  ]
              }
              }
              options={{
                title:{
                  display:true,
                  text: 'Line graph showing '+myPollutant+' data in '+myLocation,
                  fontColor: "black",
                  fontSize: 18,
                  fontWeight: 0
                },
                annotation: {
                  annotations: generateAnnotations(myPollutant)
                },

                scales: {
                  yAxes: [{
                    scaleLabel: {
                      display: true,
                      labelString: generateLabel(myPollutant),
                      fontWeight:4,
                      fontColor: "black",
                      fontSize:15,
                      padding: 10
                    },
                    ticks: {
                      fontColor:"black"                 
                      },
                    gridLines:{
                      lineWidth: 1
                    }
                  }],
                  xAxes: [{
                    scaleLabel: {
                      display: true,
                      labelString: 'Time',
                      fontWeight:4,
                      fontColor: "black",
                      fontSize: 20,
                      padding: 6
                    },
                    ticks: {
                      fontColor:"black"                 
                      },
                    gridLines:{
                      lineWidth: 1
                    }

                  }],
                },
                /*legend:{
                  display: true,
                  //position: 'right'
                },*/
                maintainAspectRatio: true,
                responsive: true
                }}
              />}
              </div>
              </Grid>
          </Grid>
          </CardContent>
    </Card>
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
        <label className="reactSelectLabel">Location</label>
        <Select
          className="reactSelect"
          name="location"
          placeholder="Location"
          value={selectedLocation}
          options={filterLocationsOptions}
          onChange={handleLocationChange}
          required
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
  else if (myChartType=='pie'){

    return(
      <div className={classes.root}>
        <Grid
        container
        spacing = {1}
        >
          <Grid
          item
          lg={8}
          sm={8}
          xl={8}
          xs={12}
          >

           <div>
          {loading ? <LoadingSpinner /> : 
          <Pie
          data= {
            {
              labels: ['Good', 'Moderate', 'UH4SG', 'Unhealthy', 'Very Unhealthy', 'Hazardous', 'Other'],
              datasets: [{
                label: myPollutant,
                data: pollutionValues, 
                backgroundColor: ['Green', 'Yellow', 'Orange', 'Red','Purple', 'Maroon', 'Grey'],
                hoverBackgroundColor: ['rgba(15,128,0,0.5)', 'rgba(255,235,10,0.5)', 'rgba(251,117,14,0.5)', 'rgba(251,14,14,0.5)',
                'rgba(102,0,128,0.5)', 'rgba(128,0,0,0.5)', 'rgba(77,77,77,0.5)'],
                hoverBorderWidth: 8
              }
            ]
          }
          }
          options={
            
            {
            title:{
              display:true,
              text: 'Pie Chart showing '+ myPollutant+ ' data in '+myLocation,
              fontColor: "black",
              fontSize: 20,
              fontWeight: 5
            },

            tooltips: {
              callbacks: {
                label: function(tooltipItem, data) {
                  var allData = data.datasets[tooltipItem.datasetIndex].data;
                  var tooltipLabel = data.labels[tooltipItem.index];
                  var tooltipData = allData[tooltipItem.index];
                  var total = 0;
                  for (var i in allData) {
                    total += allData[i];
                  }
                  var tooltipPercentage = Math.round((tooltipData / total) * 100);
                  //return tooltipLabel + ': ' + tooltipData + ' (' + tooltipPercentage + '%)';
                  return tooltipLabel + ': ' + tooltipPercentage + '%';
                }
              }
            },
            /*legend:{
              display: true,
              position: 'right'
            },*/
            maintainAspectRatio: true,
            responsive: true
            }}/>}
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
  <label className="reactSelectLabel">Location</label>
  <Select
    className="reactSelect"
    name="location"
    placeholder="Location"
    value={selectedLocation}
    options={filterLocationsOptions}
    onChange={handleLocationChange}
    required
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

else if (myChartType=='bar'){

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
        {loading ? <LoadingSpinner /> : 
        <Bar
        data= {
            {
            labels: times,
            datasets:[
               {
                  label:myPollutant,
                  data: pollutionValues,
                  backgroundColor: backgroundColors,
                  borderColor: 'rgba(0,0,0,1)',   
                  borderWidth: 1
               }
            ]
         }
        }
        options={{
          title:{
            display:true,
            text: 'Bar graph showing '+myPollutant+ ' data in '+myLocation,
            fontColor: "black",
            fontSize: 20,
            fontWeight:5
          },

          scales: {
            yAxes: [{
              scaleLabel: {
                display: true,
                labelString: generateLabel(myPollutant),
                fontWeight:4,
                fontColor: "black",
                fontSize:15,
                padding: 10
              },
              ticks: {
                fontColor:"black"                 
                },
              gridLines:{
                lineWidth: 1
              }
            }],
            xAxes: [{
              scaleLabel: {
                display: true,
                labelString: 'Time',
                fontWeight:4,
                fontColor: "black",
                fontSize: 20,
                padding: 6
              },
              ticks: {
                fontColor:"black"                 
                },
              gridLines:{
                lineWidth: 1
              }

            }],
          },
         /* legend:{
            display: true,
            position: 'right'
          },*/
          maintainAspectRatio: true,
          responsive: true
          }}/>}
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
        <label className="reactSelectLabel">Location</label>
        <Select
        className="reactSelect"
        name="location"
        placeholder="Location"
        value={selectedLocation}
        options={filterLocationsOptions}
        onChange={handleLocationChange}
        required
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
        spacing = {1}
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
                  label:'PM2.5(µg/m3)',
                  data: pollutionValues,
                  backgroundColor: backgroundColors,
                  borderColor: 'rgba(0,0,0,1)',   
                  borderWidth: 1
               }
            ]
         }
        }
        options={{
          title:{
            display:true,
            text: 'Bar graph showing PM 2.5 data at KCCA',
            fontColor: "black",
            fontWeight: 5,
            fontSize: 20
          },
          scales: {
            yAxes: [{
              scaleLabel: {
                display: true,
                labelString: 'PM2.5(µg/m3)',
                fontWeight:4,
                fontColor: "black",
                fontSize:15,
                padding: 10
              },
              ticks: {
                fontColor:"black"                 
                },
              gridLines:{
                lineWidth: 1
              }
            }],
            xAxes: [{
              scaleLabel: {
                display: true,
                labelString: 'Time',
                fontWeight:4,
                fontColor: "black",
                fontSize: 20,
                padding: 6
              },
              ticks: {
                fontColor:"black"                 
                },
              gridLines:{
                lineWidth: 1
              }

            }],
          },
         /* legend:{
            display: true,
            position: 'right'
          },*/
          maintainAspectRatio: true,
          responsive: true
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
  <label className="reactSelectLabel">Location</label>
  <Select
    className="reactSelect"
    name="location"
    placeholder="Location"
    value={selectedLocation}
    options={filterLocationsOptions}
    onChange={handleLocationChange}
    required
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
}


Graphs.propTypes = {
  className: PropTypes.string
};

export default Graphs;