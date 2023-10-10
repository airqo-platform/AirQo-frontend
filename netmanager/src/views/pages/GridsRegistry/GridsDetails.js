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
import CustomMaterialTable from '../../components/Table/CustomMaterialTable';
import { useInitScrollTop } from 'utils/customHooks';
import ErrorBoundary from 'views/ErrorBoundary/ErrorBoundary';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import Typography from '@material-ui/core/Typography';
// css
import 'react-leaflet-fullscreen/dist/styles.css';
import 'assets/css/location-registry.css';
import { isEmpty, isEqual } from 'underscore';
import { loadGridDetails } from '../../../redux/Analytics/operations';
import Select from 'react-select';
import { useDevicesData } from '../../../redux/DeviceRegistry/selectors';
import { updateMainAlert } from '../../../redux/MainAlert/operations';
import GridSitesTable from './SitesTable';
import { updateGridApi } from '../../apis/deviceRegistry';
import { withPermission } from '../../containers/PageAccess';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(4)
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textTransform: 'capitalize'
  },
  titleSpacing: {
    marginBottom: theme.spacing(2)
  }
}));

const gridItemStyle = {
  padding: '5px',
  margin: '5px 0'
};

const createDeviceOptions = (devices) => {
  const options = [];
  devices.map((device) => {
    options.push({
      value: device._id,
      label: device.name
    });
  });
  return options;
};

const GridForm = ({ grid }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork') || {});

  const initialState = {
    name: '',
    visibility: false,
    admin_level: '',
    description: ''
  };
  const [form, setState] = useState(initialState);
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
              // dispatch(removeAirQloudData());
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
      dispatch(loadGridDetails(params.gridName));
    }
    setTimeout(() => {
      setLoading(false);
    }, 5000);
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
                Loading grid sites...
              </Box>
            ) : (
              sitesData && sitesData.length > 0 && <GridSitesTable sites={sitesData} />
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default withPermission(GridsDetails, 'CREATE_UPDATE_AND_DELETE_AIRQLOUDS');
