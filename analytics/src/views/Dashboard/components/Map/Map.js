import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Map as LeafletMap, TileLayer, Popup, Marker} from 'react-leaflet';
import {Link } from 'react-router-dom';
import {Card, CardContent, CardHeader, Divider, IconButton, Grid} from '@material-ui/core';
import { useEffect, useState } from 'react';
import FullscreenControl from 'react-leaflet-fullscreen';
import 'react-leaflet-fullscreen/dist/styles.css';
import L from 'leaflet';
// import Legend from "./Legend";
import constants from 'config/constants'
import {MoreHoriz} from '@material-ui/icons';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import domtoimage from 'dom-to-image';
import JsPDF from 'jspdf';

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

  const rootMapContainerId = 'rootMapContainerId';
  const iconButton = 'exportIconButton';
  const [anchorEl, setAnchorEl] = useState(null);

  const filter = node => (node.id !== iconButton);

  const ITEM_HEIGHT = 48;
  const paperProps = {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5,
      width: 150,
    },
  };

  const exportToImage = async (chart, format, exportFunc) => {
    try {
      const dataUrl = await exportFunc(chart, { filter });
      const link = document.createElement('a');
      document.body.appendChild(link);
      link.download = `chart.${format}`;
      link.href = dataUrl;
      link.click();
      link.remove();
    } catch (err) {      
      console.error('oops, something went wrong!', err);
    }
  };

  const exportToJpeg = chart => exportToImage(chart, 'jpeg', domtoimage.toJpeg);

  const exportToPng = chart => exportToImage(chart, 'png', domtoimage.toPng);

  const exportToPdf = async (chart) => {
    const width = chart.offsetWidth;
    const height = chart.offsetHeight;
    try {
      const dataUrl = await domtoimage.toJpeg(chart, { filter });      
      const doc = new JsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [width, height],
      });
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = doc.internal.pageSize.getHeight();
      doc.addImage(dataUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      doc.save('chart');
    } catch (err) {      
      console.error('oops, something went wrong!', err);
    }
  };

  const print = async (chart) => {
    try {
      const dataUrl = await domtoimage.toJpeg(chart, { filter });
      let html = '<html><head><title></title></head>';
      html += '<body style="width: 100%; padding: 0; margin: 0;"';
      html += ' onload="window.focus(); window.print(); window.close()">';
      html += `<img src="${dataUrl}" /></body></html>`;

      const printWindow = window.open('', 'print');
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
    } catch (err) {
      console.error('oops, something went wrong!', err);
    }
  };

  const options = [
    { key: 'Print', action: print, text: 'Print' },
    { key: 'JPEG', action: exportToJpeg, text: 'Save as JPEG' },
    { key: 'PNG', action: exportToPng, text: 'Save as PNG' },
    { key: 'PDF', action: exportToPdf, text: 'Save as PDF' },
  ];

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExportMap = ({ action }) => () => {
    const chart = document.querySelector(`#${rootMapContainerId}`);
    handleClose();
    action(chart);
  };

  const openMenu = Boolean(anchorEl);

  return (
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      <CardHeader        
        title="Mean PM2.5 by Location for Past 60 Minutes"
        action={
          <Grid>
          <IconButton
            size="small" 
          color="primary"
          id={iconButton}
          onClick={handleClick}
          className={classes.chartSaveButton}
        >
          <MoreHoriz />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={openMenu}
          onClose={handleClose}
          PaperProps={paperProps}
        >
          {options.map(option => (
            <MenuItem key={option.key} onClick={handleExportMap(option)}>
              {option.text}
            </MenuItem>
          ))}
        </Menu>
        </Grid>
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
