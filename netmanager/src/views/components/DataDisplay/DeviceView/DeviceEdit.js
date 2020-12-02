import React, { useState } from "react";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import Paper from "@material-ui/core/Paper";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import Input from "@material-ui/core/Input";
import { Button, Grid } from "@material-ui/core";
import LabelledSelect from "../../CustomSelects/LabelledSelect";
import { isEmpty, isEqual } from "underscore";
import { updateMainAlert } from "redux/MainAlert/operations";
import { updateDeviceDetails } from "views/apis/deviceRegistry";

const transformLocationOptions = (locationsData) => {
  const transFormedOptions = [];
  locationsData.map(
    ({ location_name, county, description, loc_ref, ...rest }) => {
      transFormedOptions.push({
        ...{ location_name, county, description, ...rest },
        label: `${location_name || county || description}`,
        value: loc_ref,
      });
    }
  );
  return transFormedOptions;
};

const filterLocation = (locations, location_ref) => {
  const currentLocation = locations.filter(
    (location) => location.loc_ref === location_ref
  );
  if (isEmpty(currentLocation)) {
    return { label: "Unknown or no location", value: null };
  }
  const { location_name, county, description, loc_ref } = currentLocation[0];
  return {
    ...currentLocation[0],
    label: `${location_name || county || description}`,
    value: loc_ref,
  };
};

const gridItemStyle = {
  padding: "5px",
};

export default function DeviceEdit({ deviceData, locationsData }) {
  const dispatch = useDispatch();
  const [editData, setEditData] = useState(deviceData);
  const [editLoading, setEditLoading] = useState(false);
  const handleTextFieldChange = (event) => {
    setEditData({
      ...editData,
      [event.target.id]: event.target.value,
    });
  };

  const handleSelectFieldChange = (id) => (event) => {
    setEditData({
      ...editData,
      [id]: event.target.value,
    });
  };

  const handleLocationChange = (location) => {
    setEditData({
      ...editData,
      locationID: location.value,
    });
  };

  const handleEditSubmit = async () => {
    setEditLoading(true);
    await updateDeviceDetails(deviceData.name, editData)
      .then((responseData) => {
        dispatch(
          updateMainAlert({
            message: responseData.message,
            show: true,
            severity: "success",
          })
        );
      })
      .catch((err) => {
        dispatch(
          updateMainAlert({
            message: err.response.data.message,
            show: true,
            severity: "error",
          })
        );
      });
    setEditLoading(false);
  };

  const weightedBool = (primary, secondary) => {
    if (primary) {
      return primary;
    }
    return secondary;
  };
  return (
    <div>
      <Paper
        style={{
          margin: "0 auto",
          minHeight: "400px",
          padding: "20px 20px",
          maxWidth: "1500px",
        }}
      >
        <Grid container spacing={1}>
          <Grid items xs={6} style={gridItemStyle}>
            <TextField
              required
              id="name"
              label="Device Name"
              value={editData.name}
              fullWidth
              disabled
              onChange={handleTextFieldChange}
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>
          <Grid items xs={6} style={gridItemStyle}>
            <TextField
              id="owner"
              label="Owner"
              value={editData.owner}
              onChange={handleTextFieldChange}
              fullWidth
              required
            />
          </Grid>
          <Grid items xs={6} style={gridItemStyle}>
            <TextField
              id="description"
              label="Description"
              value={editData.description}
              onChange={handleTextFieldChange}
              fullWidth
              required
            />
          </Grid>
          <Grid items xs={6} style={gridItemStyle}>
            <TextField
              id="device_manufacturer"
              label="Manufacturer"
              value={editData.device_manufacturer}
              onChange={handleTextFieldChange}
              fullWidth
            />
          </Grid>
          <Grid items xs={6} style={gridItemStyle}>
            <TextField
              id="latitude"
              label="Latitude"
              value={editData.latitude}
              onChange={handleTextFieldChange}
              fullWidth
              required
            />
          </Grid>
          <Grid items xs={6} style={gridItemStyle}>
            <TextField
              id="product_name"
              label="Product Name"
              value={editData.product_name}
              onChange={handleTextFieldChange}
              fullWidth
            />
          </Grid>
          <Grid items xs={6} style={gridItemStyle}>
            <TextField
              id="longitude"
              label="Longitude"
              value={editData.longitude}
              onChange={handleTextFieldChange}
              fullWidth
              required
            />
          </Grid>
          <Grid items xs={6} style={gridItemStyle}>
            <TextField
              id="phoneNumber"
              label="Phone Number"
              value={editData.phoneNumber}
              onChange={handleTextFieldChange}
              fullWidth
            />
          </Grid>
          <Grid items xs={6} style={gridItemStyle}>
            <FormControl required fullWidth>
              <InputLabel htmlFor="demo-dialog-native">Data Access</InputLabel>
              <Select
                native
                value={editData.visibility}
                onChange={handleSelectFieldChange("visibility")}
                inputProps={{
                  native: true,
                  style: {
                    height: "40px",
                    marginTop: "10px",
                    border: "1px solid red",
                  },
                }}
                input={<Input id="demo-dialog-native" />}
              >
                <option aria-label="None" value="" />
                <option value="true">Public</option>
                <option value="false">Private</option>
              </Select>
            </FormControl>
          </Grid>
          <Grid items xs={6} style={gridItemStyle}>
            <FormControl fullWidth>
              <InputLabel htmlFor="demo-dialog-native">
                Internet Service Provider
              </InputLabel>
              <Select
                native
                value={editData.ISP}
                onChange={handleSelectFieldChange("ISP")}
                inputProps={{
                  native: true,
                  style: { height: "40px", marginTop: "10px" },
                }}
                input={<Input id="demo-dialog-native" />}
              >
                <option aria-label="None" value="" />
                <option value="MTN">MTN</option>
                <option value="Africell">Africell</option>
                <option value="Airtel">Airtel</option>
              </Select>
            </FormControl>
          </Grid>

          <Grid items xs={6} style={gridItemStyle}>
            <FormControl fullWidth>
              <InputLabel htmlFor="demo-dialog-native">Location</InputLabel>
              <LabelledSelect
                label={"location"}
                isClearable
                defaultValue={filterLocation(
                  locationsData,
                  editData.locationID
                )}
                options={transformLocationOptions(locationsData)}
                onChange={handleLocationChange}
              />
            </FormControl>
          </Grid>

          {/*<Grid items xs={6} style={gridItemStyle}>*/}
          {/*  <TextField*/}
          {/*    id="powerType"*/}
          {/*    label="Power Type"*/}
          {/*    value={editData.powerType}*/}
          {/*    onChange={handleTextFieldChange}*/}
          {/*    fullWidth*/}
          {/*  />*/}
          {/*</Grid>*/}

          {/*<Grid items xs={6} style={gridItemStyle}>*/}
          {/*  <TextField*/}
          {/*    id="height"*/}
          {/*    label="Height"*/}
          {/*    value={editData.height}*/}
          {/*    onChange={handleTextFieldChange}*/}
          {/*    fullWidth*/}
          {/*  />*/}
          {/*</Grid>*/}

          {/*<Grid items xs={6} style={gridItemStyle}>*/}
          {/*  <TextField*/}
          {/*    id="mountType"*/}
          {/*    label="Mount Type"*/}
          {/*    value={editData.mountType}*/}
          {/*    onChange={handleTextFieldChange}*/}
          {/*    fullWidth*/}
          {/*  />*/}
          {/*</Grid>*/}

          <Grid
            container
            alignItems="flex-end"
            alignContent="flex-end"
            justify="flex-end"
            xs={12}
            style={{ margin: "10px 0" }}
          >
            <Button variant="contained" onClick={() => setEditData(deviceData)}>
              Cancel
            </Button>

            <Button
              variant="contained"
              color="primary"
              disabled={weightedBool(
                editLoading,
                isEqual(deviceData, editData)
              )}
              onClick={handleEditSubmit}
              style={{ marginLeft: "10px" }}
            >
              Edit device
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
}
