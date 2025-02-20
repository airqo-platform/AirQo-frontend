import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { isEmpty } from 'underscore';
import PropTypes from 'prop-types';
import { useHistory, useParams } from 'react-router-dom';
import { ArrowBackIosRounded } from '@material-ui/icons';
import { Button, Grid, Paper, TextField, Typography } from '@material-ui/core';

import { useSiteDetailsData } from 'redux/SiteRegistry/selectors';
import { loadSiteDetails } from 'redux/SiteRegistry/operations';
import CustomMaterialTable from '../Table/CustomMaterialTable';
import { useInitScrollTop } from 'utils/customHooks';
import { humanReadableDate } from 'utils/dateTime';
import { useSiteBackUrl } from 'redux/Urls/selectors';
import { updateSiteApi } from 'views/apis/deviceRegistry';
import { updateMainAlert } from 'redux/MainAlert/operations';

// styles
import { makeStyles } from '@material-ui/core/styles';

// css
import 'react-leaflet-fullscreen/dist/styles.css';
import 'assets/css/location-registry.css';
import { withPermission } from '../../containers/PageAccess';

import { setLoading as loadStatus } from 'redux/HorizontalLoader/index';

const gridItemStyle = {
  padding: '5px',
  margin: '5px 0'
};

const Cell = ({ fieldValue }) => {
  return <div>{fieldValue || 'N/A'}</div>;
};

// this is style for the cursor to show disabled
const useStyles = makeStyles({
  disabled: {
    cursor: 'not-allowed',
    opacity: 0.5
  }
});

const SiteForm = ({ site }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const goBackUrl = useSiteBackUrl();

  const [loading, setLoading] = useState(false);
  const [siteInfo, setSiteInfo] = useState({});
  const [errors, setErrors] = useState({});
  const activeNetwork = useSelector((state) => state.accessControl.activeNetwork);

  const handleSiteInfoChange = (event) => {
    const id = event.target.id;
    const value = event.target.value;

    setSiteInfo({ ...siteInfo, [id]: value });
  };

  const handleCancel = () => {
    setSiteInfo({});
    if (!isEmpty(activeNetwork)) {
      dispatch(loadSiteDetails(site._id, activeNetwork.net_name));
    }
  };

  const weightedBool = (primary, secondary) => {
    if (primary) {
      return primary;
    }
    return secondary;
  };

  const handleSubmit = async () => {
    setLoading(true);
    dispatch(loadStatus(true));
    await updateSiteApi(site._id, siteInfo)
      .then((responseData) => {
        dispatch(
          updateMainAlert({
            severity: 'success',
            message: responseData.message,
            show: true
          })
        );
        setSiteInfo({});
        if (!isEmpty(activeNetwork)) {
          dispatch(loadSiteDetails(site._id, activeNetwork.net_name));
        }
      })
      .catch((err) => {
        const errors = (err.response && err.response.data && err.response.data.error) || {};
        setErrors(errors);
        dispatch(
          updateMainAlert({
            severity: 'error',
            message: err.response && err.response.data.message,
            show: true
          })
        );
      });
    setLoading(false);
    dispatch(loadStatus(false));
  };

  return (
    <Paper
      style={{
        margin: '0 auto',
        minHeight: '400px',
        padding: '20px 20px',
        maxWidth: '1500px'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          margin: '20px 0'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '5px'
          }}
        >
          <ArrowBackIosRounded
            style={{ color: '#3f51b5', cursor: 'pointer' }}
            onClick={() => history.goBack()}
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
            defaultValue={site.name}
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
            defaultValue={site.description}
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
            id="network"
            label="Network"
            defaultValue={site.network}
            variant="outlined"
            onChange={handleSiteInfoChange}
            error={!!errors.network}
            helperText={errors.network}
            fullWidth
            required
            disabled
            InputProps={{
              classes: {
                disabled: useStyles().disabled
              }
            }}
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="latitude"
            label="Latitude"
            defaultValue={site.latitude}
            variant="outlined"
            onChange={handleSiteInfoChange}
            error={!!errors.latitude}
            helperText={errors.latitude}
            fullWidth
            required
            disabled
            InputProps={{
              classes: {
                disabled: useStyles().disabled
              }
            }}
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="longitude"
            label="Longitude"
            variant="outlined"
            defaultValue={site.longitude}
            onChange={handleSiteInfoChange}
            error={!!errors.longitude}
            helperText={errors.longitude}
            fullWidth
            disabled
            InputProps={{
              classes: {
                disabled: useStyles().disabled
              }
            }}
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="parish"
            label="Parish"
            variant="outlined"
            defaultValue={site.parish}
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
            defaultValue={site.sub_county}
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
            defaultValue={site.district}
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
            defaultValue={site.region}
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
            defaultValue={site.altitude}
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
            defaultValue={site.greenness}
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
            defaultValue={site.distance_to_nearest_road}
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
            defaultValue={site.distance_to_nearest_primary_road}
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
            defaultValue={site.distance_to_nearest_tertiary_road}
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
            defaultValue={site.distance_to_nearest_unclassified_road}
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
            defaultValue={site.distance_to_nearest_residential_road}
            onChange={handleSiteInfoChange}
            error={!!errors.distance_to_nearest_residential_road}
            helperText={errors.distance_to_nearest_residential_road}
            fullWidth
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="bearing_to_capital_city_center"
            label="Bearing to Capital City center"
            variant="outlined"
            defaultValue={
              site && site.bearing_to_capital_city_center ? site.bearing_to_capital_city_center : ''
            }
            onChange={handleSiteInfoChange}
            error={!!errors.bearing_to_capital_city_center}
            helperText={errors.bearing_to_capital_city_center}
            fullWidth
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="distance_to_capital_city_center"
            variant="outlined"
            label="Distance to Capital City center (km)"
            defaultValue={
              site && site.distance_to_capital_city_center
                ? site.distance_to_capital_city_center
                : ''
            }
            onChange={handleSiteInfoChange}
            error={!!errors.distance_to_capital_city_center}
            helperText={errors.distance_to_capital_city_center}
            fullWidth
          />
        </Grid>

        <Grid xs={12} sm={12} style={gridItemStyle}>
          <Typography variant="h3">Mobile app site details</Typography>
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="search_name"
            label="Editable Name"
            defaultValue={site.search_name}
            variant="outlined"
            onChange={handleSiteInfoChange}
            error={!!errors.search_name}
            helperText={errors.search_name}
            fullWidth
            required
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="location_name"
            label="Editable Description"
            defaultValue={site.location_name}
            variant="outlined"
            onChange={handleSiteInfoChange}
            error={!!errors.location_name}
            helperText={errors.location_name}
            fullWidth
            required
          />
        </Grid>

        <Grid
          container
          alignItems="flex-end"
          alignContent="flex-end"
          justify="flex-end"
          xs={12}
          style={{ margin: '10px 0' }}
        >
          <Button variant="contained" onClick={handleCancel}>
            Cancel
          </Button>

          <Button
            variant="contained"
            color="primary"
            disabled={weightedBool(loading, isEmpty(siteInfo))}
            onClick={handleSubmit}
            style={{ marginLeft: '10px' }}
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
  const site = useSiteDetailsData();
  const dispatch = useDispatch();
  const activeNetwork = useSelector((state) => state.accessControl.activeNetwork);

  useEffect(() => {
    if (!activeNetwork) return;
    if (!isEmpty(activeNetwork)) {
      dispatch(loadSiteDetails(params.id, activeNetwork.net_name));
    }
  }, []);

  return (
    <div
      style={{
        width: '96%',
        margin: ' 20px auto'
      }}
    >
      <SiteForm site={site} key={`${site._id}`} />

      <div>
        <div
          style={{
            margin: '50px auto',
            // minHeight: "400px",
            maxWidth: '1500px'
          }}
        >
          <CustomMaterialTable
            title="Site Devices details"
            userPreferencePaginationKey={'siteDevices'}
            columns={[
              {
                title: 'Device Name',
                field: 'name'
              },
              {
                title: 'Description',
                field: 'description'
              },
              {
                title: 'Site',
                field: 'site',
                render: (data) => <Cell fieldValue={data.site && data.site.description} />
              },

              {
                title: 'Is Primary',
                field: 'siteName',
                render: (data) => (
                  <span>
                    {data.isPrimaryInLocation ? (
                      <span style={{ color: 'green' }}>Yes</span>
                    ) : (
                      <span style={{ color: 'red' }}>No</span>
                    )}
                  </span>
                )
              },
              {
                title: 'Is Co-located',
                field: 'locationName',
                render: (data) => (
                  <span>
                    {data.isUsedForCollocation ? (
                      <span style={{ color: 'green' }}>Yes</span>
                    ) : (
                      <span style={{ color: 'red' }}>No</span>
                    )}
                  </span>
                )
              },
              {
                title: 'Registration Date',
                field: 'createdAt',
                render: (data) => (
                  <Cell data={data} fieldValue={humanReadableDate(data.createdAt)} />
                )
              },
              {
                title: 'Deployment status',
                field: 'isActive',
                render: (data) => (
                  <Cell
                    fieldValue={
                      data.isActive ? (
                        <span style={{ color: 'green' }}>Deployed</span>
                      ) : (
                        <span style={{ color: 'red' }}>Not Deployed</span>
                      )
                    }
                  />
                )
              }
            ]}
            data={site.devices || []}
            onRowClick={(event, rowData) => {
              event.preventDefault();
              return history.push(`/device/${rowData.name}/overview`);
            }}
            options={{
              search: true,
              exportButton: true,
              searchFieldAlignment: 'right',
              showTitle: true,
              searchFieldStyle: {
                fontFamily: 'Open Sans'
              },
              headerStyle: {
                fontFamily: 'Open Sans',
                fontSize: 14,
                fontWeight: 600
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

SiteView.propTypes = {
  className: PropTypes.string
};

export default withPermission(SiteView, 'CREATE_UPDATE_AND_DELETE_NETWORK_SITES');
