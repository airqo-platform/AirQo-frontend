import React, { useState, Component } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Card, CardContent, Grid, Typography, Avatar } from '@material-ui/core';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import PeopleIcon from '@material-ui/icons/PeopleOutlined';
import { Pie, Bar } from 'react-chartjs-2';
import { ActionHome } from 'material-ui/svg-icons';
import axios from 'axios';

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
      </CardContent>
    </Card>
  );
};

Display.propTypes = {
  className: PropTypes.string
};

export default Display;

/*export default class BarChartComponent extends Component
{
   constructor(props) {
      super(props);
      this.state = {
        Data: {},
        //isLoaded: false
      }
    }
       
    componentDidMount() {
      axios.get('http://127.0.0.1:5000/api/v1/device/graph')
        .then(res => {
          const myData = res.data;
          let time = [];
          let pm_concentration = [];
          myData.forEach(element => {
            time.push(element.time);
            pm_concentration.push(element.characteristics.pm2_5ConcMass.value);
          });
          this.setState({ 
            //isLoaded: true,
            Data: {
              labels: time,
              datasets:[
                 {
                    label:'PM Concentration over allocated time period',
                    data: pm_concentration,
                    backgroundColor: 'rgba(75, 192, 192, 1)',
                    borderColor: 'rgba(0,0,0,1)'
                    /*backgroundColor:[
                     'rgba(255,105,145,0.6)',
                     'rgba(155,100,210,0.6)',
                     'rgba(90,178,255,0.6)',
                     'rgba(240,134,67,0.6)',
                     'rgba(120,120,120,0.6)',
                     'rgba(250,55,197,0.6)'
                  ]
                 }
              ]
           }
           });
        })
    }
 render()
   {
    /*if (!isLoaded) {
      return (
        <div className="col">
          Loading...
        </div>
      );
    } 
    else {
      return(
        <div>
        <Bar
          data={this.state.Data}
          options={{maintainAspectRatio: true}}/>
     </div>
      )
   }
} */

