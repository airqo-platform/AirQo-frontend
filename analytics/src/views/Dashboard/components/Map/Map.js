import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { Map as LeafletMap, TileLayer, Popup, Marker } from "react-leaflet";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, Divider } from "@material-ui/core";
import { useEffect, useState } from "react";
import FullscreenControl from "react-leaflet-fullscreen";
import "react-leaflet-fullscreen/dist/styles.css";
import L from "leaflet";
// import Legend from "./Legend";
import constants from "config/constants";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    padding: "0",
    margin: 0,
    border: 0,
  },
  content: {
    alignItems: "center",
    display: "flex",
  },
  title: {
    fontWeight: 700,
  },
  avatar: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    height: 56,
    width: 56,
  },
  icon: {
    height: 32,
    width: 32,
  },
  progress: {
    marginTop: theme.spacing(3),
  },
}));
//const { BaseLayer, Overlay } = LayersControl;

const Map = (props) => {
  const { className, ...rest } = props;

  const classes = useStyles();

  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    fetch(constants.GET_MONITORING_SITES_URI)
      .then((res) => res.json())
      .then((contactData) => {
        setContacts(contactData.airquality_monitoring_sites);
      })
      .catch(console.log);
  }, []);

  let getPm25CategoryColorClass = (aqi) => {
    return aqi > 250.4
      ? "pm25Harzadous"
      : aqi > 150.4
      ? "pm25VeryUnHealthy"
      : aqi > 55.4
      ? "pm25UnHealthy"
      : aqi > 35.4
      ? "pm25UH4SG"
      : aqi > 12
      ? "pm25Moderate"
      : aqi > 0
      ? "pm25Good"
      : "pm25UnCategorised";
  };

  return (
    <Card {...rest} className={clsx(classes.root, className)}>
      <CardHeader
        title={"Mean PM2.5 by Location for Past 60 Minutes"}
        subheader={
          "Colours indicate AQI level of concern if maintained as a 24 hour average"
        }
      />
      <Divider />

      <CardContent>
        <LeafletMap
          animate
          attributionControl
          center={[0.3341424, 32.5600613]}
          doubleClickZoom
          dragging
          easeLinearity={0.35}
          scrollWheelZoom
          zoom={12}
          zoomControl
        >
          <TileLayer
            url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          {contacts.map((contact) => (
            <Marker
              position={[contact.Latitude, contact.Longitude]}
              fill="true"
              key={contact._id}
              clickable="true"
              icon={L.divIcon({
                html: `${
                  contact.Last_Hour_PM25_Value == 0
                    ? ""
                    : contact.Last_Hour_PM25_Value
                }`,
                iconSize: 35,
                className: `leaflet-marker-icon ${getPm25CategoryColorClass(
                  contact.Last_Hour_PM25_Value
                )}`,
              })}
            >
              <Popup>
                <h2>
                  {contact.Parish} - {contact.Division} Division
                </h2>
                <h4>{contact.LocationCode}</h4>

                <h1>
                  {" "}
                  {contact.Last_Hour_PM25_Value == 0
                    ? ""
                    : contact.Last_Hour_PM25_Value}
                </h1>
                <span>Last Refreshed: {contact.LastHour} (UTC)</span>
                <Divider />

                <Link to={`/location/${contact.Parish}`}>More Details</Link>
              </Popup>
            </Marker>
          ))}

          <FullscreenControl position="topright" />

          {/* <Legend/> */}
        </LeafletMap>
      </CardContent>
    </Card>
  );
};

Map.propTypes = {
  className: PropTypes.string,
};

export default Map;
