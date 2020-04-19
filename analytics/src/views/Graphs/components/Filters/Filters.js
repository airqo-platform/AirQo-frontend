import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { makeStyles, withStyles } from '@material-ui/styles';
import { Card, CardContent, Grid, Typography, Button } from '@material-ui/core';
import {reduxForm, Field} from 'redux-form';
import { createStore, combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import classnames from "classnames";
import { connect } from "react-redux";
import clsx from 'clsx';
import Select from 'react-select';
import { useEffect, useState } from 'react';
import DateFnsUtils from '@date-io/date-fns';
import {MuiPickersUtilsProvider, KeyboardTimePicker, KeyboardDatePicker} from '@material-ui/pickers';
import axios from 'axios'
import { Pie, Bar, Line } from 'react-chartjs-2';


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
          <Grid item>
            <Typography
              className={classes.title}
              color="textSecondary"
              gutterBottom
              variant="body2"
            >
              Display Graph
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

Filters.propTypes = {
  className: PropTypes.string
};
//export default Filters;
