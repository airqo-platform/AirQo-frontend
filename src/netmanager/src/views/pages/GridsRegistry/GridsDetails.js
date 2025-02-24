import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { ArrowBackIosRounded } from '@material-ui/icons';
import DeleteIcon from '@material-ui/icons/DeleteOutlineOutlined';
import {
  Button,
  Grid,
  Paper,
  TextField,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Divider,
  CircularProgress,
  Tooltip,
  Box
} from '@material-ui/core';
import { useInitScrollTop } from 'utils/customHooks';
import ErrorBoundary from 'views/ErrorBoundary/ErrorBoundary';
// css
import 'react-leaflet-fullscreen/dist/styles.css';
import 'assets/css/location-registry.css';
import { isEmpty } from 'underscore';
import { loadGridDetails } from 'redux/Analytics/operations';
import { updateMainAlert } from 'redux/MainAlert/operations';
import GridSitesTable from './SitesTable';
import { updateGridApi } from '../../apis/deviceRegistry';
import { withPermission } from '../../containers/PageAccess';
import { LargeCircularLoader } from '../../components/Loader/CircularLoader';
import HowToApiModal from '../../components/HowToApiModal';
import { stripTrailingSlash } from '../../../config/utils';
import Copyable from '../../components/Copy/Copyable';
import GridReportsView from '../../components/Grid/GridReportsView';

const BASE_ANALYTICS_URL = stripTrailingSlash(process.env.REACT_APP_API_BASE_URL);

const gridItemStyle = {
  padding: '5px',
  margin: '5px 0'
};

const GridForm = ({ grid }) => {
  const history = useHistory();
  const dispatch = useDispatch();

  const initialState = {
    name: '',
    visibility: false,
    admin_level: '',
    description: ''
  };
  const [form, setState] = useState(initialState);
  const [openAPIModal, setOpenAPIModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const clearState = () => {
    setState({ ...initialState });
  };

  const onChange = (e) => {
    setState({
      ...form,
      [e.target.id]: e.target.value
    });
  };

  useEffect(() => {
    if (grid) {
      let gridData = {
        name: grid.name,
        visibility: grid.visibility,
        admin_level: grid.admin_level,
        description: grid.description
      };
      setState(gridData);
    }
  }, [grid]);

  const handleCancel = () => {
    setState({
      name: grid.name,
      visibility: grid.visibility,
      admin_level: grid.admin_level,
      description: grid.description
    });
  };

  const handleSelectFieldChange = (field) => (event) => {
    setState({
      ...form,
      [field]: event.target.value
    });
  };

  const onChangeInputField = (e) => {
    setState({
      ...form,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const gridData = {
      name: form.name,
      visibility: form.visibility,
      admin_level: form.admin_level,
      description: form.description
    };

    await updateGridApi(grid._id, gridData)
      .then((res) => {
        dispatch(
          updateMainAlert({
            show: true,
            message: res.message,
            severity: 'success'
          })
        );

        dispatch(loadGridDetails(grid._id));
        clearState();
        setLoading(false);
      })
      .catch((error) => {
        const errors = error.response && error.response.data && error.response.data.errors;
        dispatch(
          updateMainAlert({
            show: true,
            message: error.response && error.response.data && error.response.data.message,
            severity: 'error'
          })
        );
        setLoading(false);
      });
  };

  return (
    <Paper
      style={{
        margin: '0 auto',
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
            onClick={() => {
              history.push('/grids');
            }}
          />
        </div>
        Grid Details
      </div>
      <Grid container spacing={1}>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="name"
            label="Grid name"
            variant="outlined"
            value={form.name}
            fullWidth
            required
            style={{
              marginBottom: '20px'
            }}
            InputLabelProps={{ shrink: true }}
            disabled
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="_id"
            label="Grid ID"
            variant="outlined"
            fullWidth
            required
            style={{
              marginBottom: '20px'
            }}
            InputLabelProps={{ shrink: true }}
            disabled
            InputProps={{
              startAdornment: grid._id && <Copyable width="100%" value={grid._id} />,
              style: { fontSize: '16px', color: '#263238' }
            }}
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            select
            id="visibility"
            label="Visibility"
            variant="outlined"
            value={form.visibility}
            fullWidth
            SelectProps={{
              native: true,
              style: { width: '100%', height: '53px' }
            }}
            required
            InputLabelProps={{ shrink: true }}
            onChange={handleSelectFieldChange('visibility')}
          >
            <option value={true}>True</option>
            <option value={false}>False</option>
          </TextField>
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="admin_level"
            label="Administrative level"
            variant="outlined"
            value={form.admin_level}
            fullWidth
            required
            style={{
              marginBottom: '20px'
            }}
            InputLabelProps={{ shrink: true }}
            disabled
          />
        </Grid>
        <Grid items xs={12} sm={6} style={gridItemStyle}>
          <TextField
            id="description"
            label="Description"
            variant="outlined"
            value={form.description}
            fullWidth
            style={{
              marginBottom: '20px'
            }}
            InputLabelProps={{ shrink: true }}
            onChange={onChangeInputField}
          />
        </Grid>
        <Grid container xs={12} sm={12} style={gridItemStyle}>
          <Grid items xs={12} sm={6} style={gridItemStyle}>
            <label style={{ textAlign: 'left' }}>Recent Measurements API</label>
            <Box
              style={{
                backgroundColor: '#f0f0f0',
                padding: '5px',
                borderRadius: '5px',
                fontFamily: 'monospace'
              }}
            >
              <Copyable
                width="100%"
                value={`${stripTrailingSlash(BASE_ANALYTICS_URL)}/devices/measurements/grids/${
                  grid._id
                }`}
                isScrollable
              />
            </Box>
          </Grid>
          <Grid items xs={12} sm={6} style={gridItemStyle}>
            <label style={{ textAlign: 'left' }}>Historical Measurements API</label>
            <Box
              style={{
                backgroundColor: '#f0f0f0',
                padding: '5px',
                borderRadius: '5px',
                fontFamily: 'monospace'
              }}
            >
              <Copyable
                width="100%"
                value={`${stripTrailingSlash(BASE_ANALYTICS_URL)}/devices/measurements/grids/${
                  grid._id
                }/historical`}
                isScrollable
              />
            </Box>
          </Grid>
        </Grid>

        <Grid
          container
          alignItems="flex-end"
          alignContent="flex-end"
          justify="flex-end"
          xs={12}
          style={{ margin: '10px 0' }}
        >
          <Grid
            items
            xs={12}
            sm={6}
            style={{
              textDecoration: 'underline',
              padding: '10px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
            onClick={() => setOpenAPIModal(true)}
          >
            <p style={{ width: '100%', textAlign: 'left' }}>How to use the API</p>
          </Grid>

          <Grid
            items
            xs={12}
            sm={6}
            style={{
              display: 'flex',
              justifyContent: 'flex-end'
            }}
          >
            <Button variant="contained" onClick={handleCancel}>
              Reset
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              style={{ marginLeft: '10px' }}
            >
              Save Changes
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <HowToApiModal open={openAPIModal} onClose={() => setOpenAPIModal(false)} />
    </Paper>
  );
};

const GridsDetails = (props) => {
  const { className, ...rest } = props;
  useInitScrollTop();
  let params = useParams();
  const history = useHistory();
  const dispatch = useDispatch();
  const activeGridDetails = useSelector((state) => state.analytics.activeGridDetails);
  const [sitesData, setSitesData] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (params.gridName) {
      try {
        dispatch(loadGridDetails(params.gridName));
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isEmpty(activeGridDetails.sites)) {
      let siteList = [];
      activeGridDetails.sites.map((site) => {
        siteList.push({
          name: site.name,
          parish: site.parish,
          sub_county: site.sub_county,
          city: site.city,
          country: site.country,
          region: site.region,
          createdAt: site.createdAt,
          generated_name: site.generated_name,
          district: site.district,
          _id: site._id
        });
      });
      setSitesData(siteList);
    }
  }, [activeGridDetails]);

  return (
    <ErrorBoundary>
      <div
        style={{
          width: '96%',
          margin: ' 20px auto'
        }}
      >
        <GridForm grid={activeGridDetails} />

        <div>
          <div
            style={{
              margin: '50px auto',
              maxWidth: '1500px'
            }}
          >
            {loading ? (
              <Box
                height={'100px'}
                width={'100%'}
                color="blue"
                display={'flex'}
                justifyContent={'center'}
                alignItems={'center'}
              >
                <LargeCircularLoader loading={loading} />
              </Box>
            ) : (
              sitesData &&
              sitesData.length > 0 && (
                <Box>
                  <GridSitesTable sites={sitesData} />
                  <GridReportsView airqloud={activeGridDetails} />
                </Box>
              )
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default withPermission(GridsDetails, 'CREATE_UPDATE_AND_DELETE_AIRQLOUDS');
