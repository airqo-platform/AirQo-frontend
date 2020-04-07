import React, { useState, Component } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Card, CardContent, Grid, Typography, Avatar } from '@material-ui/core';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import PeopleIcon from '@material-ui/icons/PeopleOutlined';
import { Pie } from 'react-chartjs-2';

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
  }
}));

const Display = props => {
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
        {/* <div className={classes.difference}>
          <ArrowUpwardIcon className={classes.differenceIcon} />
          <Typography
            className={classes.differenceValue}
            variant="body2"
          >
            16%
          </Typography>
          <Typography
            className={classes.caption}
            variant="caption"
          >
            Since last month
          </Typography>
        </div> */}
      </CardContent>
    </Card>
  );
};

Display.propTypes = {
  className: PropTypes.string
};

class PieChartComponent extends Component{
  constructor(props){
    super(props)
    this.state = {
      labels: ['Good', 'Moderate', 'UH4SG', 'Unhealthy', 'Very Unhealthy', 'Hazardous', 'Other'],
      datasets: [{
        data: [100, 200, 300, 150, 320, 40, 2],
        backgroundColor: ['green', 'yellow', 'orange', 'red', 'purple', 'maroon', 'grey']
      }]
    }
  }

  render(){
    return (
      <div>
        <h1> Piechart showing air quality distribution</h1>
        <Pie 
           data ={{
             labels: this.state.labels,
             datasets: this.state.datasets
           }}
           height = '50%'
        />
        <br/>
      </div>
    )
  }
}

export default Display;
