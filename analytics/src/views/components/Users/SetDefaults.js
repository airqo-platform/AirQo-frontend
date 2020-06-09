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
    KeyboardDatePicker,
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
    label: 'None',
  },
  {
    value: 'PM10',
    label: 'PM1O',
  },
  {
    value: 'PM2.5',
    label: 'PM2.5',
  },
  {
    value: 'NO2',
    label: 'NO2',
  },
];


const frequency = [
  {
    value: 'None',
    label: 'None',
  },
  {
    value: 'Daily',
    label: 'Daily',
  },
  {
    value: 'Hourly',
    label: 'Hourly',
  },
  {
    value: 'Monthly',
    label: 'Monthly',
  },
];


const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 200,
    },
    root: {},
    details: {
      display: 'flex'
    },

}));


const  SetDefaults = (props) => {

  const { className, mappedAuth,  mappedUpdateAuthenticatedUser, mappeduserState, ...rest } = props;
  const { user } = mappedAuth;

    const classes = useStyles();

    const initialState = {
      pollutant: '',
      frequency:'',
      start_date: '2017-05-24T10:30',
      end_date: '2020-05-24T10:30',
    }

    const [form, setState] = useState(initialState);

    const onChange = event => {
      setState({
        ...form,
        [event.target.id]: event.target.value
      });
    };    

    const clearState = ()=>{
      setState({...initialState});
    };
  
    const onSubmit = (e) => {
      e.preventDefault();
      const userData = {
        id: user._id,
        pollutant: form.pollutant,
        end_date: form.end_date,
        start_date: form.start_date,
        frequency: form.frequency
      };
      console.log(userData);
      console.log("the data from end date:")
      console.dir(form.end_date);
      console.log("the data from start date:")
      console.dir(form.start_date);
      console.log("the user ID:")
      console.log(user._id);
      props.mappedSetDefaults(userData);
      clearState();
    };

    // useEffect(() => {
    //   props.fetchDefaults()
    // }, []);
  
    return (
<Card
{...rest}
className={clsx(classes.root, className)}
>

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
              className: classes.menu,
            },
          }}
          helperText="Please select the pollutant"
          margin="normal"
          variant="outlined"
        >
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
              className: classes.menu,
            },
          }}
          helperText="Please select the frequency"
          margin="normal"
          variant="outlined"
        >
          {frequency.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </TextField>

{/* start time and start date */}
  <TextField
        id="start_date"
        label="Start Date and Time"
        type="datetime-local"
        value={form.start_date}
        onChange={onChange}
        className={classes.textField}
        InputProps={{ disableUnderline: true }}
        InputLabelProps={{
          shrink: true,
        }}
      />
{/* end time and end date */}
 <TextField
        id="end_date"
        label="End Date and Time"
        type="datetime-local"
        value={form.end_date}
        onChange={onChange}
        InputProps={{ disableUnderline: true }}
        className={classes.textField}
        InputLabelProps={{
          shrink: true,
        }}
      />
</div>

}
  </CardContent>
  <Divider />
  <CardActions>
    <Button
      color="primary"
      variant="contained"
      onClick={onSubmit}
      >
      Save Defaults
    </Button>
  </CardActions>
</Card>
    );
}

SetDefaults.propTypes = {
  fetchDefaults: PropTypes.func.isRequired
};

export default SetDefaults;