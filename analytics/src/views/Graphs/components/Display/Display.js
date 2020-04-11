import React, { useState, Component } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Card, CardContent, Grid, Typography, Avatar } from '@material-ui/core';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import PeopleIcon from '@material-ui/icons/PeopleOutlined';
import { Pie } from 'react-chartjs-2';
import { ActionHome } from 'material-ui/svg-icons';

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

/*class PieChartComponent extends Component{
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
}*/


/*
var dataPoints =[];
class BarChart extends Component {
 
	render() {	
		const options = {
			theme: "light2",
			title: {
				text: "Stock Price of NIFTY 50"
			},
			axisY: {
				title: "Price in USD",
				prefix: "$",
				includeZero: false
			},
			data: [{
				type: "line",
				xValueFormatString: "MMM YYYY",
				yValueFormatString: "$#,##0.00",
				dataPoints: dataPoints
			}]
		}
		return (
		<div>
			<CanvasJSChart options = {options} 
				 onRef={ref => this.chart = ref}
			/>
			//{You can get reference to the chart instance as shown above using onRef. This allows you to access all chart properties and methods}
		</div>
		);
	}
	
	componentDidMount(){
		var chart = this.chart;
		fetch('http://127.0.0.1:5000/api/v1/device/graph')
		.then(function(response) {
			return response.json();
		})
		.then(function(data) {
			for (var i = 0; i < data.length; i++) {
				dataPoints.push({
					x: new Date(data[i].x),
					y: data[i].y
				});
			}
			chart.render();
		});
	}
}*/
 
//module.exports = App;      

/*class Graph extends Component {
  
  state = { 
    loading: true,
    myData: null 
  };

  async componentDidMount(){
    const url = 'http://127.0.0.1:5000/api/v1/device/graph'
    //const response = await fetch(url)
    //const data = await response.json()
    //this.setState({myData:data, loading:false})
    //console.log(data[0])
    fetch(url)
    .then (res => res.json())
    .then(
      (result) => {
        this.setState({
          loading: false,
          myData: result
        });
      }
    )
  }
  render() {
      return (
        <div> 
           {myData.map(myData => <div> {myData.time} </div>)}
        </div>
        )}
     
          //<ReactFC {...this.state.pieConfigs}/>
  }
*/



export default class Home extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      myData: []
    };
  }

  componentDidMount() {
    fetch('http://127.0.0.1:5000/api/v1/device/graph')
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            myData: result
          });
        },
        // error handler
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }

  render() {

    const { error, isLoaded, myData } = this.state;

    if (error) {
      return (
        <div className="col">
          Error: {error.message}
        </div>
      );
    } else if (!isLoaded) {
      return (
        <div className="col">
          Loading...
        </div>
      );
    } else {
      return (
        <div className="col">
          <h1>Bar Chart</h1>
          {myData.map(record => <div>{record.time}</div>)}
          {myData.map(record => <div>{record.characteristics.pm2_5ConcMass.value}</div>)}
        </div>
      );
    }
  }
}

