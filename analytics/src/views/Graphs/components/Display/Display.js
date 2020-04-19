import React, { useState, Component } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Card, CardContent, Grid, Typography, Avatar } from '@material-ui/core';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import PeopleIcon from '@material-ui/icons/PeopleOutlined';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { ActionHome } from 'material-ui/svg-icons';
import axios from 'axios';
import Filters from '../Filters/Filters.js';
//import { times, pollutionValues } from '../Filters/Filters'
//import { times } from '../Filters'

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

const state = {
  //label:times,
  label: [1,2,3],
  datasets: [
    {
    label: 'Air Quality',
    backgroundColor: 'rgba(240,134,67,0.6)',
    borderColor: 'rgba(0,0,0,0)',
    //data: pollutionValues
    data: [20,50,10]
    }
  ]
}

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
      </div>
  }
}*/

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

//export default Display;
/*
class BarChart extends Component
{
   constructor(props) {
      super(props);
      this.state = {
        Data: {}
        //isLoaded: false
      };
    }
       
    componentDidMount() {
      axios.get('http://127.0.0.1:5000/api/v1/device/graph')
        .then(res => {
          console.log(res)
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
                    label:'Bar Graph showing Air Quality over time',
                    data: pm_concentration,
                    backgroundColor: 'rgba(75, 192, 192, 1)',
                    borderColor: 'rgba(0,0,0,1)'
                    backgroundColor:[
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
} 

class LineChart extends Component {
  constructor(props) {
    super(props);
    this.state = { Data: {} };
  }
  
  componentDidMount() {
    axios.get('http://localhost:5000/api/v1/device/graph')
    .then(res => {
      console.log(res);
      const myData = res.data;
      let time = [];
      let values = [];
      myData.forEach(record => {
        time.push(record.time);
        values.push(record.characteristics.pm2_5ConcMass.value);
      });
      
      this.setState({
        Data: {
          labels: time,
          //labels: [1,2,3,4,5],
          datasets: [
            {
              label: 'Line Graph showing Air Quality data over time',
              data: values,
              //data: [10, 20, 50, 18, 45],
              backgroundColor: ['green', 'red', 'blue', 'purple', 'maroon']
            }
          ]
        }
      });
    })
  }  

render() {
  return (
  <div>
    <Line
    data={this.state.Data}
    options={{ maintainAspectRatio: true }} />
  </div>
  )  
}
}  


class Piechart extends Component {
  constructor(props) {
    super(props);
    this.state = { Data: {} };
  }
  
  componentDidMount() {
    axios.get('http://localhost:5000/api/v1/device/graph')
    .then(res => {
      console.log(res);
      const myData = res.data;
      let values = [];
      myData.forEach(record => {
        values.push(record);
      });
      this.setState({
        Data: {
          labels: ['Good', 'Moderate', 'UH4SG', 'Unhealthy', 'Very Unhealthy', 'Hazardous', 'Other'],
          datasets: [{
            label: 'Pie chart showing air quality data over time',
            data: values, 
            backgroundColor: ['Green', 'Yellow', 'Orange', 'Red','Purple', 'Maroon', 'Grey']
          }
        ]
      }
    });
  })
}  
render() {
  return (
  <div>
    <Pie
    data={this.state.Data}
    options={{ maintainAspectRatio: false }} />
  </div>
  )
}  
}

export default BarChart;*/

