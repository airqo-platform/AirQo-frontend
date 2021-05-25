import React from "react";
import { connect } from "react-redux";
import { mapRenderDefaults } from "redux/Maps/actions";
import PropTypes from "prop-types";
import Select from "react-select";

import {
  Map,
  FeatureGroup,
  LayerGroup,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import axios from "axios";
import L from "leaflet";
import FullscreenControl from "react-leaflet-fullscreen";
import "react-leaflet-fullscreen/dist/styles.css";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import { CardActions, Divider } from "@material-ui/core";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Collapse from "@material-ui/core/Collapse";
import InboxIcon from "@material-ui/icons/MoveToInbox";
import SaveIcon from "@material-ui/icons/Save";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import CloseIcon from "@material-ui/icons/Close";
import UpdateIcon from "@material-ui/icons/Update";
import {
  GET_LOCATE_MAP,
  SAVE_LOCATE_MAP,
  UPDATE_LOCATE_MAP,
  DELETE_LOCATE_MAP,
  RUN_LOCATE_MODEL,
} from "config/urls/locate";

//download csv and pdf
import jsPDF from "jspdf";
import "jspdf-autotable";
import jsonexport from "jsonexport";


const typeOptions = [
  { value: "", label: "choose download option" },
  { value: "CSV", label: "CSV" },
  { value: "PDF", label: "PDF" },
];

const initialState = {
  api_data: {},
  polygons: [],
  markers: [[0.32, 32.598]],
  // gets the shapefile format to save (polygon drawn within the planning space)
  plan: {},
  // State: locate form
  numberOfDevices: 0,
  mustHaveCoord: "",
  // activates/deactivates locate submit button accordingly
  btnSubmit: false,
  // activates/deactivates clear planning space button accordingly
  btnClear: false,

  //for conditional rendering of clear button
  clear: true,

  //newly added - passed to the model endpoint
  geoJSONDATA: "",
  // added from locateSave -- helps with saving data and dialog boxes
  open: false,
  openSave: false,
  confirmDialog: false,
  savedPlan: [], // stores previously saved data
  space_name: "",

  // states for opening and updating previously saved data
  selected_name: "",
  selected_plan: {},
  isPlanSelected: false,
  isUpdateCancel: false,
  isAlreadyOpened: 0, // prevents the map from loading more than once on every state change

  // handle all the popup msg
  confirmDialogMsg: "",
  selectedOption: { value: " ", label: "" },
};

class Maps extends React.Component {
  constructor(props) {
    super(props);
    this.state = initialState;

    //from locate save
    this.changeHandler = this.changeHandler.bind(this);
    this.submitHandler = this.submitHandler.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.onSaveClicked = this.onSaveClicked.bind(this);
    this.onOpenClicked = this.onOpenClicked.bind(this);
    this.handleSaveClose = this.handleSaveClose.bind(this);
    this.handleConfirmClose = this.handleConfirmClose.bind(this);
    this.handleDownloadChange = this.handleDownloadChange.bind(this);
    this.handleClear = this.handleClear.bind(this);

    // select previously saved data, update, delete
    this.onSelectPrevSpace = this.onSelectPrevSpace.bind(this);
    this.onUpdatePlanSpace = this.onUpdatePlanSpace.bind(this);
    this.onDeletePlanSpace = this.onDeletePlanSpace.bind(this);
    this.onCancelUpdatePlanSpace = this.onCancelUpdatePlanSpace.bind(this);
  }
  // Retrieve previously saved planning space by this current user
  // added from locateSave
  onOpenClicked = () => {
    axios
      .get(GET_LOCATE_MAP + this.props.auth.user._id)
      .then((res) => {
        this.setState({ savedPlan: res.data });
        console.log(res.data);
        //console.log(this.state, "current user: ", this.props.auth.user._id);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // save planning space
  savePlanningSpace = () => {
    // open the save planning space dialog
    this.setState((prevState) => ({ openSave: !prevState.openSave }));
    // make api call
    // console.log("plan: ", this.state.plan);
    axios
      .post(
        SAVE_LOCATE_MAP,
        {
          user_id: this.props.auth.user._id,
          space_name: this.state.space_name,
          plan: this.state.plan,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        console.log(res);
        this.setState({ confirmDialogMsg: res.data.message });
        this.setState((prevState) => ({
          confirmDialog: !prevState.confirmDialog,
        })); //
      })
      .catch((e) => console.log(e));
  };

  // This deals with save planing space dialog box
  onSaveClicked = () => {
    this.setState((prevState) => ({ openSave: !prevState.openSave }));
  };
  handleSaveClose = () => {
    this.setState((prevState) => ({ openSave: !prevState.openSave }));
    //console.log(this.state, this.props.plan, this.props.user_id);
  };
  // hooks the planning space textfield input
  changeHandler = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };
  //handles download input
  handleDownloadChange = (selected) => {
    this.setState({ selectedOption: selected });
    //console.log(`Option selected:`, selected)
  };

  handleClear = () => {
    this.setState(initialState);
    let leafletFG = this._editableFG.leafletElement;
    leafletFG.eachLayer(function (layer) {
      layer.remove();
    });
  };

  // Handles saved space confirmation feedback
  handleConfirmClose = () => {
    this.setState((prevState) => ({ confirmDialog: !prevState.confirmDialog }));
  };

  // load previously saved space
  handleClick = () => {
    this.setState((prevState) => ({ open: !prevState.open }));
  };
  //--End-----------------------------------------------------------

  // ---------selected previously saved space
  onSelectPrevSpace = (name, shape) => {
    // we update some states
    this.setState({ isPlanSelected: true });
    this.setState({ isUpdateCancel: false });
    this.setState({ selected_name: name });
    this.setState({ selected_plan: shape });
  };
  // update saved space
  onUpdatePlanSpace = () => {
    console.log("onUpdate: ", this.state.selected_name);
    axios
      .post(
        UPDATE_LOCATE_MAP + this.state.selected_name,
        {
          plan: this.state.selected_plan,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        console.log(res.data);
        this.setState({ confirmDialogMsg: res.data.message });
        this.setState((prevState) => ({
          confirmDialog: !prevState.confirmDialog,
        })); //
      })
      .catch((e) => console.log(e));
  };

  onCancelUpdatePlanSpace = () => {
    // monitor cancel button:
    this.setState({ isUpdateCancel: true });
    this.setState({ isPlanSelected: false });
    this.setState({ isAlreadyOpened: 0 });
    // this.setState({ selected_name: "" });
    // this.setState({ selected_plan: {} });
  };

  // Delete previously saved space
  onDeletePlanSpace = (name) => {
    console.log("onDelete :", name);
    axios
      .delete(DELETE_LOCATE_MAP + name)
      .then((res) => {
        console.log(res.data);
        this.setState({ confirmDialogMsg: res.data.message });
        this.setState((prevState) => ({
          confirmDialog: !prevState.confirmDialog,
        })); //
      })
      .catch((e) => {
        console.log(e);
      });
  };
  //----end-----------------------

  // From LocateForm
  changeHandler = (e) => {
    this.setState({ [e.target.name]: e.target.value });
    // toggle submit button ON and OFF
    if (e.target.name == "numberOfDevices") {
      if (e.target.value != 0 && /^\d+$/.test(e.target.value)) {
        this.setState({ btnSubmit: true });
      } else {
        this.setState({ btnSubmit: false });
      }
    }
  };

  submitHandler = (e) => {
    e.preventDefault();
    let api_data = {
      sensor_number: this.state.numberOfDevices,
      must_have_coordinates: this.state.mustHaveCoord,
      // checking if the user selected a previously saved plan
      // if true, use its geoGjson data, otherwise use the selected plan
      polygon:
        this.state.isPlanSelected == true
          ? this.state.selected_plan
          : this.state.plan,
    };
    console.log(api_data);
    axios
      .post(RUN_LOCATE_MODEL, api_data, {
        headers: { "Content-Type": "application/json" },
      })
      .then((res) => {
        const myData = res.data;
        console.log(myData);

        let myPolygons = [];

        try {
          myData.forEach((element) => {
            if (element["properties.district"]) {
              myPolygons.push({
                type: "Feature",
                properties: {
                  district: element["properties.district"],
                  subcounty: element["properties.subcounty"],
                  parish: element["properties.parish"],
                  lat: element["properties.lat"],
                  long: element["properties.long"],
                  color: element["color"],
                  fill_color: element["fill_color"],
                  type: element.type,
                },
                geometry: {
                  type: "Polygon",
                  coordinates: element["geometry.coordinates"],
                },
              });
            } else {
              myPolygons.push({
                type: "Feature",
                properties: {
                  district: element.properties.district,
                  subcounty: element.properties.subcounty,
                  parish: element.properties.parish,
                  lat: element.properties.lat,
                  long: element.properties.long,
                  color: element.color,
                  fill_color: element.fill_color,
                  type: element.type,
                },
                geometry: {
                  type: "Polygon",
                  coordinates: element.geometry.coordinates,
                },
              });
            }
          });

          this.setState({
            polygons: myPolygons,
            btnClear: true,
          });
          {
            /*download files*/
          }
          let toCsv = [];
          if (this.state.selectedOption.value === "CSV") {
            myData.forEach((element) => {
              toCsv.push({
                type: "Feature",
                properties: {
                  district: element["properties.district"],
                  subcounty: element["properties.subcounty"],
                  parish: element["properties.parish"],
                  lat: element["properties.lat"],
                  long: element["properties.long"],
                },
              });
            });
            jsonexport(toCsv, function (err, csv) {
              if (err) return console.log(err);
              var filename = "parish_recommendations.csv";
              var link = document.createElement("a");
              link.setAttribute(
                "href",
                "data:text/csv;charset=utf-8,%EF%BB%BF" +
                  encodeURIComponent(csv)
              );
              link.setAttribute("download", filename);
              link.style.visibility = "hidden";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            });
          } else {
            var doc = new jsPDF("p", "pt", "a4");
            var rows = [];
            var header = function (data) {
              doc.setFontSize(18);
              doc.setTextColor(40);
              doc.setFontStyle("normal");
              //doc.addImage(headerImgData, 'JPEG', data.settings.margin.left, 20, 50, 50);
              doc.text("RECOMMENDED PARISHES", data.settings.margin.left, 50);
            };
            var col = [
              "type",
              "District",
              "Subcounty",
              "Parish",
              "lat",
              "long",
            ];
            myPolygons.forEach((element) => {
              var temp = [
                element.type,
                element.properties.district,
                element.properties.subcounty,
                element.properties.parish,
                element.properties.lat,
                element.properties.long,
              ];
              rows.push(temp);
            });
            doc.autoTable(col, rows, {
              margin: { top: 80 },
              beforePageContent: header,
            });
            doc.save("parish_recommendations.pdf");
          }
        } catch (error) {
          console.log("An error occured. Please try again");
        }
      });
  };
  //--End----------------------------------------------------------

  _onEdited = (e) => {
    //let type = e.layerType;
    let layer = e.layers;

    if (this.state.isPlanSelected == true) {
      // when we are working with previously saved plan
      this.setState({ plan: layer.toGeoJSON() });
      this.setState({ selected_plan: layer.toGeoJSON() });
      this.setState({ geoJSONDATA: JSON.stringify(layer.toGeoJSON()) });
      console.log("edit saved plan: ", JSON.stringify(layer.toGeoJSON()));
    } else {
      // otherwise
      this.setState({ plan: layer.toGeoJSON() });
      this.setState({ geoJSONDATA: JSON.stringify(layer.toGeoJSON()) });
      console.log("edit new plan: ", JSON.stringify(layer.toGeoJSON()));
    }

    //console.log("_onEdited", type, JSON.stringify(layer.toGeoJSON()));
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
      console.log(JSON.stringify(layer.toGeoJSON()));
      //console.log(JSON.stringify(layer.toGeoJSON()));
      this.setState({ plan: layer.toGeoJSON() });
      //newly added
      this.setState({ geoJSONDATA: JSON.stringify(layer.toGeoJSON()) });
      if (this.state.clear) {
        this.setState({ geoJSONDATA: "" });
      }
    }
    if (this.state.clear) {
      this.setState({ geoJSONDATA: "" });
    }
  };

  render() {
    //from locate form
    const { numberOfDevices, mustHaveCoord } = this.state;

    const styles = {
      backgroundColor: "#FFF",
      zIndex: 999,
      position: "absolute",
      height: "auto",
      width: 250,
      opacity: 0.8,
      //marginTop: "7em"
    };

    // Save planning styles
    const nested = {
      paddingLeft: "2em",
    };
    // styling the save planning space menu
    const savePlan = {
      backgroundColor: "#FFF",
      zIndex: 999,
      position: "absolute",
      height: "auto",
      width: 250,
      opacity: 0.8,
      top: "30em",
    };
    // styling the delete planning space buttons
    const btnStyles = {
      color: "red",
      fontWeight: ".3em",
    };
    return (
      <div>
        {/* Adding MapMenu */}
        {/* <MapMenu geojson={this.state.plan} /> */}
        {/* Adding Locate Form */}
        <div style={styles}>
          <form noValidate autoComplete="off" onSubmit={this.submitHandler}>
            <Divider />
            <TextField
              type="number"
              name="numberOfDevices"
              label="Number of Devices"
              keyboardType="numeric"
              placeholder="No. of devices"
              required
              value={numberOfDevices}
              onChange={this.changeHandler}
              fullWidth
              margin="normal"
            />
            <TextField
              name="mustHaveCoord"
              label="'Must Have' Locations"
              placeholder="[[Lng, Lat],...,[Lng, Lat]]"
              onChange={this.changeHandler}
              value={mustHaveCoord}
              fullWidth
              margin="normal"
            />
            <Select
              options={typeOptions}
              value={this.state.selectedOption}
              onChange={this.handleDownloadChange}
              placeholder={"choose download option"}
            />
            <CardActions>
              <Button
                type="submit"
                name="submit"
                disabled={this.state.btnSubmit === false ? "true" : ""}
                color="secondary"
                variant="contained"
                size="small"
              >
                Submit
              </Button>
              <Button
                type="button"
                name="clear"
                disabled={this.state.btnClear === false ? "true" : ""}
                onClick={this.handleClear}
                color="secondary"
                variant="contained"
                size="small"
              >
                Clear Space
              </Button>
            </CardActions>
          </form>
        </div>
        {/* End of Locate Form Menu - Number of Devices and 'Must have locations */}

        {/* Locate Save Menu */}
        <div>
          {/* Update planning space controls */}
          {this.state.isPlanSelected == true ? (
            <List
              component="nav"
              aria-labelledby="nested-list-subheader"
              style={savePlan}
            >
              <ListItem button>
                <ListItemIcon>
                  <UpdateIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Update"
                  onClick={this.onUpdatePlanSpace}
                />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <CloseIcon style={btnStyles} />
                </ListItemIcon>
                <ListItemText
                  primary="Cancel"
                  onClick={this.onCancelUpdatePlanSpace}
                />
              </ListItem>
            </List>
          ) : (
            //save new placing space , list saved planning space
            <List
              component="nav"
              aria-labelledby="nested-list-subheader"
              style={savePlan}
            >
              <ListItem
                button
                disabled={
                  Object.keys(this.state.plan).length === 0 ? "true" : ""
                }
              >
                <ListItemIcon>
                  <SaveIcon />
                </ListItemIcon>
                <ListItemText primary="Save" onClick={this.onSaveClicked} />
              </ListItem>
              <ListItem button onClick={this.handleClick}>
                <ListItemIcon>
                  <InboxIcon />
                </ListItemIcon>
                <ListItemText primary="Open" onClick={this.onOpenClicked} />
                {this.state.open ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={this.state.open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {/* check of previously saved plan was successfully returned from the db */}
                  {this.state.savedPlan != null
                    ? this.state.savedPlan.map((s) => (
                        <ListItem key={s._id} button style={nested}>
                          <ListItemText
                            primary={s.space_name}
                            onClick={this.onSelectPrevSpace.bind(
                              this,
                              s.space_name,
                              s.plan
                            )}
                            z
                          />
                          <Button
                            variant="contained"
                            size="small"
                            onClick={this.onDeletePlanSpace.bind(
                              this,
                              s.space_name
                            )}
                          >
                            <CloseIcon style={btnStyles} />
                          </Button>
                        </ListItem>
                      ))
                    : ""}
                </List>
              </Collapse>
            </List>
          )}

          {/* Dialog for save locate data */}
          <Dialog
            open={this.state.openSave}
            onClose={this.handleSaveClose}
            aria-labelledby="form-dialog-title"
          >
            {/* <DialogTitle id="form-dialog-title">Save Planning Space</DialogTitle> */}
            <DialogContent>
              <DialogContentText>
                To save this planning space, please enter the name in the text
                field below. Thank you for using AirQo Locate service.
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                name="space_name"
                value={this.state.space_name}
                onChange={this.changeHandler}
                label="Save As"
                type="text"
                placeholder="airqo_locate_plan_001"
                fullWidth
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleSaveClose} color="primary">
                Cancel
              </Button>
              <Button onClick={this.savePlanningSpace} color="primary">
                Save
              </Button>
            </DialogActions>
          </Dialog>

          {/* Dialog for confirming saved location data  */}
          <Dialog
            open={this.state.confirmDialog}
            onClose={this.handleConfirmClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            {/* <DialogTitle id="alert-dialog-title">
          {"Use Google's location service?"}
        </DialogTitle> */}
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                {this.state.confirmDialogMsg}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleConfirmClose} color="primary">
                OK
              </Button>
            </DialogActions>
          </Dialog>
        </div>
        {/* End of Locate Save Menu */}

        {/* Map component starts here */}
        <Map
          center={[this.props.mapDefaults.lat, this.props.mapDefaults.lng]}
          zoom={this.props.mapDefaults.zoom}
        >
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
          />

          <FullscreenControl position="topright" />

          <LayerGroup>
            {this.state.polygons.map((location) => (
              <Marker
                key={location.parish}
                position={{
                  lat: location.properties.lat,
                  lng: location.properties.long,
                }}
                icon={
                  new L.Icon({
                    iconUrl:
                      "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-" +
                      location.properties.color +
                      ".png",
                    shadowUrl:
                      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41],
                  })
                }
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
                      <b>DISTRICT: </b>
                      {location.properties.district}, <br />
                      <b>SUBCOUNTY: </b>
                      {location.properties.subcounty}, <br />
                      <b>PARISH: </b>
                      {location.properties.parish}, <br />
                      <b>TYPE: </b>
                      {location.properties.type}
                    </span>
                  </span>
                </Popup>
              </Marker>
            ))}
          </LayerGroup>

          <FeatureGroup
            ref={(reactFGref) => {
              this._onFeatureGroupReady(reactFGref);
            }}
          >
            <EditControl
              ref="edit"
              position="topright"
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
      </div>
    );
    // --- End of render function ---
  }

  _onFeatureGroupReady = (ref) => {
    if (ref === null) {
      return;
    }
    this._editableFG = ref;
    if (this.state.polygons) {
      for (var i = 0; i < this.state.polygons.length; i++) {
        //let leafletGeoJSON = new L.GeoJSON(this.state.polygons[i]);console.log(leafletGeoJSON);

        try {
          let leafletGeoJSON = new L.GeoJSON(this.state.polygons[i], {
            onEachFeature: function (feature, layer) {
              let popup_string =
                "<b>DISTRICT: </b>" +
                feature["properties"]["district"] +
                "<br/><b>SUBCOUNTY: </b>" +
                feature["properties"]["subcounty"] +
                "<br/><b>PARISH: </b>" +
                feature["properties"]["parish"] +
                "<br/><b>TYPE: </b>" +
                feature["properties"]["type"];
              layer.bindPopup(popup_string);
              layer.on("mouseover", function (e) {
                this.openPopup();
              });
              layer.on("mouseout", function (e) {
                this.closePopup();
              });
            },
            style: {
              fillColor: this.state.polygons[i]["properties"]["fill_color"],
              color: this.state.polygons[i]["properties"]["color"],
              opacity: 100,
            },
          });
          let leafletFG = this._editableFG.leafletElement;
          leafletGeoJSON.eachLayer((layer) => leafletFG.addLayer(layer));
        } catch (error) {
          console.log(
            "An error occured and some polygons may not have been shown!"
          );
        }
      }
      //console.log(toString(count)+' invalid polygons in results')
    } else {
      console.log("No polygons");
    }
    //Opening previously saved data
    if (this.state.isPlanSelected && this.state.isAlreadyOpened == 0) {
      // populate the leaflet FeatureGroup with the geoJson layers

      var savedLeafletGeoJSON = new L.GeoJSON(this.state.selected_plan);
      var savedLeafletFG = ref.leafletElement;
      savedLeafletGeoJSON.eachLayer((layer) => {
        savedLeafletFG.addLayer(layer);
      });
      // prevent the map from opening twice on every state change
      this.setState({ isAlreadyOpened: 1 });
    }

    if (this.state.isUpdateCancel) {
      var savedLeafletFG = ref.leafletElement;
      savedLeafletFG.eachLayer(function (layer) {
        layer.remove();
        //marker.remove();
      });
      // L.Map.eachLayer((layer) => {
      //   savedLeafletFG.removeLayer(layer);
      // });
      //draw.deleteAll().getAll();
      this.setState({ isPlanSelected: false });
      this.setState({ selected_name: "" });
      this.setState({ selected_plan: {} });
      this.setState({ isUpdateCancel: false });
    }
  };
}

Maps.propTypes = {
  mapRenderDefaults: PropTypes.func.isRequired,
  mapDefaults: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  mapDefaults: state.mapDefaults.initMap,
  auth: state.auth,
});

export default connect(mapStateToProps, { mapRenderDefaults })(Maps);
