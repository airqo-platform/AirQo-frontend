import React from "react";
import { connect } from "react-redux";
import { mapRenderDefaults } from "../../../redux/Maps/actions";
import propTypes from "prop-types";
import {Map, FeatureGroup, Circle, TileLayer } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import axios from "axios";
import L from 'leaflet';

class Maps extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      polygons: []
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

      axios.post(
        'http://127.0.0.1:4000/api/v1/map/parishes',
        JSON.stringify(layer.toGeoJSON()),
        {headers:{'Content-Type':'application/json'}},
      )
      .then(
        res => {
          const myData = res.data;
          console.log(myData)
          
          let myPolygons = [];
    
          myData.forEach(element => {
            myPolygons.push({
              "type": "Feature",
              "properties": {
                "district":element["properties.district"],
                "subcounty": element["properties.subcounty"],
                "parish": element["properties.parish"],
                "color": element["color"],
                "fill_color": element["fill_color"]
              },
              "geometry": {
                "type": "Polygon",
                "coordinates": element["geometry.coordinates"]
              }
            });
            
          });

          this.setState({
            polygons: myPolygons
          })

          
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
        <FeatureGroup color="red" ref={ (reactFGref) => {this._onFeatureGroupReady(reactFGref);} }> }
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
    
    console.log('_onFeatureGroupReady');
    if(ref===null) {
        return;
    }
    this._editableFG = ref; 
    // populate the leaflet FeatureGroup with the geoJson layers
    if(this.state.polygons) {

      for (var i = 0; i < this.state.polygons.length; i++) {
        let leafletGeoJSON = new L.GeoJSON(this.state.polygons[i], {
          onEachFeature: function (feature, layer) {
            let popup_string = "<b>DISTRICT: </b>"+feature['properties']['district']+ 
            "<br/><b>SUBCOUNTY: </b>"+feature['properties']['subcounty']+
            "<br/><b>PARISH: </b>"+feature['properties']['parish']
            layer.bindPopup(popup_string)
            layer.on('mouseover', function (e) {
              this.openPopup();
            });
            layer.on('mouseout', function (e) {
              this.closePopup()
          });
        },
        style: {fillColor: this.state.polygons[i]['properties']['fill_color'], color: this.state.polygons[i]['properties']['color'], opacity:10},
      
      });

        let leafletFG = this._editableFG.leafletElement;
        leafletGeoJSON.eachLayer( layer =>leafletFG.addLayer(layer));
      } 

        
    }else {
        console.log('No polygons');
                
    }
  }

}

/*function getGeoJson() {
  return {

      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [-122.45,37.79], [-122.42999999999999,37.79],[-122.42999999999999, 37.77],
              [-122.45,37.77], [-122.45,37.79]
          ]
        ]
      }
  }
}*/

Maps.propTypes = {
  mapRenderDefaults: propTypes.func.isRequired,
  mapDefaults: propTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  mapDefaults: state.mapDefaults.initMap,
});

export default connect(mapStateToProps, { mapRenderDefaults })(Maps);
