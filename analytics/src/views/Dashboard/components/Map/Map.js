import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Map as LeafletMap, TileLayer, Marker, Popup } from 'react-leaflet';
import FullscreenControl from 'react-leaflet-fullscreen';
import 'react-leaflet-fullscreen/dist/styles.css'


import {
  Card,
  CardContent,
} from '@material-ui/core';
// import InsertChartIcon from '@material-ui/icons/InsertChartOutlined';

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

  return (
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      <CardContent>
        <LeafletMap
          center={[0.3341424,32.5600613]}
          zoom={12}
          // maxZoom={20}
          attributionControl={true}
          zoomControl={true}
          doubleClickZoom={true}
          scrollWheelZoom={true}
          dragging={true}
          animate={true}
          easeLinearity={0.35}
        >
        <TileLayer
          url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
        />
        <Marker position={[0.3341424,32.5600613]}>
          <Popup>
            Makerere University.
          </Popup>
        </Marker>

        <FullscreenControl position="topright" />
        </LeafletMap>
        
      </CardContent>
    </Card>
  );
};

Map.propTypes = {
  className: PropTypes.string
};

export default Map;
