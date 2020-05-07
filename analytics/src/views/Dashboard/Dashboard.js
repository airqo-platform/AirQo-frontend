import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Grid, Card, CardContent, CardHeader, Button, Divider, CardActions } from '@material-ui/core';
import { Line,Bar } from 'react-chartjs-2';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Pm25Levels, Map, CustomisableChart, PollutantCategory, ExceedancesChart, TotalProfit } from './components';
import { useEffect, useState } from 'react';
import 'chartjs-plugin-annotation';
import palette from 'theme/palette';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';     
 

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(4)
  },
  chartCard:{

  },
  differenceIcon: {
    color: theme.palette.text.secondary,
  },
  chartContainer: {
    height: 200,
    position: 'relative'
  },
  actions: {
    justifyContent: 'flex-end'
  }
}));


const Dashboard = props => {
  const classes = useStyles();
  const { className, staticContext, ...rest } = props;
 
  const [backgroundColors, setBackgroundColors] = useState([]);
  const [locations,setLocations] = useState([]);

  useEffect(() => {
    fetch('https://analytcs-bknd-service-dot-airqo-250220.uc.r.appspot.com/api/v1/monitoringsite/historical/daily/devices')
    //fetch('http://127.0.0.1:5000/api/v1/dashboard/historical/daily/devices')
      .then(res => res.json())
      .then((locationsData) => {        
        setLocations(locationsData.results);
        
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
        backgroundColor: locations.background_colors //palette.primary.main,
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
    legend: { display: false },
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
      footerFontColor: palette.text.secondary,
      callbacks: {
        //title: (items, data) => data.labels[items[0].index],
        //afterTitle: (items, data) =>
        //return data['labels'][tooltipItem[0]['index']]
        //label: (item, data) => data.datasets[item.datasetIndex].data[item.index]
      }
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
            fontColor: palette.text.secondary,
            //fontSize:10
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
          lg={2}
          sm={6}
          xl={2}
          xs={12}
        >
          <PollutantCategory
            pm25level="GOOD"
            pm25levelCount="08"
          />
        </Grid>

        <Grid
          item
          lg={2}
          sm={6}
          xl={2}
          xs={12}
        >
          <PollutantCategory
            pm25level="MODERATE"
            pm25levelCount="05"
          />
        </Grid>
        <Grid
          item
          lg={2}
          sm={6}
          xl={2}
          xs={12}
        >
          <PollutantCategory
            pm25level="UHFSG"
            pm25levelCount="07"
          />
        </Grid>

        <Grid
          item
          lg={2}
          sm={6}
          xl={2}
          xs={12}
        >
          <PollutantCategory
            pm25level="UNHEALTHY"
            pm25levelCount="07"
          />
        </Grid>

        <Grid
          item
          lg={2}
          sm={6}
          xl={2}
          xs={12}
        >
          <PollutantCategory
            pm25level="V.UNHEALTHY"
            pm25levelCount="07"
          />
        </Grid>
        <Grid
          item
          lg={2}
          sm={6}
          xl={2}
          xs={12}
        >
          <PollutantCategory
            pm25level="HAZARDOUS"
            pm25levelCount="07"
          />
        </Grid>
        <Grid
          item
          lg={5}
          md={5}
          sm={12}
          xl={5}
          xs={12}
        >
          <Card
            {...rest}
            className={clsx(classes.chartCard)}
          >
            <CardHeader              
              title="Mean Daily PM2.5 for Past 28 Days"
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
            
          </Card>          
        </Grid>

        <Grid
          item
          lg={7}
          md={7}
          sm={12}
          xl={7}
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
          
        </Grid>
        

        <Grid
          item          
          lg={8}
          md={8}
          sm={12}
          xl={9}
          xs={12}
        >
          
          <div className={classes.chartContainerx}>
          <Card
            {...rest}
            className={clsx(classes.chartCard)}
          >
            <CardHeader              
              title="Mean Daily PM2.5 for Past 28 Days"
            />
            <Divider />
            <CardContent>
              <div className={classes.chartContainer}>
                <ExceedancesChart/>
              </div>
            </CardContent>
            
          </Card>     
          </div>                  
                                 
        </Grid>
        <Grid
          item
          lg={4}
          md={4}
          sm={12}
          xl={3}
          xs={12}
        >
          <PollutantCategory/>
        </Grid>

        
    <Grid
          item
          lg={6}
          sm={12}
          xl={6}
          xs={12}
        >
          
          <CustomisableChart/>
          
    </Grid>
                <Grid
                  item
                  lg={6}
                  md={6}
                  sm={12}
                  xl={6}
                  xs={12}
                >
                    
                    
                  <CustomisableChart/>
                 
                </Grid>
                         


        <Grid
          item
          lg={6}
          md={6}
          sm={12}
          xl={6}
          xs={12}
        >
          <Card
            {...rest}
            className={clsx(classes.root, className)}
          >
            <CardHeader
              
              title="Historical Chart One"
            />
            <Divider />
            <CardContent>             

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
          md={6}
          sm={12}
          xl={6}
          xs={12}
        >
          <Card
            {...rest}
            className={clsx(classes.root, className)}
          >
            <CardHeader
              
              title="Historical Chart Two"
            />
            <Divider />
            <CardContent>
              <CustomisableChart/>
              
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
