import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { isEmpty } from "underscore";
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
  const goBackUrl = useSiteBackUrl();

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
            value={site.name}
            // onChange={handleTextFieldChange}
            fullWidth
            required
            // disabled
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="description"
            label="Description"
            value={site.description}
            variant="outlined"
            // onChange={handleTextFieldChange}
            fullWidth
            required
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="latitude"
            label="Latitude"
            value={site.latitude}
            variant="outlined"
            // onChange={handleTextFieldChange}
            fullWidth
            required
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="longitude"
            label="Longitude"
            variant="outlined"
            value={site.longitude}
            // onChange={handleTextFieldChange}
            fullWidth
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="parish"
            label="Parish"
            variant="outlined"
            value={site.parish}
            // onChange={handleTextFieldChange}
            fullWidth
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="sub_county"
            label="Sub County"
            variant="outlined"
            value={site.sub_county}
            // onChange={handleTextFieldChange}
            fullWidth
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="district"
            label="District"
            variant="outlined"
            value={site.district}
            // onChange={handleTextFieldChange}
            fullWidth
            required
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="region"
            label="Region"
            variant="outlined"
            value={site.region}
            // onChange={handleTextFieldChange}
            fullWidth
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="altitude"
            label="Altitude"
            variant="outlined"
            value={site.altitude}
            // onChange={handleTextFieldChange}
            fullWidth
            required
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="greenness"
            label="Greenness"
            variant="outlined"
            value={site.greenness}
            // onChange={handleTextFieldChange}
            fullWidth
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="distance_to_nearest_road"
            label="Nearest road (distance)"
            variant="outlined"
            value={site.distance_to_nearest_road}
            // onChange={handleTextFieldChange}
            fullWidth
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="distance_to_nearest_primary_road"
            label="Nearest primary road (distance)"
            variant="outlined"
            value={site.distance_to_nearest_primary_road}
            // onChange={handleTextFieldChange}
            fullWidth
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="distance_to_nearest_tertiary_road"
            label="Nearest tertiary road (distance)"
            variant="outlined"
            value={site.distance_to_nearest_tertiary_road}
            // onChange={handleTextFieldChange}
            fullWidth
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="distance_to_nearest_unclassified_road"
            label="Nearest unclassified road (distance)"
            variant="outlined"
            value={site.distance_to_nearest_unclassified_road}
            // onChange={handleTextFieldChange}
            fullWidth
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="distance_to_nearest_residential_area"
            label="Nearest residential area"
            variant="outlined"
            value={site.distance_to_nearest_residential_area}
            // onChange={handleTextFieldChange}
            fullWidth
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="bearing_to_kampala_center"
            label="Bearing to Kampala center"
            variant="outlined"
            value={site.bearing_to_kampala_center}
            // onChange={handleTextFieldChange}
            fullWidth
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="distance_to_kampala_center"
            variant="outlined"
            label="Distance to Kampala center"
            value={site.distance_to_kampala_center}
            // onChange={handleTextFieldChange}
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
          <Button
            variant="contained"
            // onClick={() => setEditData(deviceData)}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="primary"
            // onClick={handleEditSubmit}
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
