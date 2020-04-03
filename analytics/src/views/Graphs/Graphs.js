import React, { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Grid} from '@material-ui/core';
import { Display, Filters } from './components';
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

export default Graphs;

//var React = require('react');
var Component = React.Component;
var CanvasJSReact = require('canvasjs.react');
var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;
class App extends Component {
	render() {
		const options = {
			exportEnabled: true,
			animationEnabled: true,
			title: {
				text: "Website Traffic Sources"
			},
			data: [{
				type: "pie",
				startAngle: 75,
				toolTipContent: "<b>{label}</b>: {y}%",
				showInLegend: "true",
				legendText: "{label}",
				indexLabelFontSize: 16,
				indexLabel: "{label} - {y}%",
				dataPoints: [
					{ y: 18, label: "Good" },
					{ y: 49, label: "Moderate" },
					{ y: 9, label: "UH4SG" },
					{ y: 5, label: "Unhealthy" },
					{ y: 19, label: "Very Unhealthy" }
				]
			}]
		}
		return (
		<div>
			<CanvasJSChart options = {options}
				/* onRef={ref => this.chart = ref} */
			/>
			{/*You can get reference to the chart instance as shown above using onRef. This allows you to access all chart properties and methods*/}
		</div>
		);
	}
}
module.exports = App;                              
