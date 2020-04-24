import React from "react";
import { connect } from "react-redux";
import { mapRenderDefaults } from "../../../redux/Maps/actions";
import propTypes from "prop-types";
import {Map, FeatureGroup, LayerGroup, TileLayer, Marker, Popup} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import axios from "axios";
import L from 'leaflet';
import LoadingSpinner from './loadingSpinner';
import LoadingOverlay from 'react-loading-overlay';
import BounceLoader from 'react-spinners/BounceLoader'


class Maps extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      polygons: [],
      markers: [[0.32, 32.598]],
      loading: false
     }
    };
  

  _onEditStop = (e) => {
    console.log("_onEditStop", e);
  };

  _onCreated = (e) => {
    let type = e.layerType;
    let layer = e.layer;
    if (type === "marker") {
      // Do marker specific actions
      console.log("_onCreated: marker created", e);
    }
    if (type === "polygon") {
      // here you got the polygon points
      ///const points = layer._latlngs;

      //var geojson = layer.toGeoJSON();
      console.log(JSON.stringify(layer.toGeoJSON()));

      this.setState({loading: true})

      axios.post(
        'http://127.0.0.1:4000/api/v1/map/parishes',
        JSON.stringify(layer.toGeoJSON()),
        {headers:{'Content-Type':'application/json'}},
      )
      .then(
        res => {
          const myData = res.data;
          console.log(myData)
          this.setState({loading: false})
          
          let myPolygons = [];

          try{     
    
          myData.forEach(element => {
            if (element["properties.district"]){
            myPolygons.push({
              "type": "Feature",
              "properties": {
                "district":element["properties.district"],
                "subcounty": element["properties.subcounty"],
                "parish": element["properties.parish"],
                "lat": element["properties.lat"],
                "long":element["properties.long"],
                "color": element["color"],
                "fill_color": element["fill_color"],
                "type": element.type
              },
              "geometry": {
                "type": "Polygon",
                "coordinates": element["geometry.coordinates"]
              }
            });
          }
          else{
              myPolygons.push({
                "type": "Feature",
                "properties": {
                  "district":element.properties.district,
                  "subcounty": element.properties.subcounty,
                  "parish": element.properties.parish,
                  "lat": element.properties.lat,
                  "long":element.properties.long,
                  "color": element.color,
                  "fill_color": element.fill_color,
                  "type": element.type
                },
                "geometry": {
                  "type": "Polygon",
                  "coordinates": element.geometry.coordinates
                }
              });
          }
            
          });

          this.setState({
            polygons: myPolygons
          })
        }
        catch(error){
        console.log('An error occured. Please try again')
        } 
        }
      )
    }
  };

render() {

    return (
      
      <Map
        center={[this.props.mapDefaults.lat, this.props.mapDefaults.lng]}
        zoom={this.props.mapDefaults.zoom}
      >
        
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
        />
        
               
        <LayerGroup>}
           {this.state.polygons.map(location => (
          <Marker
            key={location.parish}
            position={{ lat: location.properties.lat, lng: location.properties.long }}
            icon = {new L.Icon({
              iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-'+location.properties.color+'.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            })}
            onMouseOver={(e) => {
              e.target.openPopup();
            }}
            onMouseOut={(e) => {
              e.target.closePopup();
            }}
          >
            <Popup>
              <span>
              <span>
                <b>DISTRICT: </b>{location.properties.district}, <br /> 
                <b>SUBCOUNTY: </b>{location.properties.subcounty}, <br/>
                <b>PARISH: </b>{location.properties.parish}, <br/>
                <b>TYPE: </b>{location.properties.type}
            </span>
              </span>
            </Popup>
          </Marker>
        ))}
       </LayerGroup> 
       
        
        <FeatureGroup ref={ (reactFGref) => {this._onFeatureGroupReady(reactFGref);} }> 
          <EditControl
            position="topleft"
            onEdited={this._onEdited}
            onCreated={this._onCreated}
            onDeleted={this._onDeleted}
            onMounted={this._onMounted}
            onEditStart={this._onEditStart}
            onEditStop={this._onEditStop}
            onDeleteStart={this._onDeleteStart}
            onDeleteStop={this._onDeleteStop} 
            draw={{
              rectangle: false,
              circle: false,
              circlemarker: false,
            }}
          />
          </FeatureGroup>
      </Map>
    );
      
  

  }

  _onFeatureGroupReady = (ref) => {
    if(ref===null) {
        return;
    }
    this._editableFG = ref; 
    if(this.state.polygons) {
      for (var i = 0; i < this.state.polygons.length; i++) {

       try{
        let leafletGeoJSON = new L.GeoJSON(this.state.polygons[i], {
          onEachFeature: function (feature, layer) {
            let popup_string = "<b>DISTRICT: </b>"+feature['properties']['district']+ 
            "<br/><b>SUBCOUNTY: </b>"+feature['properties']['subcounty']+
            "<br/><b>PARISH: </b>"+feature['properties']['parish']+
            "<br/><b>TYPE: </b>"+feature['properties']['type']
            layer.bindPopup(popup_string)
            layer.on('mouseover', function (e) {
              this.openPopup();
            });
            layer.on('mouseout', function (e) {
              this.closePopup()
          });
        },
        style: {fillColor: this.state.polygons[i]['properties']['fill_color'], color: this.state.polygons[i]['properties']['color'], opacity:100},
      });
        let leafletFG = this._editableFG.leafletElement;
        leafletGeoJSON.eachLayer( layer =>leafletFG.addLayer(layer));
      } 
      catch(error){
       console.log('An error occured and some polygons may not have been shown!')
      }
    }
  }
    else {
        console.log('No polygons');           
    }
  }
}

Maps.propTypes = {
  mapRenderDefaults: propTypes.func.isRequired,
  mapDefaults: propTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  mapDefaults: state.mapDefaults.initMap,
});

export default connect(mapStateToProps, { mapRenderDefaults })(Maps);
