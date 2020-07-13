import React from 'react';
import { makeStyles } from '@material-ui/styles';
import {
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Divider,
  CardActions
} from '@material-ui/core';
import { Line, Bar } from 'react-chartjs-2';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {
  Pm25Levels,
  Map,
  CustomisableChart,
  PollutantCategory,
  ExceedancesChart,
  TotalProfit
} from './components';
import { useEffect, useState } from 'react';
import 'chartjs-plugin-annotation';
import palette from 'theme/palette';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
//import Legend from './components/Map/Legend'
import axios from 'axios';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(4)
  },
  chartCard: {},
  differenceIcon: {
    color: theme.palette.text.secondary
  },
  chartContainer: {
    height: 180,
    position: 'relative'
  },
  actions: {
    justifyContent: 'flex-end'
  }
}));

const Dashboard = props => {
  const classes = useStyles();
  const {
    className,
    staticContext,
    mappedAuth,
    mappeduserState,
    mappedErrors,
    ...rest
  } = props;
  const { user, isAuthenticated } = mappedAuth;

  function appendLeadingZeroes(n) {
    if (n <= 9) {
      return '0' + n;
    }
    return n;
  }

  let todaysDate = new Date();
  const dateValue = appendLeadingZeroes(
    todaysDate.getDate() +
      '/' +
      appendLeadingZeroes(todaysDate.getMonth() + 1) +
      '/' +
      todaysDate.getFullYear()
  );

  const [backgroundColors, setBackgroundColors] = useState([]);

  const [
    pm25CategoriesLocationCount,
    setPm25CategoriesLocationCount
  ] = useState([]);

  // useEffect(() => {
  //   try{
  //       props.fetchDefaults(user._id);
  //   }
  //   catch(e){
  //   console.log(e);
  //   }
  //     }, []);

  //   useEffect(() => {
  // return ()=>{
  //   props.fetchDefaults(user._id);
  // }

  //   }, []);

  //load JIRA Helpdek widget
  // console.log(user._id);
  useEffect(() => {
    // if (user._id != {}) {
    function jiraHelpdesk(callback) {
      let jhdScript = document.createElement('script');
      jhdScript.type = 'text/javascript';
      jhdScript.setAttribute('data-jsd-embedded', null);
      jhdScript.setAttribute(
        'data-key',
        'cf4a44fc-f333-4e48-8e6c-6b94f97cea15'
      );
      jhdScript.setAttribute(
        'data-base-url',
        'https://jsd-widget.atlassian.com'
      );
      jhdScript.src = 'https://jsd-widget.atlassian.com/assets/embed.js';
      if (jhdScript.readyState) {
        // old IE support
        jhdScript.onreadystatechange = function() {
          if (
            jhdScript.readyState === 'loaded' ||
            jhdScript.readyState === 'complete'
          ) {
            jhdScript.onreadystatechange = null;
            callback();
          }
        };
      } else {
        //modern browsers
        jhdScript.onload = function() {
          callback();
        };
      }
      document.getElementsByTagName('head')[0].appendChild(jhdScript);
    }

    jiraHelpdesk(function() {
      let DOMContentLoaded_event = document.createEvent('Event');
      DOMContentLoaded_event.initEvent('DOMContentLoaded', true, true);
      window.document.dispatchEvent(DOMContentLoaded_event);
    });
  }, []);

  useEffect(() => {
    axios
      .get(
        'https://analytcs-bknd-service-dot-airqo-250220.uc.r.appspot.com/api/v1/dashboard/locations/pm25categorycount?organisation_name=KCCA'
      )
      //axios.get('http://127.0.0.1:5000/api/v1/dashboard/locations/pm25categorycount?organisation_name=KCCA')
      .then(res => res.data)
      .then(data => {
        setPm25CategoriesLocationCount(data);
        console.log(data);
        //console.log(data.pm25_categories)
      })
      .catch(e => {
        console.log(e);
      });
  }, []);

  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetch(
      'https://analytcs-bknd-service-dot-airqo-250220.uc.r.appspot.com/api/v1/dashboard/historical/daily/devices'
    )
      //fetch('http://127.0.0.1:5000/api/v1/dashboard/historical/daily/devices')
      .then(res => res.json())
      .then(locationsData => {
        setLocations(locationsData.results);
      })
      .catch(e => {
        console.log(e);
      });
  }, []);

  const locationsGraphData = {
    labels: locations.labels,
    datasets: [
      {
        label: 'PM2.5(µg/m3)',
        data: locations.average_pm25_values,
        fill: false, // Don't fill area under the line
        borderColor: palette.primary.main, // Line color
        backgroundColor: locations.background_colors //palette.primary.main,
      }
    ]
  };

  const options_main = {
    annotation: {
      annotations: [
        {
          type: 'line',
          mode: 'horizontal',
          scaleID: 'y-axis-0',
          value: 25,
          borderColor: palette.text.secondary,
          borderWidth: 2,
          label: {
            enabled: true,
            content: 'WHO AQG',
            //backgroundColor: palette.white,
            titleFontColor: palette.text.primary,
            bodyFontColor: palette.text.primary,
            position: 'right'
          }
        }
      ]
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
            fontColor: palette.text.secondary
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
      <Grid container spacing={4}>
        <Grid item lg={2} sm={6} xl={2} xs={12}>
          <PollutantCategory
            pm25level="Good"
            pm25levelCount={
              typeof pm25CategoriesLocationCount != 'undefined' &&
              pm25CategoriesLocationCount != null &&
              pm25CategoriesLocationCount.length > 0
                ? pm25CategoriesLocationCount[0]['locations_with_category_good']
                    .category_count
                : ''
            }
            iconClass="pm25Good"
          />
        </Grid>
        <Grid item lg={2} sm={6} xl={2} xs={12}>
          <PollutantCategory
            pm25level="Moderate"
            pm25levelCount={
              typeof pm25CategoriesLocationCount != 'undefined' &&
              pm25CategoriesLocationCount != null &&
              pm25CategoriesLocationCount.length > 0
                ? pm25CategoriesLocationCount[1][
                    'locations_with_category_moderate'
                  ].category_count
                : ''
            }
            iconClass="pm25Moderate"
          />
        </Grid>
        <Grid item lg={2} sm={6} xl={2} xs={12}>
          <PollutantCategory
            pm25level="UHFSG"
            pm25levelCount={
              typeof pm25CategoriesLocationCount != 'undefined' &&
              pm25CategoriesLocationCount != null &&
              pm25CategoriesLocationCount.length > 0
                ? pm25CategoriesLocationCount[2].locations_with_category_UH4SG
                    .category_count
                : ''
            }
            iconClass="pm25UH4SG"
          />
        </Grid>

        <Grid item lg={2} sm={6} xl={2} xs={12}>
          <PollutantCategory
            pm25level="Unhealthy"
            pm25levelCount={
              typeof pm25CategoriesLocationCount != 'undefined' &&
              pm25CategoriesLocationCount != null &&
              pm25CategoriesLocationCount.length > 0
                ? pm25CategoriesLocationCount[3]
                    .locations_with_category_unhealth.category_count
                : ''
            }
            iconClass="pm25UnHealthy"
          />
        </Grid>

        <Grid item lg={2} sm={6} xl={2} xs={12}>
          <PollutantCategory
            pm25level="Very Unhealthy"
            pm25levelCount={
              typeof pm25CategoriesLocationCount != 'undefined' &&
              pm25CategoriesLocationCount != null &&
              pm25CategoriesLocationCount.length > 0
                ? pm25CategoriesLocationCount[4]
                    .locations_with_category_very_unhealthy.category_count
                : ''
            }
            iconClass="pm25VeryUnHealthy"
          />
        </Grid>
        <Grid item lg={2} sm={6} xl={2} xs={12}>
          <PollutantCategory
            pm25level="Hazardous"
            pm25levelCount={
              typeof pm25CategoriesLocationCount != 'undefined' &&
              pm25CategoriesLocationCount != null &&
              pm25CategoriesLocationCount.length > 0
                ? pm25CategoriesLocationCount[5]
                    .locations_with_category_hazardous.category_count
                : ''
            }
            iconClass="pm25Harzadous"
          />
        </Grid>
        <Grid item lg={6} md={6} sm={12} xl={6} xs={12} container spacing={2}>
          <Grid item lg={12} md={12} sm={12} xl={12} xs={12}>
            <Card {...rest} className={clsx(classes.chartCard)}>
              <CardHeader
                title={`Mean Daily PM2.5 for Past 28 Days From ${dateValue}`}
              />
              <Divider />
              <CardContent>
                <div className={classes.chartContainer}>
                  <Bar data={locationsGraphData} options={options_main} />
                </div>
              </CardContent>
            </Card>
          </Grid>
          <Grid item lg={12} md={12} sm={12} xl={12} xs={12}>
            <ExceedancesChart
              className={clsx(classes.chartCard)}
              chartContainer={classes.chartContainer}
            />
          </Grid>
        </Grid>

        <Grid
          item
          lg={6}
          md={6}
          sm={12}
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
            <Map/>
          </Grid>         
               


          {/* <Grid
            container
            spacing={0}
            className='MapCardContent'
          > */}

          
            {/* <Grid
              item
              lg={2}
              sm={4}
              xl={2}
              xs={12}
            >
             
              <Pm25Levels background="#45e50d" 
                pm25level="Good"
                //pm25levelText = "(0 - 12)"
              />
            </Grid>
            <Grid item lg={2} sm={4} xl={2} xs={12}>
              <Pm25Levels
                background="#f8fe28"
                pm25level="Moderate"
                //pm25levelText="(12.1 - 35.4)"
              />
            </Grid>

            <Grid item lg={2} sm={4} xl={2} xs={12}>
              <Pm25Levels
                background="#ee8310"
                pm25level="Unhealthy for sensitive groups" //Unhealthy for sensitive groups
                pm25levelColor="#FFFFFF"
                //pm25levelText="(35.6 - 55.4)"
              />
            </Grid>

            <Grid item lg={2} sm={4} xl={2} xs={12}>
              <Pm25Levels
                background="#fe0000"
                pm25level="Unhealthy"
                pm25levelColor="#FFFFFF"
                //pm25levelText="(55.5 - 150.4)"
              />
            </Grid>
            <Grid item lg={2} sm={4} xl={2} xs={12}>
              <Pm25Levels
                background="#8639c0"
                pm25level="Very unhealthy"
                pm25levelColor="#FFFFFF"
                //pm25levelText="(150.5 - 250.4)"
              />
            </Grid>
            <Grid item lg={2} sm={4} xl={2} xs={12}>
              <Pm25Levels
                background="#81202e"
                pm25level="Hazardous"
                pm25levelColor="#FFFFFF"
                //pm25levelText="(250.5 - 500.4)"
              />
            </Grid>  */}
             {/* <p>
              PM <sub>2.5</sub> - Particulate Matter 
            </p> */}
                
          {/* </Grid>  */}
        </Grid>

        <Grid item lg={6} md={6} sm={12} xl={6} xs={12}>
          <CustomisableChart className={clsx(classes.chartCard)} />
        </Grid>
        <Grid item lg={6} md={6} sm={12} xl={6} xs={12}>
          <CustomisableChart className={clsx(classes.chartCard)} />
        </Grid>

        <Grid item lg={6} md={6} sm={12} xl={6} xs={12}>
          <CustomisableChart className={clsx(classes.chartCard)} />
        </Grid>

        <Grid item lg={6} md={6} sm={12} xl={6} xs={12}>
          <CustomisableChart className={clsx(classes.chartCard)} />
        </Grid>
      </Grid>
    </div>
  );
};

Dashboard.propTypes = {
  className: PropTypes.string
};

export default Dashboard;
