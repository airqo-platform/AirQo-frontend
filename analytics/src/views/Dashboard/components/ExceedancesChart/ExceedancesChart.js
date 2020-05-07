import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Bar } from 'react-chartjs-2';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardActions, Divider,Grid, Button, Dialog,
DialogActions, DialogContent, DialogTitle, IconButton } from '@material-ui/core';
import {MoreHoriz} from '@material-ui/icons';
import clsx from 'clsx';
import axios from 'axios';
import LoadingSpinner from '../../../Graphs/loadingSpinner';
import Select from 'react-select';


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

const ExceedancesChart = props => {
    const { className, ...rest } = props;
  
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = React.useState(false);

    const [locations, setLocations] =useState([]);
    const [exceedanceValues, setExceedanceValues] = useState([]);
    const [customChartTitle, setCustomChartTitle] = useState('PM 2.5 Exceedances over the past 28 days');
    const [exceedancesData, setExceedancesData] = useState([]);
    const[myStandard, setMyStandard] = useState({value: ""});
    const[myPollutant, setMyPollutant] = useState({value: ""});
    

    
    const [standard, setStandard] = useState('WHO');
    const standardOptions = [
        { value: 'AQI', label: 'AQI' },
        { value: 'WHO', label: 'WHO' },
      ];
    const handleStandardChange = standard => {
        setStandard(standard);
      };
  
    const [pollutant, setPollutant] =  useState('PM 2.5');
    const pollutantOptions = [
        { value: 'PM 2.5', label: 'PM 2.5' },
        { value: 'PM 10', label: 'PM 10' },
        { value: 'NO2', label: 'NO2' }
      ];
    const handlePollutantChange = pollutant => {
        setPollutant(pollutant);
      };
     
    const handleClickOpen = () => {
      setOpen(true);
    };
  
    const handleClose = () => {
      setOpen(false);
    };
    
    /*useEffect(() => {
      //fetch('https://analytcs-bknd-service-dot-airqo-250220.uc.r.appspot.com/api/v1/dashboard/monitoringsites/locations?organisation_name=KCCA')
      fetch('http://127.0.0.1:5000/api/v1/dashboard/monitoringsites/locations?organisation_name=KCCA')
        .then(res => res.json())
        .then((filterLocationsData) => {
          setFilterLocations(filterLocationsData.airquality_monitoring_sites)
        })
        .catch(console.log)
    },[]);*/

  
    /*useEffect(() => {
      
      axios.get('https://analytcs-bknd-service-dot-airqo-250220.uc.r.appspot.com/api/v1/dashboard/customisedchart/random')
      //axios.get('http://127.0.0.1:5000/api/v1/dashboard/customisedchart/random')
        .then(res => res.data)
        .then((customisedChartData) => {
          setCustomisedGraphData(customisedChartData)
          //console.log('customisedChartData');  //var newTime = new Date(element.time)
          //console.log(typeof new Date(customisedChartData.results[0].chart_data.labels[1]));
          setCustomChartTitle(customisedChartData.custom_chart_title)
        })
        .catch(console.log)
    },[]);*/

    function generateTitle(pollutant, standard){
      if (!pollutant){
        pollutant = 'PM 2.5'
      }
      if (!standard){
        standard = 'WHO'
      }

      let title = pollutant + " Exceedances over the past 28 days based on "+standard
      return title
    }
  
    let  handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
    
        let filter ={ 
          pollutant: pollutant.value,
          standard: standard.value
        
        }
        let filter_string = JSON.stringify(filter);
        console.log(filter_string);
    
        axios.post(
          //'https://analytcs-bknd-service-dot-airqo-250220.uc.r.appspot.com/api/v1/device/graph',
          'http://127.0.0.1:5000//api/v1/dashboard/exceedances', 
          filter_string,
          { headers: { 'Content-Type': 'application/json' } }
        )
        .then(
          res=>{
            const myData = res.data;
            console.log(myData);
            setLoading(false);
            setMyStandard(standard.value);
            setMyPollutant(pollutant.value);
            let myValues = [];
            let myLocations = [];
            myData.forEach(element => {
              myLocations.push(element['location']);
              if (standard.value=='AQI'){
                myValues.push(element['UH4SG']+element['Unhealthy']+element['VeryUnhealthy']+element['Hazardous']);
              }
              else{
                myValues.push(element['exceedances']);
              }
            });
            //console.log('myLocations')
            //console.log(myLocations)
            setLocations(myLocations);
            setExceedanceValues(myValues);
            setCustomChartTitle(pollutant.value+ ' exceedances over the past 28 days based on '+standard.value)
    
        }).catch(
          console.log
        )
      }
    
    return (
      <Card
        {...rest}
        className={clsx(classes.root, className)}
      >
        <CardHeader  
          action={
            <IconButton size="small" color="primary" onClick={handleClickOpen}>
              <MoreHoriz />
            </IconButton>
          }      
          
          title= {customChartTitle}
          style={{ textAlign: 'center' }}
        />
        <Divider />
        <CardContent>
                  
          <Grid
            container
            spacing={1}
          >
            <Grid
              item
              lg={12}
              sm={12}
              xl={12}
              xs={12}
            >           
              
        <div>
        {loading ? <LoadingSpinner /> : 
        <Bar
        data= {
            {
            labels: locations,
            datasets:[
               {
                  label:'Exceedances',
                  data: exceedanceValues,
                  backgroundColor: 'red',
                  borderColor: 'rgba(0,0,0,1)',   
                  borderWidth: 1
               }
            ]
         }
        }
        options={{
         /* title:{
            display:true,
            text: generateTitle(myPollutant, myStandard),
            fontColor: "black",
            fontSize: 20,
            fontWeight:5
          },*/

          scales: {
            yAxes: [{
              scaleLabel: {
                display: true,
                labelString: 'Exceedances',
                fontWeight:4,
                fontColor: "black",
                fontSize:15,
                padding: 10
              },
              ticks: {
                fontColor:"black"                 
                },
              gridLines:{
                lineWidth: 1,
                display: false
                //color: "rgba(0, 0, 0, 0)",
              }
            }],
            xAxes: [{
              scaleLabel: {
                display: true,
                labelString: 'Locations',
                fontWeight:4,
                fontColor: "black",
                fontSize: 15,
                padding: 6
              },
              ticks: {
                fontColor:"black"                 
                },
              gridLines:{
                lineWidth: 1,
                //display:false
              }

            }],
          },
         /* legend:{
            display: true,
            position: 'right'
          },*/
          maintainAspectRatio: true,
          responsive: true
          }}/>}
        </div>
              
            </Grid>
          
            <Grid
              item
              lg={12}
              sm={12}
              xl={12}
              xs={12}
              
            > 
              <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
              <DialogTitle id="form-dialog-title">Customise Chart by Selecting the Various Options</DialogTitle>
              <Divider/>
              <DialogContent>
                
                <form 
                  onSubmit={handleSubmit} 
                  id="customisable-form"
                >             
                  
                  <Grid
                    container
                    spacing={2}
                  >             

                    <Grid
                      item
                      md={6}
                      xs={12}
                    >                
                      <Select
                        fullWidth
                        label="Pollutant"
                        className=""
                        name="pollutant"
                        placeholder="Pollutant"
                        value={pollutant}
                        options={pollutantOptions}
                        onChange={handlePollutantChange}
                        variant="outlined"
                        margin="dense"  
                        required            
                      />
                    </Grid>
                    
                    <Grid
                      item
                      md={6}
                      xs={12}
                    >     
                      <Select
                        fullWidth
                        label ="Standard"
                        className=""
                        name="standard"
                        placeholder="Standard"
                        value={standard}
                        options={standardOptions}
                        onChange={handleStandardChange}
                        variant="outlined"
                        margin="dense"   
                        required           
                      />
                    </Grid>
                    
                  
                  </Grid>
                </form>            
              
              </DialogContent>
              <Divider/>
              <DialogActions>
                <Button 
                  onClick={handleClose} 
                  color="primary"
                  variant="outlined"
                >
                  Cancel
                </Button>
                <Button
                  variant="outlined" 
                  onClick={handleClose} 
                  color="primary"                  
                  type="submit"        //set the buttom type is submit
                  form="customisable-form"
                >
                  Customise
                </Button>
              </DialogActions>
            </Dialog>                   
            </Grid>
            
          </Grid>
  
        </CardContent>
      </Card>
    );
  };
  
ExceedancesChart.propTypes = {
    className: PropTypes.string
  };
  
export default ExceedancesChart;
  

