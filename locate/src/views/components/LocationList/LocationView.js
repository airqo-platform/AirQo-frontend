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
  
  useEffect(() => {
    axios.get(
      'http://127.0.0.1:4000/api/v1/location_registry?loc_ref='+params.loc_ref
    )
    .then(
      res=>{
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
              <TableCell>Host Name: {locData.host}</TableCell>  
              <TableCell>Parish: {locData.parish}</TableCell> 
              <TableCell>Altitude: {locData.altitude}</TableCell>   
            </TableRow> 
            <TableRow>  
              <TableCell>Mobility: {locData.mobility}</TableCell>  
              <TableCell>Internet: {locData.internet}</TableCell> 
              <TableCell>Aspect: {locData.aspect}</TableCell>   
            </TableRow> 
            <TableRow>  
              <TableCell>Latitude: {locData.latitude}</TableCell>  
              <TableCell>Power Type: {locData.power}</TableCell> 
              <TableCell>Landform (90): {locData.landform_90}</TableCell>   
            </TableRow> 
            <TableRow>  
              <TableCell>Longitude: {locData.longitude}</TableCell>  
              <TableCell>Height above ground (m): {locData.height_above_ground}</TableCell> 
              <TableCell>Landform (270): {locData.landform_270}</TableCell>   
            </TableRow> 
            <TableRow>  
              <TableCell>Country: {locData.country}</TableCell>  
              <TableCell>Road Intensity: {locData.road_intensity}</TableCell> 
              <TableCell>Distance to nearest road (m): {locData.distance_from_nearest_road}</TableCell>   
            </TableRow> 
            <TableRow>  
              <TableCell>Region: {locData.region}</TableCell>  
              <TableCell>Installation Description: {locData.installation_type}</TableCell> 
              <TableCell>Distance to nearest residential road (m): {locData.distance_from_residential}</TableCell>   
            </TableRow> 
            <TableRow>  
              <TableCell>District: {locData.district}</TableCell>  
              <TableCell>Road Status: {locData.road_status}</TableCell> 
              <TableCell>Distance to nearest motorway (m): {locData.distance_from_motorway}</TableCell>   
            </TableRow> 
            <TableRow>  
              <TableCell>Subcounty: {locData.subcounty}</TableCell>  
              <TableCell>Local Activities: {locData.local_activities}</TableCell> 
              <TableCell>Distance to nearest city/town (m): {locData.distance_from_city}</TableCell>   
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
    </div>
    )

  }
 


LocationView.propTypes = {
  className: PropTypes.string
};

export default LocationView;