import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import PropTypes from 'prop-types';
import { Card, CardContent, Grid, Button,Typography } from '@material-ui/core';
import clsx from 'clsx';
import Select from 'react-select';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import TextField from '@material-ui/core/TextField';
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

const LocationView = props => {
  const { className, ...rest } = props;
  let params = useParams();
  const classes = useStyles();
 
  let  handleSubmit = (e) => {

   
  }

    return(
    <div className={classes.root}>   
          
    <form onSubmit={handleSubmit}>

        
        <Button 
          variant="contained" 
          color="primary"              
          type="submit"
          align = "centre"
        > View Location
        </Button>
          
      </form>
    </div>
    )

  }
 


LocationView.propTypes = {
  className: PropTypes.string
};

export default LocationView;