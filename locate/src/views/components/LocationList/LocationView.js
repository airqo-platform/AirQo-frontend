import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import PropTypes from 'prop-types';
import { Card, CardContent, Grid, Button, Typography, Divider, CardHeader } from '@material-ui/core';
import clsx from 'clsx';
import Select from 'react-select';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import TextField from '@material-ui/core/TextField';
import { TableContainer, Table, TableBody, TableCell, TableHead, TableRow, Paper } from '@material-ui/core';
import { Link } from "react-router-dom";
import LoadingOverlay from 'react-loading-overlay';
import '../../../assets/css/location-registry.css';
import { Map, FeatureGroup, LayerGroup, TileLayer, Marker, Popup } from "react-leaflet";
import 'react-leaflet-fullscreen/dist/styles.css';
import img from '../../../assets/img/locations/placeholder.png';
import constants from '../../../config/constants.js';


const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3),
  },
  content: {
    marginTop: theme.spacing(2)
  },
  cardMap: {
    maxWidth: 345,
    width: 50,
  },
  title: {
    fontWeight: 700,
    color: '#000000',
    fontSize: 20,
    fontFamily: 'Open Sans'
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
  },

  formControl: {
    margin: theme.spacing(3),
    fontFamily: 'Open Sans'
  },

  table: {
    fontFamily: 'Open Sans'
  },

  divClear: {
   clear: 'both'
  },
  paper: {
    maxWidth: 400,
    height: 310,
    //width:800,
    margin: `${theme.spacing(1)}px auto`,
    //margin: '10px auto',
    padding: theme.spacing(2),
    textAlign: 'center'
  },
  
  
}));

const LocationView = props => {
  const { className, ...rest } = props;
  let params = useParams();
  const classes = useStyles();

  const [locData, setLocData] = useState('')
  const [isLoading, setIsLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [position, setPosition] = useState([0,0]);
  
  useEffect(() => {
    setIsLoading(true);
    axios.get(
      'http://127.0.0.1:4000/api/v1/location_registry/location?loc_ref='+params.loc_ref
      //constants.VIEW_LOCATION_URI+params.loc_ref
    )
    .then(
      res=>{
        
        setIsLoading(false);
        const data = res.data;
        console.log(data);
        setLocData(data);
        setPosition([data.latitude, data.longitude]);
        //console.log(locData);
        setLoaded(true);
    }).catch(
      console.log
    )
  }, []);
 
    return(
      <div className={classes.root}>
        <LoadingOverlay
          active={isLoading}
         spinner
      text='Loading Location details...'
    >
     
      <Grid
        container
        spacing={4}
      >
        <Grid
          item
          lg={12}
          sm={12}
          xl={12}
          xs={12}
        >
          <Typography  className={classes.title} variant="h6" id="tableTitle" component="div">
          {locData.loc_ref} : {locData.location_name}
        </Typography> 
        </Grid>  
        </Grid>

      {/*Meandering starts here*/}
      {/*}

      {locData.mobility=='Static'?
       (

        <Paper className={classes.paper}>
          <Paper elevation ={0}>
        <Grid
        container
        spacing={2}
         >
          <Grid
            item
            //lg={6}
            sm={6}
            //xl={6}
            xs={12}
            styles ={{alignContent:'center'}}
            alignContent='center'
            alignItems= 'center'
            justify='center'
          >

          {loaded? 
      (
       <Map center={[locData.latitude, locData.longitude]} 
       zoom={13} 
       scrollWheelZoom={false}
       style={{ width: '30%', height: '250px', align:'center'}}
       >
         <TileLayer
            url ="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          /> 
        <Marker position={[locData.latitude, locData.longitude]}>
        <Popup>
          <span>
            <span>
              {locData.location_name}
            </span>
          </span>
        </Popup>
        </Marker>
      </Map> 
         ):
       (
        <Map center={[0, 0]} 
       zoom={13} 
       scrollWheelZoom={false}
       style={{ width: '30%', height: '250px', align:'center'}}
       > 
       <TileLayer
            url ="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
      </Map> 
       )
    }
        </Grid>
        </Grid>
        </Paper>
        <Paper elevation={0}>
        <Grid container>
        <Grid
          item
          lg={12}
          sm={6}
          //xl={12}
          xs={12}
        >
        <img src={img} alt='location image' />
        </Grid>  
        </Grid>
        </Paper>
      
       </Paper>) : null} */}
       {/*and ends here} */}
       
       
       {locData.mobility=='Static'?
       (

        <Paper className={classes.paper}>
        <Grid
        container
        spacing={4}
         >
          <Grid
            item
            lg={6}
            sm={6}
            xl={6}
            xs={6}
            style ={{alignContent:'center'}}
            alignContent='center'
            alignItems= 'center'
            justify='center'
          >

          {loaded? 
      (
       <Map center={[locData.latitude, locData.longitude]} 
       zoom={13} 
       scrollWheelZoom={false}
       //style = {{width: '30%', height: '250px', top: '70px'}}
       style = {{width: '30%', height: '250px', top: '0px'}}
       //style={{ width: '30%', height: '250px', align:'center'}}
       >
         <TileLayer
            url ="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          /> 
        <Marker position={[locData.latitude, locData.longitude]}>
        <Popup>
          <span>
            <span>
              {locData.location_name}
            </span>
          </span>
        </Popup>
        </Marker>
      </Map> 
         ):
       (
        <Map center={[0, 0]} 
       zoom={13} 
       scrollWheelZoom={false}
       style={{ width: '30%', height: '250px', align:'center'}}
       > 
       <TileLayer
            url ="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
      </Map> 
       )
    }
        </Grid>
        </Grid>
       </Paper>
       ) : null}
       
       

        <Grid
        container
        spacing={4}
      >
      
        <Grid
          item
          lg={12}
          md={12}
          sm={12}
          xl={12}
          xs={12}
          
        >
        <TableContainer component={Paper} className = {classes.table}>  
         <Table stickyHeader  aria-label="sticky table">  
          <TableBody>  
            <TableRow>  
              <TableCell className = {classes.table}>Host Ref: <b>{locData.host}</b></TableCell>  
              <TableCell className = {classes.table}>District: <b>{locData.district}</b></TableCell> 
              <TableCell className = {classes.table}>Aspect: <b>{locData.aspect}</b></TableCell> 
              {/*
              <TableCell className = {classes.table}>Parish: <b>{locData.parish}</b></TableCell> 
              <TableCell className = {classes.table}>Altitude: <b>{locData.altitude}</b></TableCell>*/}
            </TableRow> 
            <TableRow>  
              <TableCell className = {classes.table}>Mobility: <b>{locData.mobility}</b></TableCell> 
              <TableCell className = {classes.table}>Subcounty: <b>{locData.subcounty}</b></TableCell> 
              <TableCell className = {classes.table}>Landform (90): <b>{locData.landform_90}</b></TableCell>  
              {/* 
              <TableCell className = {classes.table}>Internet: <b>{locData.internet}</b></TableCell> 
              <TableCell className = {classes.table}>Aspect: <b>{locData.aspect}</b></TableCell>   */}
            </TableRow> 
            <TableRow>  
              <TableCell className = {classes.table}>Latitude: <b>{locData.latitude}</b></TableCell> 
              <TableCell className = {classes.table}>Parish: <b>{locData.parish}</b></TableCell>
              <TableCell className = {classes.table}>Landform (270): <b>{locData.landform_270}</b></TableCell>   
              {/* 
              <TableCell className = {classes.table}>Power Type: <b>{locData.power}</b></TableCell> 
              <TableCell className = {classes.table}>Landform (90): <b>{locData.landform_90}</b></TableCell>  */} 
            </TableRow> 
            <TableRow>  
              <TableCell className = {classes.table}>Longitude: <b>{locData.longitude}</b></TableCell> 
              <TableCell className = {classes.table}>Road Intensity: <b>{locData.road_intensity}</b></TableCell>
              <TableCell className = {classes.table}>Distance to nearest road (m): <b>{locData.distance_from_nearest_road}</b></TableCell>  
              {/* 
              <TableCell className = {classes.table}>Height above ground (m): <b>{locData.height_above_ground}</b></TableCell> 
              <TableCell className = {classes.table}>Landform (270): <b>{locData.landform_270}</b></TableCell>   */}
            </TableRow> 
            <TableRow>  
              <TableCell className = {classes.table}>Description: <b>{locData.description}</b></TableCell>  
              <TableCell className = {classes.table}>Road Status: <b>{locData.road_status}</b></TableCell> 
              <TableCell className = {classes.table}>Distance to nearest residential road (m): <b>{locData.distance_from_residential}</b></TableCell>
              {/*
              <TableCell className = {classes.table}>Country: <b>{locData.country}</b></TableCell>  
              <TableCell className = {classes.table}>Road Intensity: <b>{locData.road_intensity}</b></TableCell> 
              <TableCell className = {classes.table}>Distance to nearest road (m): <b>{locData.distance_from_nearest_road}</b></TableCell> */}  
            </TableRow> 
            <TableRow> 
              <TableCell className = {classes.table}>Country: <b>{locData.country}</b></TableCell> 
              <TableCell className = {classes.table}>Altitude: <b>{locData.altitude}</b></TableCell>
              <TableCell className = {classes.table}>Distance to nearest motorway (m): <b>{locData.distance_from_motorway}</b></TableCell>  
              {/*
              <TableCell className = {classes.table}>Region: <b>{locData.region}</b></TableCell>  
              <TableCell className = {classes.table}>Installation Description: <b>{locData.installation_type}</b></TableCell> 
              <TableCell className = {classes.table}>Distance to nearest residential road (m): <b>{locData.distance_from_residential}</b></TableCell>   
              */}
            </TableRow> 
            {/*
            <TableRow>  
              <TableCell className = {classes.table}>District: <b>{locData.district}</b></TableCell>  
              <TableCell className = {classes.table}>Road Status: <b>{locData.road_status}</b></TableCell> 
              <TableCell className = {classes.table}>Distance to nearest motorway (m): <b>{locData.distance_from_motorway}</b></TableCell>   
            </TableRow> */}
            <TableRow>  
              <TableCell className = {classes.table}>Region: <b>{locData.region}</b></TableCell> 
              {/*<TableCell className = {classes.table}>Subcounty: <b>{locData.subcounty}</b></TableCell>  */}
              {
              loaded?
                    <TableCell className = {classes.table}>Local Activities: <b>{locData.local_activities.join()}</b></TableCell>
                    :
                    <TableCell className = {classes.table}>Local Activities: <b>{locData.local_activities}</b></TableCell>
                }
              <TableCell className = {classes.table}>Distance to nearest city/town (m): <b>{locData.distance_from_city}</b></TableCell>   
            </TableRow> 
          </TableBody> 
        </Table> 
     </TableContainer>
                 

            </Grid>
          </Grid>
      {/*
        <Grid
        container
        spacing={4}
        >
        <Grid
          item
          lg={12}
          sm={12}
          xl={12}
          xs={12}
        >
        <img src={img} alt='location image' />
        </Grid>  
        </Grid> 
        */}

          <Grid
        container
        spacing={4}
      >
      
        <Grid
          item
          lg={12}
          md={12}
          sm={12}
          xl={12}
          xs={12}
          
        >
        <Link to={`/edit/${locData.loc_ref}`}>
        <Button 
          variant="contained" 
          color="primary"              
          type="submit"
          align = "centre"
          fontFamily = 'Open Sans'
        > Edit Location
        </Button>
        </Link>    
        </Grid>
        </Grid>



      </LoadingOverlay>
      </div>
      
              
    )
  }

LocationView.propTypes = {
  className: PropTypes.string
};

export default LocationView;