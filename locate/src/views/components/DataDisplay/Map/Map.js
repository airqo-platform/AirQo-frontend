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
}));

const Map = props => {
  const { className, ...rest } = props;

  const classes = useStyles();
  const [contacts,setContacts ] = useState([]);

  useEffect(() => {
   fetch('http://127.0.0.1:4001/api/v1/monitor/devices/online_offline')
      .then(res => res.json())
      .then((contactData) => {
        let devices = contactData["online_offline_devices"]
        console.log(devices)
        setContacts(devices)
        console.log(contacts)
      })
      .catch(console.log)
  },[]);

  let CategoryColorClass = (isOnline) =>{
    return isOnline == true  ? 'deviceOnline' :
      isOnline == false  ? 'deviceOffline' :
                'UnCategorise';
  }

  let CategoryColorClass2 = (isDue) =>{
    return isDue == "codeGreen"  ? 'green' :
      isDue == "codeRed"  ? 'red' :
                'orange';
  }

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
              key={contact.channelId} 
              clickable="true"  
              icon={
                L.divIcon({
                //html:`${contact.isOnline}`,
                iconSize: 38,
                className:`leafletMarkerIcon ${CategoryColorClass2(contact.isDueMaintenance)}`
                 })}
              >
            </Marker>   
          ))}  

          {contacts.map((contact) => (
            <Marker 
              position={[contact.latitude,contact.longitude]}
              fill="false"
              key={contact.channelId} 
              clickable="true"  
              icon={
                L.divIcon({
                //html:`${contact.isOnline}`,
                iconSize: 30,
                className:`leafletMarkerIcon ${CategoryColorClass(contact.isOnline)}`
                 })}
              >
              {/* <Popup> 
              </Popup> */}
            </Marker>   
          ))} 
          <FullscreenControl position="topleft" />
        </LeafletMap>
 
  );
};
Map.propTypes = {
  className: PropTypes.string
};
export default Map;
