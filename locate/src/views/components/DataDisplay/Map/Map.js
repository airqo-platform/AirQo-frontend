import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Map as LeafletMap, TileLayer, Popup, Marker} from 'react-leaflet';
import {Link } from 'react-router-dom';
import {Card, CardContent, CardHeader, Divider} from '@material-ui/core';
import { useEffect, useState } from 'react';
import FullscreenControl from 'react-leaflet-fullscreen';
import 'react-leaflet-fullscreen/dist/styles.css';
import L, { control } from 'leaflet';
import Filter from './FilterPowerSource.jsx';
import axios from "axios";
import ReactDOM from 'react-dom';
// import '../../../../assets/scss/index.scss';

const useStyles = makeStyles(theme => ({
  root: {
    // height: '100%',
    padding: '0',
	  margin: 0,
	  border: 0,  
  },
  content: {
    alignItems: 'center',
    display: 'flex'
  },
  title: {
    fontWeight: 700
  },
  avatar: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    height: 56,
    width: 56
  },
  icon: {
    height: 32,
    width: 32
  },
  progress: {
    marginTop: theme.spacing(3)
  },

  leafletMarkerIcon: {
    color: "#3f51b5",
    backgroundColor:"#3f51b5",
    fontSize: "12px",
    fontWeight: "700",
    lineHeight: "35px",
    textAlign: "center",
    verticalAlign: "bottom",
    boxShadow: "2px 1px 4px rgba(0,0,0,0.2)",
    borderRadius: "30px",
    borderWidth: "3px",
    opacity: 1	
  }
}));

const Map = props => {
  const { className, ...rest } = props;

  const classes = useStyles();
  const [magnitude,setMagnitude ] = useState('All');
  const [contacts,setContacts ] = useState([]);

  useEffect(() => {
   fetch('http://127.0.0.1:4001/api/v1/monitor/devices/online_offline')
      .then(res => res.json())
      .then((contactData) => {
        let devices = contactData["online_offline_devices"]
        console.log("devices")
        console.log(devices)
        setContacts(devices)
        console.log(contacts)
      })
      .catch(console.log)
  },[]);

  let getPm25CategoryColorClass = (isOnline) =>{
    return isOnline > false  ? 'pm25Harzadous' :
      isOnline > true  ? 'pm25VeryUnHealthy' :
                'pm25UnCategorised';
  }

  let fetchFilteredData = (magnitude) => {
    //this.setState({ isLoaded: false }, () => {
    fetch('http://127.0.0.1:4001/api/v1/monitor/devices/online_offline')
      .then(res => res.json())
      .then((contactData) => {
        setContacts(contactData)
      });
  };

  return (
    
        <LeafletMap
          animate
          attributionControl
          center={[0.3341424,32.5600613]}
          doubleClickZoom
          dragging
          easeLinearity={0.35}
          scrollWheelZoom
          zoom={7}
          
          zoomControl        
          
        >
          <TileLayer
            url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
          />           
          {contacts.map((contact) => (
            <Marker 
              position={[contact.latitude,contact.longitude]}
              fill="true"
              key={contact._id} 
              clickable="true"  
              icon={
                L.divIcon({
                //html:`${contact.isOnline}`,
                iconSize: 35,
                className:`leafletMarkerIcon ${getPm25CategoryColorClass(contact.isOnline)}`
                //className: classes.leafletMarkerIcon
                 })}
              >
              <Popup>
               
              </Popup>
            </Marker>   
          ))}    
      
          <FullscreenControl position="topleft" />

          {/* <Filter fetchFilteredData={fetchFilteredData} /> */}

        </LeafletMap>
 
  );
};


Map.propTypes = {
  className: PropTypes.string
};

export default Map;
