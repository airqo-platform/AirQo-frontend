import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { Map as LeafletMap, TileLayer, Popup, Marker } from "react-leaflet";
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
} from "@material-ui/core";
import { useEffect, useState } from "react";
import FullscreenControl from "react-leaflet-fullscreen";
import "react-leaflet-fullscreen/dist/styles.css";
import L from "leaflet";
import { GET_MONITORING_SITES_URI, GET_DATA_MAP } from "config/urls/analytics";
import Filter from "./Filter";
import moment from "moment-timezone";


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
  const [magnitude, setMagnitude] = useState("All");

  useEffect(() => {
    fetch(GET_MONITORING_SITES_URI)
      .then((res) => res.json())
      .then((contactData) => {
        setContacts(contactData.airquality_monitoring_sites);
      })
      .catch(console.log);
  }, []);

  useEffect(() => {
    fetch(GET_DATA_MAP + magnitude)
      .then((res) => res.json())
      .then((contactData) => {
        setContacts(contactData.airquality_monitoring_sites);
      })
      .catch(console.log);
  }, []);

  let fetchFilteredData = (magnitude) => {
    //this.setState({ isLoaded: false }, () => {
    fetch(GET_DATA_MAP + magnitude)
      .then((res) => res.json())
      .then((contactData) => {
        setContacts(contactData.airquality_monitoring_sites);
      });
  };
  //classify marker colors based on AQI value

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

  //change popup text based on AQI value
  let getCategorytext = (aqi) => {
    return aqi > 250.4
      ? "Harzadous"
      : aqi > 150.4
      ? "Very UnHealthy"
      : aqi > 55.4
      ? "Unhealthy"
      : aqi > 35.4
      ? "Unhealthy for sensitive groups"
      : aqi > 12
      ? "Moderate"
      : aqi > 0
      ? "Good"
      : "UnCategorised";
  };

  //change popup background color based on AQI value

  let getbackground = (aqi) => {
    return aqi > 250.4
      ? "#81202e"
      : aqi > 150.4
      ? "#8639c0"
      : aqi > 55.4
      ? "#fe0023"
      : aqi > 35.4
      ? "#ee8327"
      : aqi > 12
      ? "#f8fe39"
      : aqi > 0
      ? "#44e527"
      : "#797979";
  };

  //Convert date from UTC to EAT
  let getDateString = (t, tz) => {
    return moment
      .utc(t, "YYYY-MM-DD HH:mm")
      .tz("Africa/Kampala")
      .format("YYYY-MM-DD HH:mm");
  };

  return (
    <Card {...rest} className={clsx(classes.root, className)}>
      <CardHeader
        title="Mean PM2.5 by Location for Past 60 Minutes"
        subheader="Colours indicate AQI level of concern if maintained as a 24 hour average"
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
                <popup_a>
                  {contact.Parish} - {contact.Division} Division
                </popup_a><br></br>
                <span>{contact.LocationCode}</span>

                <div
                  style={{
                    backgroundColor: `${getbackground(
                      contact.Last_Hour_PM25_Value
                    )}`,
                    padding: "10px",
                    marginTop: "10px",
                    marginBottom: "10px",
                  }}
                >
                  {/* <img
              src="https://cdn3.iconfinder.com/data/icons/basicolor-arrows-checks/24/149_check_ok-512.png"
              width="50"
              height="50"
              alt="no img"
            /> */}

                  <popup_a
                    style={{
                      fontWeight: "normal",
                    }}
                  >
                    {" "}
                    AQI:{" "}
                    {contact.Last_Hour_PM25_Value == 0
                      ? ""
                      : contact.Last_Hour_PM25_Value}{" "}
                    -{" "}
                    {getCategorytext(
                      contact.Last_Hour_PM25_Value == 0
                        ? ""
                        : contact.Last_Hour_PM25_Value
                    )}
                  </popup_a>
                </div>
                <span>
                  Last Refreshed: {getDateString(contact.LastHour)} (EAT)
                </span>
                {/*<Divider />*/}
                {/*<Link to={`/location/${contact.Parish}`}>More Details</Link>*/}
              </Popup>
            </Marker>
          ))}

          <FullscreenControl position="topright" />
          <Filter fetchFilteredData={fetchFilteredData} />
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
