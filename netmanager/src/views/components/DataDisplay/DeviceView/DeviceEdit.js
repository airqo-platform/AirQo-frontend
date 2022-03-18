import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  Paper, TextField, Button, Grid, Accordion, AccordionDetails, AccordionSummary, Typography
} from "@material-ui/core";
import { ExpandMore } from '@material-ui/icons';
import { isEmpty, isEqual, omit } from "underscore";
import { updateMainAlert } from "redux/MainAlert/operations";
import { updateDeviceDetails } from "views/apis/deviceRegistry";
import { loadDevicesData } from "redux/DeviceRegistry/operations";
import { useSiteOptionsData } from "redux/SiteRegistry/selectors";
import { loadSitesData } from "redux/SiteRegistry/operations";
import DeviceDeployStatus from "./DeviceDeployStatus";

import { filterSite } from "utils/sites";

const gridItemStyle = {
  padding: "5px",
};

const EDIT_OMITTED_KEYS = [
  "owner",
  "device_manufacturer",
  "product_name",
  "site",
  "powerType",
  "mountType",
  "height",
  "deployment_date",
  "nextMaintenance",
  "pictures",
];

const EditDeviceForm = ({ deviceData, siteOptions }) => {
  const dispatch = useDispatch();
  const [editData, setEditData] = useState({
    ...omit(deviceData, EDIT_OMITTED_KEYS),
  });

  const [errors, setErrors] = useState({});

  const [site, setSite] = useState(
    filterSite(siteOptions, deviceData.site && deviceData.site._id)
  );
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

  const handleEditSubmit = async () => {
    setEditLoading(true);

    editData.isActive = editData.status === 'deployed' ? true : false;

    if (site && site.value) editData.site_id = site.value;

    if (editData.deployment_date)
      editData.deployment_date = new Date(
        editData.deployment_date
      ).toISOString();

    await updateDeviceDetails(deviceData._id, editData)
      .then((responseData) => {
        dispatch(loadDevicesData());
        dispatch(
          updateMainAlert({
            message: responseData.message,
            show: true,
            severity: "success",
          })
        );
      })
      .catch((err) => {
        console.log("errors", err.response.data);
        const newErrors =
          (err.response && err.response.data && err.response.data.errors) || {};
        setErrors(newErrors);
        dispatch(
          updateMainAlert({
            message:
              (err.response &&
                err.response.data &&
                err.response.data.message) ||
              (err.response && err.response.message),
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

  const [expanded, setExpanded] = React.useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <div>
      <Paper
        style={{
          margin: "0 auto",
          minHeight: "200px",
          padding: "20px 20px",
          maxWidth: "1500px",
        }}
      >
      <Accordion container spacing={1}>
        <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="panel1a-content"
            id="panel1a-header"
        >
          Name, Description
        </AccordionSummary>
        <AccordionDetails>            
        <Grid items xs={12} sm={4} style={gridItemStyle}>
            <TextField
            autoFocus
            margin="dense"
            id="long_name"
            label="Name"
            variant="outlined"
            value={editData.long_name}
            onChange={handleTextFieldChange}
            error={!!errors.long_name}
            helperText={errors.long_name}
            fullWidth
            />
        </Grid>
        <Grid items xs={12} sm={4} style={gridItemStyle}>
            <TextField
            autoFocus
            margin="dense"
            variant="outlined"
            id="description"
            label="Description"
            value={editData.description}
            onChange={handleTextFieldChange}
            error={!!errors.description}
            helperText={errors.description}
            fullWidth
            />
        </Grid>
            </AccordionDetails>
      </Accordion>
      <Accordion container spacing={1}>
            <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
              Phone Number, Internet Service Provider
            </AccordionSummary>
          <AccordionDetails>     
          <Grid items xs={12} sm={4} style={gridItemStyle}>
            <TextField
              autoFocus
              margin="dense"
              variant="outlined"
              id="phoneNumber"
              label="Phone Number"
              value={editData.phoneNumber}
              onChange={handleTextFieldChange}
              error={!!errors.phoneNumber}
              helperText={errors.phoneNumber}
              fullWidth
            />
          </Grid>
          <Grid items xs={12} sm={4} style={gridItemStyle}>
            <TextField
              select
              fullWidth
              label="Internet Service Provider"
              style={{ margin: "10px 0" }}
              value={editData.ISP}
              onChange={handleSelectFieldChange("ISP")}
              SelectProps={{
                native: true,
                style: { width: "100%", height: "50px" },
              }}
              variant="outlined"
              error={!!errors.ISP}
              helperText={errors.ISP}
            >
              <option value="MTN">MTN</option>
              <option value="Airtel">Airtel</option>
              <option value="Africell">Africell</option>
            </TextField>
          </Grid>
          </AccordionDetails>
      </Accordion>
      <Accordion container spacing={1}>
            <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
              Data Access, Primary Device In Location, Deployment status
            </AccordionSummary>
            <AccordionDetails>     
          <Grid items xs={12} sm={4} style={gridItemStyle}>
            <TextField
              select
              fullWidth
              label="Data Access"
              style={{ margin: "10px 0" }}
              value={editData.visibility}
              onChange={handleSelectFieldChange("visibility")}
              SelectProps={{
                native: true,
                style: { width: "100%", height: "50px" },
              }}
              error={!!errors.visibility}
              helperText={errors.visibility}
              variant="outlined"
            >
              <option value={false}>Private</option>
              <option value={true}>Public</option>
            </TextField>
          </Grid>
          <Grid items xs={12} sm={4} style={gridItemStyle}>
            <TextField
              select
              fullWidth
              label="Primary Device In Location"
              style={{ margin: "10px 0" }}
              value={editData.isPrimaryInLocation}
              onChange={handleSelectFieldChange("isPrimaryInLocation")}
              SelectProps={{
                native: true,
                style: { width: "100%", height: "50px" },
              }}
              variant="outlined"
              error={!!errors.isPrimaryInLocation}
              helperText={errors.isPrimaryInLocation}
            >
              <option value={true}>Yes</option>
              <option value={false}>No</option>
            </TextField>
          </Grid>
          <Grid items xs={12} sm={4} style={gridItemStyle}>
            <TextField
              select
              fullWidth
              label="Deployment status"
              style={{ margin: "10px 0" }}
              value={editData.status}
              onChange={handleSelectFieldChange("status")}
              SelectProps={{
                native: true,
                style: { width: "100%", height: "50px" },
              }}
              variant="outlined"
              error={!!errors.status}
              helperText={errors.status}
            >
              <option value={'deployed'}>Deployed</option>
              <option value={'testing'}>Testing</option>
              <option value={'recalled'}>Recalled</option>
            </TextField>
          </Grid>
          </AccordionDetails>
      </Accordion>
          {/*<Grid*/}
          {/*  items*/}
          {/*  xs={12}*/}
          {/*  sm={4}*/}
          {/*  style={{ display: "flex", alignItems: "center" }}*/}
          {/*>*/}
          {/*  <OutlinedSelect*/}
          {/*    label={"Site"}*/}
          {/*    defaultValue={site}*/}
          {/*    onChange={(selectedValue) => {*/}
          {/*      setEditData({ ...editData, site: selectedValue });*/}
          {/*      setSite(selectedValue);*/}
          {/*    }}*/}
          {/*    options={siteOptions}*/}
          {/*    fullWidth*/}
          {/*  />*/}
          {/*</Grid>*/}

          {/*<Grid items xs={12} sm={4} style={gridItemStyle}>*/}
          {/*  <TextField*/}
          {/*    select*/}
          {/*    fullWidth*/}
          {/*    label="Power Type"*/}
          {/*    style={{ margin: "10px 0" }}*/}
          {/*    value={capitalize(editData.powerType)}*/}
          {/*    onChange={handleSelectFieldChange("powerType")}*/}
          {/*    SelectProps={{*/}
          {/*      native: true,*/}
          {/*      style: { width: "100%", height: "50px" },*/}
          {/*    }}*/}
          {/*    error={!!errors.powerType}*/}
          {/*    helperText={errors.powerType}*/}
          {/*    variant="outlined"*/}
          {/*  >*/}
          {/*    <option aria-label="None" value="" />*/}
          {/*    <option value="Mains">Mains</option>*/}
          {/*    <option value="Solar">Solar</option>*/}
          {/*    <option value="Battery">Battery</option>*/}
          {/*  </TextField>*/}
          {/*</Grid>*/}

          {/*<Grid items xs={12} sm={4} style={gridItemStyle}>*/}
          {/*  <TextField*/}
          {/*    autoFocus*/}
          {/*    select*/}
          {/*    margin="dense"*/}
          {/*    variant="outlined"*/}
          {/*    id="mountType"*/}
          {/*    label="Mount Type"*/}
          {/*    value={capitalize(editData.mountType)}*/}
          {/*    onChange={handleSelectFieldChange("mountType")}*/}
          {/*    SelectProps={{*/}
          {/*      native: true,*/}
          {/*      style: { width: "100%", height: "50px" },*/}
          {/*    }}*/}
          {/*    error={!!errors.mountType}*/}
          {/*    helperText={errors.mountType}*/}
          {/*    fullWidth*/}
          {/*  >*/}
          {/*    <option value="" />*/}
          {/*    <option value="Faceboard">Faceboard</option>*/}
          {/*    <option value="Pole">Pole</option>*/}
          {/*    <option value="Rooftop">Rooftop</option>*/}
          {/*    <option value="Suspended">Suspended</option>*/}
          {/*    <option value="Wall">Wall</option>*/}
          {/*  </TextField>*/}
          {/*</Grid>*/}

          {/*<Grid items xs={12} sm={4} style={gridItemStyle}>*/}
          {/*  <TextField*/}
          {/*    autoFocus*/}
          {/*    margin="dense"*/}
          {/*    variant="outlined"*/}
          {/*    id="height"*/}
          {/*    label="height"*/}
          {/*    type="number"*/}
          {/*    value={editData.height}*/}
          {/*    onChange={handleTextFieldChange}*/}
          {/*    error={!!errors.height}*/}
          {/*    helperText={errors.height}*/}
          {/*    fullWidth*/}
          {/*  />*/}
          {/*</Grid>*/}

          {/*<Grid items xs={12} sm={4} style={gridItemStyle}>*/}
          {/*  <TextField*/}
          {/*    autoFocus*/}
          {/*    margin="dense"*/}
          {/*    variant="outlined"*/}
          {/*    id="deployment_date"*/}
          {/*    label="Deployment Date"*/}
          {/*    type="date"*/}
          {/*    InputLabelProps={{ shrink: true }}*/}
          {/*    defaultValue={getDateString(editData.deployment_date)}*/}
          {/*    onChange={handleTextFieldChange}*/}
          {/*    error={!!errors.deployment_date}*/}
          {/*    helperText={errors.deployment_date}*/}
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
              Save Changes
            </Button>
          </Grid>
      </Paper>
    </div>
  );
};

export default function DeviceEdit({ deviceData }) {
  const dispatch = useDispatch();
  const siteOptions = useSiteOptionsData();

  useEffect(() => {
    if (isEmpty(siteOptions)) dispatch(loadSitesData());
  }, []);
  return (
    <div style={{ marginTop: "20px" }}>
      <EditDeviceForm deviceData={deviceData} siteOptions={siteOptions} />
      <DeviceDeployStatus deviceData={deviceData} siteOptions={siteOptions} />
    </div>
  );
}
