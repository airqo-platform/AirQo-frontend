import React, { useState, Component } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Grid} from '@material-ui/core';
import { Display, Filters } from './components';
import { Pie } from 'react-chartjs-2';
//import CanvasJS from 'canvasjs';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3)
  },
  content: {
    marginTop: theme.spacing(2)
  }
}));

const Graphs = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Grid
        container
        spacing={0.1}
      >
        <Grid
          item
          lg={8}
          sm={8}
          xl={8}
          xs={12}
        >
        <Display />
        </Grid>
        <Grid
          item
          lg={4}
          sm={4}
          xl={4}
          xs={12}
        >
        <Filters />
        </Grid>
      </Grid>
    </div>
  );
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

export default PieChartComponent;
//export default Graphs;


//module.exports = App;                              
