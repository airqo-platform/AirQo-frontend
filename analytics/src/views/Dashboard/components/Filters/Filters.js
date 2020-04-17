import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Card, CardContent, Grid,Button} from '@material-ui/core';
import Select from 'react-select';
import { useEffect, useState } from 'react';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import axios from 'axios'
//import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
//import PeopleIcon from '@material-ui/icons/PeopleOutlined';

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%'
  },
  content: {
    alignItems: 'center',
    display: 'flex'
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

const Filters = props => {
  const { className, ...rest } = props;

  const classes = useStyles();

  
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
      'http://127.0.0.1:5000/api/v1/dashboard/customisedchart', 
      JSON.stringify(filter),
      { headers: { 'Content-Type': 'application/json' } }
    ).then(res=> {
      console.log(res.data)
      
    }).catch(
      console.log
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
                  format="MM/dd/yyyy"
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
                  format="MM/dd/yyyy"
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

export default Filters;
