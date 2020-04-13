import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Map as LeafletMap, TileLayer, Popup, CircleMarker } from 'react-leaflet';

import {
  Card,
  CardContent, 
} from '@material-ui/core';
//import InsertChartIcon from '@material-ui/icons/InsertChartOutlined';
import { useEffect, useState } from 'react';

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%'
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
  }
}));

const Map = props => {
  const { className, ...rest } = props;

  const classes = useStyles();

  const [contacts,setContacts ] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/v1/monitoringsites/?organisation_name=KCCA')
      .then(res => res.json())
      .then((contactData) => {
        setContacts(contactData.airquality_monitoring_sites)
      })
      .catch(console.log)
  },[]);

  return (
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      <CardContent>
        <LeafletMap
          animate
          attributionControl
          center={[0.3341424,32.5600613]}
          doubleClickZoom
          dragging
          easeLinearity={0.35}
          scrollWheelZoom
          zoom={12}
          // maxZoom={20}
          
          zoomControl        
          
        >
          <TileLayer
            url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
          />
           
        
        
          {contacts.map((contact) => (
            <CircleMarker 
              center={[contact.Latitude,contact.Longitude]}
              color="red"
              fill="true"
              key={contact._id.$oid}
              
              
              
              radius={8}
            >
              <Popup>
                {contact.Division} {contact.SiteName}
              </Popup>
            </CircleMarker>         
          ))}
            

        </LeafletMap>
        
      </CardContent>

    </Card>

    


  );
};

Map.propTypes = {
  className: PropTypes.string
};

export default Map;
