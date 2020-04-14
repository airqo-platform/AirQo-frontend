import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Grid, Card, CardContent } from '@material-ui/core';
import { Line } from 'react-chartjs-2';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Pm25Levels, Map,Filters } from './components';
import { useEffect, useState } from 'react';
import 'chartjs-plugin-annotation';
//import Select from 'react-select';
 

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(4)
  },
  differenceIcon: {
    color: theme.palette.text.secondary,
  },
}));


const Dashboard = props => {
  const classes = useStyles();
  const { className, staticContext, ...rest } = props;
 
  const [locations,setLocations] = useState([]);
  
  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/v1/monitoringsite/historical/daily/devices')
      .then(res => res.json())
      .then((locationsData) => {
        setLocations(locationsData.results)
      })
      .catch(console.log)
  },[]);

 
  const locationsGraphData = {
    labels: locations.labels,
    datasets: [
      {
        label: 'PM2.5',
        data: locations.average_pm25_values,
        fill: false,          // Don't fill area under the line
        borderColor: 'green'  // Line color
      }
    ]
  }
  




  const data = {
    labels: [
      '10/04/2018', '10/05/2018', 
      '10/06/2018', '10/07/2018', 
      '10/08/2018', '10/09/2018', 
      '10/10/2018', '10/11/2018', 
      '10/12/2018', '10/13/2018', 
      '10/14/2018', '10/15/2018'
    ],
    datasets: [
      {
        label: 'PM2.5',
        data: [22,19,27,23,22,24,17,25,23,24,20,19],
        fill: false,          // Don't fill area under the line
        borderColor: 'green'  // Line color
      }
    ]
  }

  const options2 = {
    scales: {
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'PM2.5'
        },
        ticks: {
          //beginAtZero: true,
          suggestedMin:20
        }
      }],
      xAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Locations'
        }
      }],
    } ,  
    
    annotation: {
      annotations: [{
        type: 'line',
        mode: 'horizontal',
        scaleID: 'y-axis-0',
        value: 25,
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 2,
        label: {
          enabled: true,
          content: 'WHO LIMIT',
          //backgroundColor: '',
        }
      }]
    },
    maintainAspectRatio: false	// Don't maintain w/h ratio
  }
  
  const options = {
    scales: {
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'PM2.5'
        }
      }],
      xAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Date'
        }
      }],
    } ,    
    maintainAspectRatio: false	// Don't maintain w/h ratio
  }

  return (
    <div className={classes.root}>
      <Grid
        container
        spacing={0}
      >
        <Grid
          item
          lg={6}
          sm={6}
          xl={6}
          xs={12}
        >
          <header className="App-header">
            <h1>Past 28 days aggregated mean</h1>
          </header>
          <article className="canvas-container">
            <Line 
              data={locationsGraphData} 
              options={options2}
            />
          </article>
        </Grid>

        <Grid
          item
          lg={6}
          sm={6}
          xl={6}
          xs={12}
        >
          <header className="App-header">
            <h1>PM 2.5 for the past hour</h1>
          </header>
          <Grid 
            container            
          >
            <Grid
              item
              lg={12}
              sm={12}
              xl={12}
              xs={12}
            >
              <Map />
            </Grid>
            
            <Grid
              item
              lg={2}
              sm={4}
              xl={2}
              xs={12}
            >
              <Pm25Levels
                background="#45e50d"
                pm25level="Good"
                pm25levelText = "(0 - 12)"
                
              />
            </Grid>
            <Grid
              item
              lg={2}
              sm={4}
              xl={2}
              xs={12}
            >
              <Pm25Levels
                background="#f8fe28"
                pm25level="Moderate"
                pm25levelText="(12.1 - 35.4)"
                
              />
            </Grid>

            <Grid
              item
              lg={2}
              sm={4}
              xl={2}
              xs={12}
            >
              <Pm25Levels
                background="#ee8310"
                pm25level="Unhealthy for sensitive groups"
                pm25levelColor="#FFFFFF"
                pm25levelText="(35.6 - 55.4)"            
                
              />
            </Grid>
            <Grid
              item
              lg={2}
              sm={4}
              xl={2}
              xs={12}
            >
              <Pm25Levels
                background="#fe0000"
                pm25level="Unhealthy"
                pm25levelColor="#FFFFFF"
                pm25levelText="(55.5 - 150.4)"            
                
              />
            </Grid>
            <Grid
              item
              lg={2}
              sm={4}
              xl={2}
              xs={12}
            >
              <Pm25Levels
                background="#8639c0"
                pm25level="Very unhealthy"
                pm25levelColor="#FFFFFF"
                pm25levelText="(150.5 - 250.4)"           
                
              />
            </Grid>
            <Grid
              item
              lg={2}
              sm={4}
              xl={2}
              xs={12}
            >
              <Pm25Levels
                background="#81202e"
                pm25level="Hazardous"
                pm25levelColor="#FFFFFF"
                pm25levelText="(250.5 - 500.4)"           
                
              />
            </Grid>
            <p className={classes.differenceIcon}>PM <sub>2.5</sub> - Particulate Matter</p>
          </Grid>

        </Grid>
        
        

        <Grid
          item
          lg={12}
          sm={12}
          xl={12}
          xs={12}
        >
          <Card
            {...rest}
            className={clsx(classes.root, className)}
          >
            <CardContent>
              <header className="App-header"><h1>Customisable Historical Chart One</h1> </header>
              <Grid
                container
                spacing={1}
              >
                <Grid
                  item
                  lg={4}
                  sm={4}
                  xl={4}
                  xs={12}
                >
                  <Filters />
                </Grid>
                <Grid
                  item
                  lg={8}
                  sm={8}
                  xl={8}
                  xs={12}
                >
            

                  <article className="canvas-container">
                    <Line 
                      data={data}
                      options={options}
                    />
                  </article>
                </Grid>
              </Grid>
            </CardContent>

          </Card>
        </Grid>

        

        <Grid
          item
          lg={12}
          sm={12}
          xl={12}
          xs={12}
        >
          <Card
            {...rest}
            className={clsx(classes.root, className)}
          >
            <CardContent>
              <header className="App-header"><h1>Customisable Historical Chart Two</h1> </header>
              <Grid
                container
                spacing={1}
              >
                <Grid
                  item
                  lg={4}
                  sm={4}
                  xl={4}
                  xs={12}
                >
                  <Filters />
                </Grid>
                <Grid
                  item
                  lg={8}
                  sm={8}
                  xl={8}
                  xs={12}
                >
                    

                  <article className="canvas-container">
                    <Line 
                      data={data} 
                      options={options}
                    />
                  </article>
                </Grid>
              </Grid>
            </CardContent>

          </Card>
        </Grid>


        <Grid
          item
          lg={6}
          sm={6}
          xl={12}
          xs={12}
        >
          <Card
            {...rest}
            className={clsx(classes.root, className)}
          >
            <CardContent>
              <header className="App-header">
                <h1> Historical Chart One</h1> 
              </header>

              <article className="canvas-container">
                <Line 
                  data={data} 
                  options={options}
                />
              </article>
            </CardContent>

          </Card>
          
        </Grid>

        <Grid
          item
          lg={6}
          sm={6}
          xl={12}
          xs={12}
        >
          <Card
            {...rest}
            className={clsx(classes.root, className)}
          >
            <CardContent>
              <header className="App-header">
                <h1>Historical Chart One</h1> </header>

              <article className="canvas-container">
                <Line 
                  data={data} 
                  options={options}
                />
              </article>
            </CardContent>

          </Card>
          
        </Grid>



        
      </Grid>
    </div>
  );
};


Dashboard.propTypes = {
  className: PropTypes.string
};



export default Dashboard;
