import React from "react";
import { connect } from "react-redux";
import { mapRenderDefaults } from "../../../redux/Maps/actions";
import propTypes from "prop-types";

import {
  Map,
  FeatureGroup,
  Circle,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";

class Maps extends React.Component {
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
        <FeatureGroup>
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
}

Maps.propTypes = {
  mapRenderDefaults: propTypes.func.isRequired,
  mapDefaults: propTypes.array.isRequired,
};

const mapStateToProps = (state) => ({
  mapDefaults: state.mapDefaults.initMap,
});

export default connect(mapStateToProps, { mapRenderDefaults })(Maps);
