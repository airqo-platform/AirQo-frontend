import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { isEmpty } from "underscore";
import PropTypes from "prop-types";
import { Grid } from "@material-ui/core";
import { useHistory, useParams } from "react-router-dom";
import { Paper } from "@material-ui/core";

import { useSitesData } from "redux/SiteRegistry/selectors";
import { loadSitesData } from "redux/SiteRegistry/operations";

import "assets/css/location-registry.css";
import TextField from "@material-ui/core/TextField";
import CustomMaterialTable from "../Table/CustomMaterialTable";
import { useInitScrollTop } from "../../../utils/customHooks";
import { humanReadableDate } from "../../../utils/dateTime";

// css
import "react-leaflet-fullscreen/dist/styles.css";

const gridItemStyle = {
  padding: "5px",
};

const Cell = ({ fieldValue }) => {
  return <div>{fieldValue || "N/A"}</div>;
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
      <div>
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
              fontSize: "1.2rem",
              fontWeight: "bold",
              margin: "20px 0",
            }}
          >
            Site Details
          </div>
          <Grid container spacing={1}>
            <Grid items xs={12} sm={6} style={gridItemStyle}>
              <TextField
                id="name"
                label="name"
                value={site.name || site.description}
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
                // onChange={handleTextFieldChange}
                fullWidth
                required
              />
            </Grid>
            <Grid items xs={12} sm={6} style={gridItemStyle}>
              <TextField
                id="longitude"
                label="Longitude"
                value={site.longitude}
                // onChange={handleTextFieldChange}
                fullWidth
              />
            </Grid>
            <Grid items xs={12} sm={6} style={gridItemStyle}>
              <TextField
                id="parish"
                label="Parish"
                value={site.parish}
                // onChange={handleTextFieldChange}
                fullWidth
              />
            </Grid>
            <Grid items xs={12} sm={6} style={gridItemStyle}>
              <TextField
                id="sub_county"
                label="Sub County"
                value={site.sub_county}
                // onChange={handleTextFieldChange}
                fullWidth
              />
            </Grid>
            <Grid items xs={12} sm={6} style={gridItemStyle}>
              <TextField
                id="district"
                label="District"
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
                value={site.region}
                // onChange={handleTextFieldChange}
                fullWidth
              />
            </Grid>
            <Grid items xs={12} sm={6} style={gridItemStyle}>
              <TextField
                id="altitude"
                label="Altitude"
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
                value={site.greenness}
                // onChange={handleTextFieldChange}
                fullWidth
              />
            </Grid>
            <Grid items xs={12} sm={6} style={gridItemStyle}>
              <TextField
                id="distance_to_nearest_road"
                label="Nearest road (distance)"
                value={site.distance_to_nearest_road}
                // onChange={handleTextFieldChange}
                fullWidth
              />
            </Grid>
            <Grid items xs={12} sm={6} style={gridItemStyle}>
              <TextField
                id="distance_to_nearest_primary_road"
                label="Nearest primary road (distance)"
                value={site.distance_to_nearest_primary_road}
                // onChange={handleTextFieldChange}
                fullWidth
              />
            </Grid>
            <Grid items xs={12} sm={6} style={gridItemStyle}>
              <TextField
                id="distance_to_nearest_tertiary_road"
                label="Nearest tertiary road (distance)"
                value={site.distance_to_nearest_tertiary_road}
                // onChange={handleTextFieldChange}
                fullWidth
              />
            </Grid>
            <Grid items xs={12} sm={6} style={gridItemStyle}>
              <TextField
                id="distance_to_nearest_unclassified_road"
                label="Nearest unclassified road (distance)"
                value={site.distance_to_nearest_unclassified_road}
                // onChange={handleTextFieldChange}
                fullWidth
              />
            </Grid>
            <Grid items xs={12} sm={6} style={gridItemStyle}>
              <TextField
                id="distance_to_nearest_residential_area"
                label="Nearest residential area"
                value={site.distance_to_nearest_residential_area}
                // onChange={handleTextFieldChange}
                fullWidth
              />
            </Grid>
            <Grid items xs={12} sm={6} style={gridItemStyle}>
              <TextField
                id="bearing_to_kampala_center"
                label="Bearing to Kampala center"
                value={site.bearing_to_kampala_center}
                // onChange={handleTextFieldChange}
                fullWidth
              />
            </Grid>
            <Grid items xs={12} sm={6} style={gridItemStyle}>
              <TextField
                id="distance_to_kampala_center"
                label="Distance to Kampala center"
                value={site.distance_to_kampala_center}
                // onChange={handleTextFieldChange}
                fullWidth
              />
            </Grid>

            {/*<Grid*/}
            {/*  container*/}
            {/*  alignItems="flex-end"*/}
            {/*  alignContent="flex-end"*/}
            {/*  justify="flex-end"*/}
            {/*  xs={12}*/}
            {/*  style={{ margin: "10px 0" }}*/}
            {/*>*/}
            {/*  <Button*/}
            {/*    variant="contained"*/}
            {/*    onClick={() => setEditData(deviceData)}*/}
            {/*  >*/}
            {/*    Cancel*/}
            {/*  </Button>*/}

            {/*  <Button*/}
            {/*    variant="contained"*/}
            {/*    color="primary"*/}
            {/*    disabled={weightedBool(*/}
            {/*      editLoading,*/}
            {/*      isEqual(deviceData, editData)*/}
            {/*    )}*/}
            {/*    onClick={handleEditSubmit}*/}
            {/*    style={{ marginLeft: "10px" }}*/}
            {/*  >*/}
            {/*    Edit device*/}
            {/*  </Button>*/}
            {/*</Grid>*/}
          </Grid>
        </Paper>
      </div>

      <div>
        <Paper
          style={{
            margin: "50px auto",
            minHeight: "400px",
            padding: "20px 20px",
            maxWidth: "1500px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "1.2rem",
              fontWeight: "bold",
              margin: "20px 0",
            }}
          >
            Site Device Details
          </div>
          <CustomMaterialTable
            title="Site Devices"
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
              searchFieldAlignment: "left",
              showTitle: false,
              searchFieldStyle: {
                fontFamily: "Open Sans",
              },
              headerStyle: {
                fontFamily: "Open Sans",
                fontSize: 16,
                fontWeight: 600,
              },
            }}
          />
        </Paper>
      </div>
    </div>
  );
};

SiteView.propTypes = {
  className: PropTypes.string,
};

export default SiteView;
