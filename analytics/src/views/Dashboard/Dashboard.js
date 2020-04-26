import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Grid, Card, CardContent, CardHeader, Button, Divider, CardActions } from '@material-ui/core';
import { Line,Bar } from 'react-chartjs-2';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Pm25Levels, Map, CustomisableChart, PollutantCategory, TotalProfit } from './components';
import { useEffect, useState } from 'react';
import 'chartjs-plugin-annotation';
import palette from 'theme/palette';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
 

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(4)
  },
  differenceIcon: {
    color: theme.palette.text.secondary,
  },
  chartContainer: {
    height: 400,
    position: 'relative'
  },
  actions: {
    justifyContent: 'flex-end'
  }
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
        label: 'PM2.5(µg/m3)',
        data: locations.average_pm25_values,
        fill: false,          // Don't fill area under the line
        borderColor: palette.primary.main , // Line color
        backgroundColor: palette.primary.main,
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
        label: 'PM2.5(µg/m3)',
        data: [22,19,27,23,22,24,17,25,23,24,20,19],
        fill: false,          // Don't fill area under the line
        borderColor:  palette.primary.main,  // Line color
      }
    ]
  }

  
  
  const options = {
    scales: {
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'PM2.5(µg/m3)'
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

  
  const options_main= {
    annotation: {
      annotations: [{
        type: 'line',
        mode: 'horizontal',
        scaleID: 'y-axis-0',
        value: 25,
        borderColor: palette.text.secondary,
        borderWidth: 2,
        label: {
          enabled: true,
          content: 'WHO LIMIT',
          //backgroundColor: palette.white,
          titleFontColor: palette.text.primary,
          bodyFontColor: palette.text.primary,
          position:'right'
        },
        
      }]
    },
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    legend: { display: true },
    cornerRadius: 0,
    tooltips: {
      enabled: true,
      mode: 'index',
      intersect: false,
      borderWidth: 1,
      borderColor: palette.divider,
      backgroundColor: palette.white,
      titleFontColor: palette.text.primary,
      bodyFontColor: palette.text.secondary,
      footerFontColor: palette.text.secondary
    },
    layout: { padding: 0 },
    scales: {
      xAxes: [
        {
          barThickness: 12,
          maxBarThickness: 10,
          barPercentage: 0.5,
          categoryPercentage: 0.5,
          ticks: {
            fontColor: palette.text.secondary
          },
          gridLines: {
            display: false,
            drawBorder: false
          },
          scaleLabel: {
            display: true,
            labelString: 'Locations'
          }

        }
      ],
      yAxes: [
        {
          ticks: {
            fontColor: palette.text.secondary,
            beginAtZero: true,
            min: 0
            //suggestedMin:20
          },
          gridLines: {
            borderDash: [2],
            borderDashOffset: [2],
            color: palette.divider,
            drawBorder: false,
            zeroLineBorderDash: [2],
            zeroLineBorderDashOffset: [2],
            zeroLineColor: palette.divider
          },
          scaleLabel: {
            display: true,
            labelString: 'PM2.5(µg/m3)'
          }
        }
      ]
    }
  };

  return (
    <div className={classes.root}>
      <Grid
        container
        spacing={4}
      >
        <Grid
          item
          lg={3}
          sm={6}
          xl={3}
          xs={12}
        >
          <PollutantCategory />
        </Grid>
        <Grid
          item
          lg={3}
          sm={6}
          xl={3}
          xs={12}
        >
          <PollutantCategory />
        </Grid>

        <Grid
          item
          lg={3}
          sm={6}
          xl={3}
          xs={12}
        >
          <TotalProfit />
        </Grid>
        <Grid
          item
          lg={3}
          sm={6}
          xl={3}
          xs={12}
        >
          <TotalProfit />
        </Grid>
        <Grid
          item
          lg={6}
          sm={6}
          xl={6}
          xs={12}
        >
          <Card
            {...rest}
            className={clsx(classes.root, className)}
          >
            <CardHeader              
              title="Aggregated Average PM2.5 for the Last 28 Days"
            />
            <Divider />
            <CardContent>
              <div className={classes.chartContainer}>
                <Bar
                  data={locationsGraphData}
                  options={options_main}
                />
              </div>
            </CardContent>
            <Divider />
            <CardActions className={classes.actions}>
              <Button
                color="primary"
                size="small"
                variant="text"
              >
                Overview <ArrowRightIcon />
              </Button>
            </CardActions>
          </Card>          
        </Grid>

        <Grid
          item
          lg={6}
          sm={6}
          xl={6}
          xs={12}
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
          
          <Divider />
        
          <Grid
            container
            spacing={0}
          >

          
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
            <p>
              PM <sub>2.5</sub> - Particulate Matter 
            </p>
                
          </Grid>
        </Grid>
        

        <Grid
          item          
          lg={8}
          md={12}
          xl={9}
          xs={12}
        >
          <Card
            {...rest}
            className={clsx(classes.root, className)}
          >
            <CardHeader
              
              title="Customisable Historical Chart One"
            />
            <Divider />
            <CardContent>
              <div className={classes.chartContainerx}>
                    
                <CustomisableChart/>
              </div>
                  
            </CardContent>
            

          </Card>
        </Grid>
        <Grid
          item
          lg={4}
          md={6}
          xl={3}
          xs={12}
        >
          <PollutantCategory/>
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
                  lg={6}
                  sm={6}
                  xl={6}
                  xs={12}
                >
                  <CustomisableChart/>
                </Grid>
                <Grid
                  item
                  lg={6}
                  sm={6}
                  xl={6}
                  xs={12}
                >
                    
                  <CustomisableChart/>
                  
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
                  options={options_main}
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
