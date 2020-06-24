/* eslint-disable */
import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker
} from '@material-ui/pickers';

import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Divider,
  Grid,
  Button,
  TextField
} from '@material-ui/core';

const defaults = [
  {
    value: 'None',
    label: 'None'
  },
  {
    value: 'PM10',
    label: 'PM1O'
  },
  {
    value: 'PM2.5',
    label: 'PM2.5'
  },
  {
    value: 'NO2',
    label: 'NO2'
  }
];

const charts = [
  {
    value: 'None',
    label: 'None'
  },
  {
    value: 'Line',
    label: 'Line'
  },
  {
    value: 'Bar',
    label: 'Bar'
  },
  {
    value: 'Pie',
    label: 'Pie'
  }
];

const titles = [
  {
    value: 'None',
    label: 'None'
  },
  {
    value: 'Chart One',
    label: 'Chart One'
  },
  {
    value: 'Chart Two',
    label: 'Chart Two'
  },
  {
    value: 'Chart Three',
    label: 'Chart Three'
  },
  {
    value: 'Chart Four',
    label: 'Chart Four'
  }
];

const frequency = [
  {
    value: 'None',
    label: 'None'
  },
  {
    value: 'Daily',
    label: 'Daily'
  },
  {
    value: 'Hourly',
    label: 'Hourly'
  },
  {
    value: 'Monthly',
    label: 'Monthly'
  }
];

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120
  },
  selectEmpty: {
    marginTop: theme.spacing(2)
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
    paddingLeft: '0px',
    paddingRight: '0px',
    paddingBottom: '15px',
    paddingTop: '15px'
  },
  root: {},
  details: {
    display: 'flex'
  }
}));

const SetDefaults = props => {
  const {
    className,
    mappedAuth,
    mappedUpdateAuthenticatedUser,
    mappeduserState,
    ...rest
  } = props;
  const { user } = mappedAuth;

  const classes = useStyles();

  const initialState = {
    pollutant: '',
    frequency: '',
    startDate: '2017-05-24T10:30',
    endDate: '2020-05-24T10:30',
    chartTitle: '',
    chartType: ''
  };

  const [form, setState] = useState(initialState);

  useEffect(() => {
    var anchorElem = document.createElement('link');
    anchorElem.setAttribute(
      'href',
      'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css'
    );
    anchorElem.setAttribute('rel', 'stylesheet');
    anchorElem.setAttribute('id', 'logincdn');
  });

  const onChange = event => {
    setState({
      ...form,
      [event.target.id]: event.target.value
    });
  };

  const clearState = () => {
    setState({ ...initialState });
  };

  const onSubmit = e => {
    e.preventDefault();
    const userData = {
      id: user._id,
      pollutant: form.pollutant,
      endDate: form.endDate,
      startDate: form.startDate,
      frequency: form.frequency,
      chartType: form.chartType,
      chartTitle: form.chartTitle
    };
    console.log(userData);
    console.log('the data from end date:');
    console.dir(form.endDate);
    console.log('the data from start date:');
    console.dir(form.startDate);
    console.log('the user ID:');
    console.log(user._id);
    props.mappedSetDefaults(userData);
    clearState();
  };

  //   useEffect(() => {
  // try{
  //   const abortController = new AbortController()
  // const signal = abortController.signal;
  //     props.fetchDefaults(user._id, signal);
  //     return function cleanup(){
  //       abortController.abort();
  //     }
  // }
  // catch(e){
  // console.log(e);
  // }
  //   }, []);

  return (
    <Grid container spacing={4}>
      <Grid item md={4} xs={12}>
        <Card {...rest} className={clsx(classes.root, className)}>
          <CardHeader
            subheader="Please enter your preferences for the Landing Page"
            title="User Defaults"
          />
          <Divider />
          <CardContent>
            {
              <div>
                <TextField
                  id="pollutant"
                  select
                  label="Pollutant"
                  className={classes.textField}
                  value={form.privilege}
                  onChange={onChange}
                  SelectProps={{
                    native: true,
                    MenuProps: {
                      className: classes.menu
                    }
                  }}
                  helperText="Please select the pollutant"
                  margin="normal"
                  variant="outlined">
                  {defaults.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </TextField>

                <TextField
                  id="frequency"
                  select
                  label="Frequency"
                  className={classes.textField}
                  value={form.frequency}
                  onChange={onChange}
                  SelectProps={{
                    native: true,
                    MenuProps: {
                      className: classes.menu
                    }
                  }}
                  helperText="Please select the frequency"
                  margin="normal"
                  variant="outlined">
                  {frequency.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </TextField>

                <TextField
                  id="chartType"
                  select
                  label="chartType"
                  className={classes.textField}
                  value={form.chartType}
                  onChange={onChange}
                  SelectProps={{
                    native: true,
                    MenuProps: {
                      className: classes.menu
                    }
                  }}
                  helperText="Please select the chat type"
                  margin="normal"
                  variant="outlined">
                  {charts.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </TextField>

                <TextField
                  id="chartTitle"
                  select
                  label="chartTitle"
                  className={classes.textField}
                  value={form.chartTitle}
                  onChange={onChange}
                  SelectProps={{
                    native: true,
                    MenuProps: {
                      className: classes.menu
                    }
                  }}
                  helperText="Please select the chat title"
                  margin="normal"
                  variant="outlined">
                  {titles.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </TextField>

                {/* start time and start date */}
                <TextField
                  id="startDate"
                  label="Start Date and Time"
                  type="datetime-local"
                  value={form.startDate}
                  onChange={onChange}
                  className={classes.textField}
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true
                  }}
                />
                {/* end time and end date */}
                <TextField
                  id="endDate"
                  label="End Date and Time"
                  type="datetime-local"
                  value={form.endDate}
                  onChange={onChange}
                  variant="outlined"
                  className={classes.textField}
                  InputLabelProps={{
                    shrink: true
                  }}
                />
              </div>
            }
          </CardContent>
          <Divider />
          <CardActions>
            <Button color="primary" variant="contained" onClick={onSubmit}>
              Save Defaults
            </Button>
          </CardActions>
        </Card>
      </Grid>
    </Grid>
  );
};

SetDefaults.propTypes = {
  fetchDefaults: PropTypes.func.isRequired
};

export default SetDefaults;
