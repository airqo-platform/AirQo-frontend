/* eslint-disable */
import React, { useState } from 'react';
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
    const { 
      className, 
      mappeduserState,  
      mappedAuth, 
      mappedUpdateAuthenticatedUser,
      ...rest } = props;
    const classes = useStyles();
    // const [age, setAge] = React.useState('');

    // const handleChange = (event) => {
    //     setAge(event.target.value);
    // };
    const [selectedDate, setSelectedDate] = React.useState(new Date('2014-08-18T21:11:54'));

    const handleStartDateChange = (date) => {
        setSelectedDate(date);
    };

    const handleEndDateChange = (date) => {
        setSelectedDate(date);
    };

    const initialState = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      state: '',
      country: ''
    }

    const [values, setValues] = useState(initialState);

    const handleChange = event => {
      setValues({
        ...values,
        [event.target.name]: event.target.value
      });
    };    

    const clearState = ()=>{
      setValues({...initialState});
    };
  
    const onSubmit = (e) => {
      e.preventDefault();
      const userData = {
        password: values.firstName,
        firstName: values.lastName,
        email: values.email,
        phoneNumber: values.phoneNumber
      };
      console.log(userData);
      props.mappedUpdateAuthenticatedUser(user._id, userData);
      clearState();
    };


    return (
       <div>
<Card
{...rest}
className={clsx(classes.root, className)}
>
<form
  autoComplete="off"
  noValidate
>
  <CardHeader
    subheader="Please enter your preferences for the Landing Page"
    title="User Defaults"
  />
  <Divider />
  <CardContent>
    <Grid
      container={true}
      spacing={6}
    >

      <Grid
        item
        md='auto'
        xs='auto'
      >
      <FormControl variant="outlined" className={classes.formControl}>
                <InputLabel id="demo-simple-select-outlined-label">Pollutant</InputLabel>
                <Select
                    labelId="demo-simple-select-outlined-label"
                    id="demo-simple-select-outlined"
                    value={values.pollutant}
                    onChange={handleChange}
                    label="Pollutant"
                >
                    <MenuItem value="">
                        <em>None</em>
                    </MenuItem>
                    <MenuItem value={10}>PM10</MenuItem>
                    <MenuItem value={20}>NO2</MenuItem>
                    <MenuItem value={30}>PM2.5</MenuItem>
                </Select>
            </FormControl>
      </Grid>
      <Grid
        item
        md='auto'
        xs='auto'
      >
      <FormControl variant="outlined" className={classes.formControl}>
                <InputLabel id="demo-simple-select-filled-label">Frequency</InputLabel>
                <Select
                    labelId="demo-simple-select-filled-label"
                    id="demo-simple-select-filled"
                    value={values.frequency}
                    onChange={handleChange}
                    label="Frequency"
                >
                    <MenuItem value="">
                        <em>None</em>
                    </MenuItem>
                    <MenuItem value={10}>Daily</MenuItem>
                    <MenuItem value={20}>Hourly</MenuItem>
                    <MenuItem value={30}>Monthly</MenuItem>
                </Select>
            </FormControl>
      </Grid>
      <Grid
        item
        md='auto'
        xs='auto'
      >
      <FormControl variant="filled" className={classes.formControl}>
                <TextField
                    id="time"
                    label="Start time"
                    type="time"
                    defaultValue="07:30"
                    className={classes.textField}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    inputProps={{
                        step: 300, // 5 min
                    }}
                    InputProps={{ disableUnderline: true }}
                />
            </FormControl>
      </Grid>
      <Grid
        item
        md='auto'
        xs='auto'
      >
        <FormControl variant="filled" className={classes.formControl}>
                <TextField
                    id="time"
                    label="End time"
                    type="time"
                    defaultValue="07:30"
                    className={classes.textField}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    inputProps={{
                        step: 300, // 5 min
                    }}
                    InputProps={{ disableUnderline: true }}
                />
            </FormControl>
      </Grid>
      <Grid
        item
        md='auto'
        xs='auto'
      >
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <Grid container justify="space-around">
                    <KeyboardDatePicker
                        margin="normal"
                        id="date-picker-dialog"
                        label="Start Date"
                        format="MM/dd/yyyy"
                        value={selectedDate}
                        onChange={handleStartDateChange}
                        KeyboardButtonProps={{
                            'aria-label': 'change date',
                        }}
                        InputProps={{ disableUnderline: true }}
                    />
                    <KeyboardDatePicker
                        margin="normal"
                        id="date-picker-dialog"
                        label="End Date"
                        format="MM/dd/yyyy"
                        value={selectedDate}
                        onChange={handleEndDateChange}
                        KeyboardButtonProps={{
                            'aria-label': 'change date',
                        }}
                        InputProps={{ disableUnderline: true }}
                    />
                </Grid>
                </MuiPickersUtilsProvider>
      </Grid>
    </Grid>
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
</form>
</Card>
</div>
    );
}

export default SetDefaults;