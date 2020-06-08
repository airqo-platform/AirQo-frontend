import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import PropTypes from 'prop-types';
import { Card, CardContent, Grid, Button,Typography } from '@material-ui/core';
import clsx from 'clsx';
import Select from 'react-select';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import TextField from '@material-ui/core/TextField';
import { TableContainer, Table, TableBody, TableCell, TableHead, TableRow, Paper } from '@material-ui/core';
import { Link } from "react-router-dom";
import LoadingOverlay from 'react-loading-overlay';


//import Select from '@material-ui/core/Select';


const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3)
  },
  content: {
    marginTop: theme.spacing(2)
  },
  title: {
    fontWeight: 700,
    color: '#000000',
    fontSize: 20,
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
  },
  textField: {
    width: '250px',
    textAlign: 'left',
    marginLeft: 'auto',
    marginRight: 'auto',            
    paddingBottom: 0,
    marginTop: 0,
    fontWeight: 500,
    border: '2px solid #7575FF',    
},
  
}));

const LocationView = props => {
  const { className, ...rest } = props;
  let params = useParams();
  const classes = useStyles();

  const [locData, setLocData] = useState('')
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    setIsLoading(true);
    axios.get(
      'http://127.0.0.1:4000/api/v1/location_registry?loc_ref='+params.loc_ref
    )
    .then(
      res=>{
        setIsLoading(false);
        const data = res.data;
        console.log(data);
        setLocData(data);
        //console.log(locData);
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
      <div>
        <Typography  className={classes.title} variant="h6" id="tableTitle" component="div">
          {locData.loc_ref} : {locData.location_name}
        </Typography> 
      </div>
      <br/>
      <div>
     <TableContainer component={Paper}>  
        <Table stickyHeader  aria-label="sticky table">  
         {/* <TableHead>  
            <TableRow align='center'>  {locData.loc_ref}: {locData.location_name}
              {/*<TableCell align="center">{locData.loc_ref}: {locData.location_name}</TableCell> *
            </TableRow> 
          </TableHead> */}
          <TableBody>  
            <TableRow>  
              <TableCell>Host Name: <b>{locData.host}</b></TableCell>  
              <TableCell>Parish: <b>{locData.parish}</b></TableCell> 
              <TableCell>Altitude: <b>{locData.altitude}</b></TableCell>   
            </TableRow> 
            <TableRow>  
              <TableCell>Mobility: <b>{locData.mobility}</b></TableCell>  
              <TableCell>Internet: <b>{locData.internet}</b></TableCell> 
              <TableCell>Aspect: <b>{locData.aspect}</b></TableCell>   
            </TableRow> 
            <TableRow>  
              <TableCell>Latitude: <b>{locData.latitude}</b></TableCell>  
              <TableCell>Power Type: <b>{locData.power}</b></TableCell> 
              <TableCell>Landform (90): <b>{locData.landform_90}</b></TableCell>   
            </TableRow> 
            <TableRow>  
              <TableCell>Longitude: <b>{locData.longitude}</b></TableCell>  
              <TableCell>Height above ground (m): <b>{locData.height_above_ground}</b></TableCell> 
              <TableCell>Landform (270): <b>{locData.landform_270}</b></TableCell>   
            </TableRow> 
            <TableRow>  
              <TableCell>Country: <b>{locData.country}</b></TableCell>  
              <TableCell>Road Intensity: <b>{locData.road_intensity}</b></TableCell> 
              <TableCell>Distance to nearest road (m): <b>{locData.distance_from_nearest_road}</b></TableCell>   
            </TableRow> 
            <TableRow>  
              <TableCell>Region: <b>{locData.region}</b></TableCell>  
              <TableCell>Installation Description: <b>{locData.installation_type}</b></TableCell> 
              <TableCell>Distance to nearest residential road (m): <b>{locData.distance_from_residential}</b></TableCell>   
            </TableRow> 
            <TableRow>  
              <TableCell>District: <b>{locData.district}</b></TableCell>  
              <TableCell>Road Status: <b>{locData.road_status}</b></TableCell> 
              <TableCell>Distance to nearest motorway (m): <b>{locData.distance_from_motorway}</b></TableCell>   
            </TableRow> 
            <TableRow>  
              <TableCell>Subcounty: <b>{locData.subcounty}</b></TableCell>  
              <TableCell>Local Activities: <b>{locData.local_activities}</b></TableCell> 
              <TableCell>Distance to nearest city/town (m): <b>{locData.distance_from_city}</b></TableCell>   
            </TableRow> 
          </TableBody> 
        </Table> 
     </TableContainer>
     </div>

     <br/>

     <div>    
     <Link to={`/edit/${locData.loc_ref}`}>
     <Button 
          variant="contained" 
          color="primary"              
          type="submit"
          align = "centre"
        > Edit Location
        </Button>
     </Link>    
      </div>
      </LoadingOverlay>
    </div>
    )

  }
 


LocationView.propTypes = {
  className: PropTypes.string
};

export default LocationView;