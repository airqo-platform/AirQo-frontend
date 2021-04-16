import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/styles";
import PropTypes from "prop-types";
import {
  Grid,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from "@material-ui/core";
import axios from "axios";
import { useParams } from "react-router-dom";
import TextField from "@material-ui/core/TextField";
import { Link } from "react-router-dom";
import LoadingOverlay from "react-loading-overlay";
import LabelledSelect from "../CustomSelects/LabelledSelect";
import constants from "config/constants.js";

// css
import "assets/css/location-registry.css";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  notchedOutline: {},
  focused: {
    "& $notchedOutline": {
      borderColor: "blue",
    },
  },
  content: {
    marginTop: theme.spacing(2),
  },
  title: {
    fontWeight: 700,
  },
  avatar: {
    backgroundColor: theme.palette.success.main,
    height: 56,
    width: 56,
  },
  icon: {
    height: 32,
    width: 32,
  },
  difference: {
    marginTop: theme.spacing(2),
    display: "flex",
    alignItems: "center",
  },
  differenceIcon: {
    color: theme.palette.success.dark,
  },
  differenceValue: {
    color: theme.palette.success.dark,
    marginRight: theme.spacing(1),
  },

  formControl: {
    margin: theme.spacing(3),
    fontFamily: "Open Sans",
    marginLeft: 100,
    marginRight: 100,
  },
  textField: {
    width: "250px",
    textAlign: "left",
    paddingBottom: 0,
    marginTop: 0,
    borderRadius: 10,
    border: "2px solid #7575FF",
    fontFamily: "Open Sans",
  },
  input: {
    color: "black",
    fontFamily: "Open Sans",
    fontweight: 500,
    font: "100px",
    fontSize: 17,
  },
}));

const selectStyles = {
  container: (provided) => ({
    ...provided,
    display: "inline-block",
    width: "250px",
    minHeight: "1px",
    textAlign: "left",
    border: "none",
    fontWeight: 500,
    fontFamily: "Open Sans",
    font: "100px",
    fontSize: 17,
  }),
  control: (provided) => ({
    ...provided,
    border: "2px solid #7575FF",
    borderRadius: 10,
    minHeight: "1px",
    height: "56px",
  }),
  input: (provided) => ({
    ...provided,
    minHeight: "1px",
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    minHeight: "1px",
    paddingTop: "0",
    paddingBottom: "0",
    color: "#757575",
  }),
  indicatorSeparator: (provided) => ({
    ...provided,
    minHeight: "1px",
    height: "24px",
  }),
  clearIndicator: (provided) => ({
    ...provided,
    minHeight: "1px",
  }),
  valueContainer: (provided) => ({
    ...provided,
    minHeight: "1px",
    height: "40px",
    paddingTop: "0",
    paddingBottom: "0",
    fontWeight: 500,
  }),
  singleValue: (provided) => ({
    ...provided,
    minHeight: "1px",
    paddingBottom: "2px",
    fontWeight: 500,
  }),
};

const multiStyles = {
  container: (provided) => ({
    ...provided,
    display: "inline-block",
    width: "865px",
    minHeight: "1px",
    textAlign: "left",
    border: "none",
    fontWeight: 500,
    fontFamily: "Open Sans",
    font: "100px",
    fontSize: 17,
  }),
  control: (provided) => ({
    ...provided,
    border: "2px solid #7575FF",
    borderRadius: 10,
    minHeight: "56px",
  }),
  input: (provided) => ({
    ...provided,
    minHeight: "1px",
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    minHeight: "1px",
    paddingTop: "0",
    paddingBottom: "0",
    color: "#7575FF",
  }),
  indicatorSeparator: (provided) => ({
    ...provided,
    minHeight: "1px",
    color: "#7575FF",
  }),
  clearIndicator: (provided) => ({
    ...provided,
    minHeight: "1px",
  }),
  valueContainer: (provided) => ({
    ...provided,
    minHeight: "40px",
    paddingTop: "0",
    paddingBottom: "0",
    fontweight: 500,
  }),
  singleValue: (provided) => ({
    ...provided,
    minHeight: "1px",
    paddingBottom: "2px",
    fontweight: 500,
  }),
};

const LocationEdit = (props) => {
  const { className, ...rest } = props;
  let params = useParams();
  const classes = useStyles();

  const [locationReference, setLocationReference] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [hostName, setHostName] = useState("");
  const handleHostNameChange = (enteredHostName) => {
    setHostName(enteredHostName.target.value);
  };
  const [description, setDescription] = useState("");
  const handleDescriptionChange = (enteredDescription) => {
    setDescription(enteredDescription.target.value);
  };

  const [mobile, setMobile] = useState(false);
  const [mobility, setMobility] = useState("");
  const mobilityOptions = [
    { value: "Static", label: "Static" },
    { value: "Mobile", label: "Mobile" },
  ];

  const [internet, setInternet] = useState({ value: "" });
  const handleInternetChange = (selectedInternet) => {
    setInternet(selectedInternet.value);
  };
  const internetOptions = [
    { value: "GSM", label: "GSM" },
    { value: "WiFi", label: "WiFi" },
    { value: "LoRa", label: "LoRa" },
  ];

  const [power, setPower] = useState({ value: "" });
  const handlePowerChange = (selectedPower) => {
    setPower(selectedPower.value);
  };
  const powerOptions = [
    { value: "Solar", label: "Solar" },
    { value: "Mains", label: "Mains" },
  ];

  const [height, setHeight] = useState(0);
  const handleHeightChange = (enteredHeight) => {
    let re = /\s*|\d+(\.d+)?/;
    if (re.test(enteredHeight.target.value)) {
      setHeight(enteredHeight.target.value);
    }
  };

  const [roadIntensity, setRoadIntensity] = useState({ value: "" });
  const handleRoadIntensityChange = (selectedRoadIntensity) => {
    setRoadIntensity(selectedRoadIntensity.value);
  };
  const roadIntensityOptions = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "5", label: "5" },
  ];

  const [installationType, setInstallationType] = useState("");
  const handleInstallationTypeChange = (enteredInstallationType) => {
    setInstallationType(enteredInstallationType.target.value);
  };

  const [localActivities, setLocalActivities] = useState([]);
  const handleLocalActivitiesChange = (selectedOptions) => {
    setLocalActivities(selectedOptions);
  };
  const localActivitiesOptions = [
    { value: "Burning", label: "Burning" },
    { value: "Cooking", label: "Cooking" },
    { value: "Dust", label: "Dust" },
    { value: "Construction", label: "Construction" },
    { value: "Vehicle Emissions", label: "Vehicle Emissions" },
  ];

  const [roadStatus, setRoadStatus] = useState({ value: "" });
  const handleRoadStatusChange = (selectedRoadStatus) => {
    setRoadStatus(selectedRoadStatus.value);
  };
  const roadStatusOptions = [
    { value: "Paved", label: "Paved" },
    { value: "Unpaved", label: "Unpaved" },
  ];

  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogStatus, setDialogStatus] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  const getLocation = (ref) => {
    setDetailsLoading(true);
    axios
      .get(
        //'http://127.0.0.1:4000/api/v1/location_registry/edit?loc_ref='+ref
        constants.EDIT_LOCATION_DETAILS_URI + ref
      )
      .then((response) => {
        setDetailsLoading(false);
        let myData = response.data;
        setLocationReference(myData.loc_ref);
        setHostName(myData.host);
        setMobility(myData.mobility);
        setLatitude(myData.latitude);
        setLongitude(myData.longitude);
        setRoadIntensity(myData.road_intensity);
        setDescription(myData.description);
        setRoadStatus(myData.road_status);
        setLocalActivities(myData.local_activities);
        console.log(response.data);
        if (myData.mobility == "Mobile") {
          setMobile(true);
        }
      })
      .catch((e) => {
        console.log(e);
      });
  };

  useEffect(() => {
    getLocation(params.loc_ref);
  }, [params.loc_ref]);

  let changeHandler = (event) => {
    event.persist();

    let value = event.target.value;
    setHeight(value);
  };

  let handleConfirmClose = () => {
    setDialogStatus(false);
  };

  let handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    let filter = {
      locationReference: locationReference,
      roadIntensity: roadIntensity,
      roadStatus: roadStatus,
      description: description,
      localActivities: localActivities,
    };
    console.log(JSON.stringify(filter));

    axios
      .post(
        //'http://127.0.0.1:4000/api/v1/location_registry/update',
        constants.UPDATE_LOCATION_URI,
        JSON.stringify(filter),
        { headers: { "Content-Type": "application/json" } }
      )
      .then((res) => {
        setIsLoading(false);
        const myData = res.data;
        console.log(myData);
        setDialogMessage(myData.message);
        setDialogStatus(true);
      })
      .catch(console.log);
  };

  return (
    <div className={classes.root}>
      <LoadingOverlay active={isLoading} spinner text="Updating Location...">
        <LoadingOverlay
          active={detailsLoading}
          spinner
          text="Loading Location details..."
        >
          <form onSubmit={handleSubmit}>
            <h5 align="center">
              <b>Edit a Location</b>
            </h5>
            <br />
            <Grid container spacing={1}>
              <Grid container item xs={12} spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={"Location Reference"}
                    id="locationReference"
                    value={locationReference}
                    variant="outlined"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    label={"Host Reference"}
                    id="hostName"
                    value={hostName}
                    onChange={handleHostNameChange}
                    variant="outlined"
                    fullWidth
                  />
                </Grid>
              </Grid>

              <Grid container item xs={12} spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="mobility"
                    select
                    label="Mobility"
                    value={mobilityOptions.filter(function (option) {
                      return option.value === mobility;
                    })}
                    fullWidth
                    SelectProps={{
                      native: true,
                      style: { width: "100%", height: "50px" },
                    }}
                    variant="outlined"
                    disabled
                  >
                    {mobilityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    label={"Location Description"}
                    id="description"
                    value={description}
                    onChange={handleDescriptionChange}
                    variant="outlined"
                    fullWidth
                  />
                </Grid>
              </Grid>

              <Grid container item xs={12} spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={"Latitude"}
                    id="latitude"
                    value={latitude}
                    keyboardType="numeric"
                    variant="outlined"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={"Longitude"}
                    id="longitude"
                    value={longitude}
                    keyboardType="numeric"
                    variant="outlined"
                    fullWidth
                  />
                </Grid>
              </Grid>

              <Grid container item xs={12} spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="roadIntensity"
                    select
                    label="Road Intensity"
                    fullWidth
                    SelectProps={{
                      native: true,
                      style: { width: "100%", height: "50px" },
                    }}
                    variant="outlined"
                    onChange={handleRoadIntensityChange}
                    disabled
                  >
                    {roadIntensityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Road Status"
                    fullWidth
                    SelectProps={{
                      native: true,
                      style: { width: "100%", height: "50px" },
                    }}
                    variant="outlined"
                    onChange={handleRoadStatusChange}
                    disabled
                  >
                    {roadStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </TextField>
                </Grid>
              </Grid>

              <Grid container item xs={12} spacing={3}>
                <Grid item xs={12} sm={6}>
                  <LabelledSelect
                    label={"Local Activities"}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    name="localActivities"
                    value={localActivities}
                    options={localActivitiesOptions}
                    onChange={handleLocalActivitiesChange}
                    isDisabled={mobile}
                    isMulti
                  />
                </Grid>
              </Grid>
              <Grid container>
                <div>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    align="centre"
                    style={{marginLeft: "10px", marginRight: "20px"}}
                  >
                    {" "}
                    Save
                  </Button>
                  <Link to={`/location`}>
                    <Button
                      variant="contained"
                      color="primary"
                      type="button"
                      align="centre"
                    >
                      {" "}
                      Cancel
                    </Button>
                  </Link>
                </div>
              </Grid>
            </Grid>
          </form>
        </LoadingOverlay>
      </LoadingOverlay>
      {dialogStatus ? (
        <Dialog
          open={dialogStatus}
          onClose={handleConfirmClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {dialogMessage}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <div>
              {/* <Link to='/location'>*/}
              <Link to={`/locations/${locationReference}`}>
                <Button variant="contained" color="primary" align="centre">
                  {" "}
                  OK
                </Button>
              </Link>
            </div>
          </DialogActions>
        </Dialog>
      ) : null}
    </div>
  );
};

LocationEdit.propTypes = {
  className: PropTypes.string,
};

export default LocationEdit;
