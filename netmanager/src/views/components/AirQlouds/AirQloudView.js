import React from "react";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";
import { useHistory, useParams } from "react-router-dom";
import { ArrowBackIosRounded } from "@material-ui/icons";
import { Button, Grid, Paper, TextField } from "@material-ui/core";
import CustomMaterialTable from "../Table/CustomMaterialTable";
import { useInitScrollTop } from "utils/customHooks";

import { useAirQloudsData } from "utils/customHooks/AirQloudsHooks";
import { refreshAirQloud } from "redux/AirQloud/operations";

// css
import "react-leaflet-fullscreen/dist/styles.css";
import "assets/css/location-registry.css";

const gridItemStyle = {
  padding: "5px",
  margin: "5px 0",
};

const AirQloudForm = ({ airqloud }) => {
  const history = useHistory();
  const dispatch = useDispatch();

  return (
    <Paper
      style={{
        margin: "0 auto",
        minHeight: "400px",
        padding: "20px 20px",
        maxWidth: "1500px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          color="primary"
          onClick={() =>
            dispatch(refreshAirQloud(airqloud.long_name, airqloud._id))
          }
        >
          Refresh AirQloud
        </Button>
      </div>
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
            onClick={() => history.push("/airqlouds")}
          />
        </div>
        AirQloud Details
      </div>
      <Grid container spacing={1}>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="name"
            label="name"
            variant="outlined"
            value={airqloud.long_name}
            fullWidth
            required
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="name"
            label="AirQloud ID"
            value={airqloud.name}
            variant="outlined"
            fullWidth
            required
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="admin_level"
            label="Administrative Level"
            value={airqloud.admin_level}
            variant="outlined"
            fullWidth
            required
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="isCustom"
            label="Is Custom"
            variant="outlined"
            value={(airqloud.isCustom && "Yes") || "No"}
            fullWidth
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="siteCount"
            label="Site Count"
            variant="outlined"
            value={(airqloud.sites && airqloud.sites.length) || 0}
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
        {/*  <Button variant="contained" onClick={handleCancel}>*/}
        {/*    Cancel*/}
        {/*  </Button>*/}

        {/*  <Button*/}
        {/*    variant="contained"*/}
        {/*    color="primary"*/}
        {/*    disabled={weightedBool(manualDisable, isEqual(site, siteInfo))}*/}
        {/*    onClick={handleSubmit}*/}
        {/*    style={{ marginLeft: "10px" }}*/}
        {/*  >*/}
        {/*    Save Changes*/}
        {/*  </Button>*/}
        {/*</Grid>*/}
      </Grid>
    </Paper>
  );
};

const AirQloudView = (props) => {
  const { className, ...rest } = props;
  useInitScrollTop();
  let params = useParams();
  const history = useHistory();
  const dispatch = useDispatch();
  const airqlouds = useAirQloudsData();
  const airqloud = airqlouds[params.id] || {};

  return (
    <div
      style={{
        width: "96%",
        margin: " 20px auto",
      }}
    >
      <AirQloudForm airqloud={airqloud} key={`${airqloud._id}`} />

      <div>
        <div
          style={{
            margin: "50px auto",
            // minHeight: "400px",
            maxWidth: "1500px",
          }}
        >
          <CustomMaterialTable
            title="AirQloud Sites details"
            userPreferencePaginationKey={"siteDevices"}
            columns={[
              {
                title: "Site Name",
                field: "name",
              },
              {
                title: "Site ID",
                field: "generated_name",
              },
              {
                title: "District",
                field: "district",
              },
              {
                title: "Region",
                field: "region",
              },
              {
                title: "Country",
                field: "country",
              },
            ]}
            data={airqloud.sites || []}
            onRowClick={(event, rowData) => {
              event.preventDefault();
              return history.push(`/sites/${rowData._id}/`);
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

AirQloudView.propTypes = {
  className: PropTypes.string,
};

export default AirQloudView;
