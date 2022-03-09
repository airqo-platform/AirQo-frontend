import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { isEmpty, isEqual } from "underscore";
import PropTypes from "prop-types";
import { useHistory, useParams } from "react-router-dom";
import { ArrowBackIosRounded } from "@material-ui/icons";
import { Button, Grid, Paper, TextField } from "@material-ui/core";

import { useSitesData } from "redux/SiteRegistry/selectors";
import { loadSitesData } from "redux/SiteRegistry/operations";
import CustomMaterialTable from "../Table/CustomMaterialTable";
import { useInitScrollTop } from "utils/customHooks";
import { humanReadableDate } from "utils/dateTime";
import { useSiteBackUrl } from "redux/Urls/selectors";
import { updateSiteApi } from "views/apis/deviceRegistry";
import { updateMainAlert } from "redux/MainAlert/operations";

// css
import "react-leaflet-fullscreen/dist/styles.css";
import "assets/css/location-registry.css";

const gridItemStyle = {
  padding: "5px",
  margin: "5px 0",
};

const Cell = ({ fieldValue }) => {
  return <div>{fieldValue || "N/A"}</div>;
};

const SiteForm = ({ site }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const goBackUrl = useSiteBackUrl();

  const [siteInfo, setSiteInfo] = useState(site);
  const [errors, setErrors] = useState({});
  const [manualDisable, setManualDisable] = useState(false);

  const weightedBool = (first, second) => {
    if (first) return true;
    return second;
  };
  const handleSiteInfoChange = (event) => {
    const id = event.target.id;
    const value = event.target.value;

    setSiteInfo({ ...siteInfo, [id]: value });
  };

  const handleCancel = () => {
    setSiteInfo(site);
  };

  const handleSubmit = async () => {
    if(isEmpty(siteInfo.airqlouds)) { delete siteInfo.airqlouds }
    setManualDisable(true);
    await updateSiteApi(site._id, siteInfo)
      .then((responseData) => {
        dispatch(
          updateMainAlert({
            severity: "success",
            message: responseData.message,
            show: true,
          })
        );
        setSiteInfo(responseData.site);
        dispatch(loadSitesData());
      })
      .catch((err) => {
        const errors =
          (err.response && err.response.data && err.response.data.error) || {};
        setErrors(errors);
        dispatch(
          updateMainAlert({
            severity: "error",
            message: err.response && err.response.data.message,
            show: true,
          })
        );
      });
    setManualDisable(false);
  };

  return (
    <Paper
      style={{
        margin: "0 auto",
        minHeight: "400px",
        padding: "20px 20px",
        maxWidth: "1500px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          fontSize: "1.2rem",
          fontWeight: "bold",
          margin: "20px 0",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "5px",
          }}
        >
          <ArrowBackIosRounded
            style={{ color: "#3f51b5", cursor: "pointer" }}
            onClick={() => history.push(goBackUrl)}
          />
        </div>
        Site Details
      </div>
      <Grid container spacing={1}>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="name"
            label="name"
            variant="outlined"
            value={siteInfo.name}
            onChange={handleSiteInfoChange}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
            required
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="description"
            label="Description"
            value={siteInfo.description}
            variant="outlined"
            onChange={handleSiteInfoChange}
            error={!!errors.description}
            helperText={errors.description}
            fullWidth
            required
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="latitude"
            label="Latitude"
            value={siteInfo.latitude}
            variant="outlined"
            onChange={handleSiteInfoChange}
            error={!!errors.latitude}
            helperText={errors.latitude}
            fullWidth
            required
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="longitude"
            label="Longitude"
            variant="outlined"
            value={siteInfo.longitude}
            onChange={handleSiteInfoChange}
            error={!!errors.longitude}
            helperText={errors.longitude}
            fullWidth
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="parish"
            label="Parish"
            variant="outlined"
            value={siteInfo.parish}
            onChange={handleSiteInfoChange}
            error={!!errors.parish}
            helperText={errors.parish}
            fullWidth
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="sub_county"
            label="Sub County"
            variant="outlined"
            value={siteInfo.sub_county}
            onChange={handleSiteInfoChange}
            error={!!errors.sub_county}
            helperText={errors.sub_county}
            fullWidth
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="district"
            label="District"
            variant="outlined"
            value={siteInfo.district}
            onChange={handleSiteInfoChange}
            error={!!errors.district}
            helperText={errors.district}
            fullWidth
            required
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="region"
            label="Region"
            variant="outlined"
            value={siteInfo.region}
            onChange={handleSiteInfoChange}
            error={!!errors.region}
            helperText={errors.region}
            fullWidth
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="altitude"
            label="Altitude"
            variant="outlined"
            value={siteInfo.altitude}
            onChange={handleSiteInfoChange}
            error={!!errors.altitude}
            helperText={errors.altitude}
            fullWidth
            required
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="greenness"
            label="Greenness"
            variant="outlined"
            value={siteInfo.greenness}
            onChange={handleSiteInfoChange}
            error={!!errors.greenness}
            helperText={errors.greenness}
            fullWidth
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="distance_to_nearest_road"
            label="Nearest road (m)"
            variant="outlined"
            value={siteInfo.distance_to_nearest_road}
            onChange={handleSiteInfoChange}
            error={!!errors.distance_to_nearest_road}
            helperText={errors.distance_to_nearest_road}
            fullWidth
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="distance_to_nearest_primary_road"
            label="Nearest primary road (m)"
            variant="outlined"
            value={siteInfo.distance_to_nearest_primary_road}
            onChange={handleSiteInfoChange}
            error={!!errors.distance_to_nearest_primary_road}
            helperText={errors.distance_to_nearest_primary_road}
            fullWidth
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="distance_to_nearest_tertiary_road"
            label="Nearest tertiary road (m)"
            variant="outlined"
            value={siteInfo.distance_to_nearest_tertiary_road}
            onChange={handleSiteInfoChange}
            error={!!errors.distance_to_nearest_tertiary_road}
            helperText={errors.distance_to_nearest_tertiary_road}
            fullWidth
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="distance_to_nearest_unclassified_road"
            label="Nearest unclassified road (m)"
            variant="outlined"
            value={siteInfo.distance_to_nearest_unclassified_road}
            onChange={handleSiteInfoChange}
            error={!!errors.distance_to_nearest_unclassified_road}
            helperText={errors.distance_to_nearest_unclassified_road}
            fullWidth
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="distance_to_nearest_residential_road"
            label="Nearest residential road (m)"
            variant="outlined"
            value={siteInfo.distance_to_nearest_residential_road}
            onChange={handleSiteInfoChange}
            error={!!errors.distance_to_nearest_residential_road}
            helperText={errors.distance_to_nearest_residential_road}
            fullWidth
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="bearing_to_kampala_center"
            label="Bearing to Kampala center"
            variant="outlined"
            value={siteInfo.bearing_to_kampala_center}
            onChange={handleSiteInfoChange}
            error={!!errors.bearing_to_kampala_center}
            helperText={errors.bearing_to_kampala_center}
            fullWidth
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="distance_to_kampala_center"
            variant="outlined"
            label="Distance to Kampala center (km)"
            value={siteInfo.distance_to_kampala_center}
            onChange={handleSiteInfoChange}
            error={!!errors.distance_to_kampala_center}
            helperText={errors.distance_to_kampala_center}
            fullWidth
          />
        </Grid>

        <Grid
          container
          alignItems="flex-end"
          alignContent="flex-end"
          justify="flex-end"
          xs={12}
          style={{ margin: "10px 0" }}
        >
          <Button variant="contained" onClick={handleCancel}>
            Cancel
          </Button>

          <Button
            variant="contained"
            color="primary"
            disabled={weightedBool(manualDisable, isEqual(site, siteInfo))}
            onClick={handleSubmit}
            style={{ marginLeft: "10px" }}
          >
            Save Changes
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

const SiteView = (props) => {
  const { className, ...rest } = props;
  useInitScrollTop();
  let params = useParams();
  const history = useHistory();
  const sites = useSitesData();
  const dispatch = useDispatch();
  const [site, setSite] = useState(sites[params.id] || {});

  useEffect(() => {
    if (isEmpty(sites)) dispatch(loadSitesData());
  }, []);

  useEffect(() => {
    setSite(sites[params.id] || {});
  }, [sites]);

  return (
    <div
      style={{
        width: "96%",
        margin: " 20px auto",
      }}
    >
      <SiteForm site={site} key={`${site._id}`} />

      <div>
        <div
          style={{
            margin: "50px auto",
            // minHeight: "400px",
            maxWidth: "1500px",
          }}
        >
          <CustomMaterialTable
            title="Site Devices details"
            userPreferencePaginationKey={"siteDevices"}
            columns={[
              {
                title: "Device Name",
                field: "name",
              },
              {
                title: "Description",
                field: "description",
              },
              {
                title: "Site",
                field: "site",
                render: (data) => (
                  <Cell fieldValue={data.site && data.site.description} />
                ),
              },

              {
                title: "Is Primary",
                field: "siteName",
                render: (data) => (
                  <span>
                    {data.isPrimaryInLocation ? (
                      <span style={{ color: "green" }}>Yes</span>
                    ) : (
                      <span style={{ color: "red" }}>No</span>
                    )}
                  </span>
                ),
              },
              {
                title: "Is Co-located",
                field: "locationName",
                render: (data) => (
                  <span>
                    {data.isUsedForCollocation ? (
                      <span style={{ color: "green" }}>Yes</span>
                    ) : (
                      <span style={{ color: "red" }}>No</span>
                    )}
                  </span>
                ),
              },
              {
                title: "Registration Date",
                field: "createdAt",
                render: (data) => (
                  <Cell
                    data={data}
                    fieldValue={humanReadableDate(data.createdAt)}
                  />
                ),
              },
              {
                title: "Deployment status",
                field: "isActive",
                render: (data) => (
                  <Cell
                    fieldValue={
                      data.isActive ? (
                        <span style={{ color: "green" }}>Deployed</span>
                      ) : (
                        <span style={{ color: "red" }}>Not Deployed</span>
                      )
                    }
                  />
                ),
              },
            ]}
            data={site.devices || []}
            onRowClick={(event, rowData) => {
              event.preventDefault();
              return history.push(`/device/${rowData.name}/overview`);
            }}
            options={{
              search: true,
              exportButton: true,
              searchFieldAlignment: "right",
              showTitle: true,
              searchFieldStyle: {
                fontFamily: "Open Sans",
              },
              headerStyle: {
                fontFamily: "Open Sans",
                fontSize: 14,
                fontWeight: 600,
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

SiteView.propTypes = {
  className: PropTypes.string,
};

export default SiteView;
