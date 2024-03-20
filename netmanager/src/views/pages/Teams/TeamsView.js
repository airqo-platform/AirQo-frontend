import React, { useState, useEffect } from 'react';
import DataTable from './Table';
import ErrorBoundary from '../../ErrorBoundary/ErrorBoundary';
import { setLoading as loadStatus } from 'redux/HorizontalLoader/index';

import { makeStyles } from '@material-ui/styles';
import { useHistory, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Alert from '@material-ui/lab/Alert';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Paper,
  Typography,
  IconButton
} from '@material-ui/core';
import { getTeamDetailsApi, updateTeamApi } from '../../apis/accessControl';
import { updateMainAlert } from 'redux/MainAlert/operations';
import DeleteIcon from '@material-ui/icons/Delete';
import Tooltip from '@material-ui/core/Tooltip';
import { ArrowBackIosRounded } from '@material-ui/icons';
import Select from 'react-select';
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1)
    }
  },
  modelWidth: {
    minWidth: 450,
    [theme.breakpoints.down('sm')]: {
      minWidth: '100%'
    }
  },
  actionButtonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: theme.spacing(2)
  },
  confirm_con: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'left',
    flexDirection: 'column',
    padding: theme.spacing(2)
  },
  confirm_field: {
    margin: theme.spacing(1, 0),
    fontSize: '16px'
  },
  confirm_field_title: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#000000',
    marginRight: theme.spacing(2)
  }
}));

const customStyles = {
  control: (base, state) => ({
    ...base,
    height: '50px',
    marginTop: '10px',
    marginBottom: '10px',
    borderColor: state.isFocused ? '#3f51b5' : '#9a9a9a',
    '&:hover': {
      borderColor: state.isFocused ? 'black' : 'black'
    },
    boxShadow: state.isFocused ? '0 0 1px 1px #3f51b5' : null
  }),
  option: (provided, state) => ({
    ...provided,
    borderBottom: '1px dotted pink',
    color: state.isSelected ? 'white' : 'blue',
    textAlign: 'left'
  }),
  input: (provided, state) => ({
    ...provided,
    height: '40px',
    borderColor: state.isFocused ? '#3f51b5' : 'black'
  }),
  placeholder: (provided, state) => ({
    ...provided,
    color: '#000'
  }),
  menu: (provided, state) => ({
    ...provided,
    zIndex: 9999
  })
};

const EditTeams = ({ setLoading, params, teamsData, setTeamsData }) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  // Initialize teams state with default values
  const [teams, setTeams] = useState({
    name: '',
    description: '',
    status: ''
  });

  const [errors, setErrors] = useState({
    name: '',
    description: '',
    showError: false,
    errorMessage: ''
  });
  const [isChanged, setIsChanged] = useState(false);

  // Set default values from teamsData when the component loads
  useEffect(() => {
    setTeams({
      name: teamsData.grp_title || '',
      description: teamsData.grp_description || '',
      status: teamsData.grp_status || ''
    });
  }, [teamsData]);

  const handleChange = (name) => (event) => {
    const newValue = event.target.value;
    setTeams({ ...teams, [name]: newValue });
    setErrors({ ...errors, [name]: '' });
    setIsChanged(true);
  };

  const handleCancel = () => {
    // Reset fields to their default values from teamsData
    setTeams({
      name: teamsData.grp_title || '',
      description: teamsData.grp_description || '',
      status: teamsData.grp_status || ''
    });
    setIsChanged(false);
  };

  const onChangeDropdown = (selectedOption) => {
    const newValue = selectedOption ? selectedOption.value : '';
    setTeams({ ...teams, status: newValue });
    setIsChanged(true);
  };

  const handleUpdateTeam = async () => {
    if (!teams.name || !teams.description) return;

    setLoading(true);
    dispatch(loadStatus(true));

    const teamsData = {
      grp_title: teams.name,
      grp_description: teams.description,
      grp_status: teams.status
    };

    try {
      const res = await updateTeamApi(params.id, teamsData);
      setIsChanged(false);
      dispatch(
        updateMainAlert({
          severity: 'success',
          message: res.message,
          show: true
        })
      );
    } catch (err) {
      setErrors({
        showError: true,
        errorMessage: err.message
      });
    } finally {
      setLoading(false);
      dispatch(loadStatus(false));
    }
  };

  return (
    <Paper style={{ margin: '0 auto', padding: '20px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center'
        }}>
        <Typography
          style={{
            marginBottom: '20px',
            color: '#3f51b5',
            textTransform: 'uppercase',
            fontWeight: 'bold'
          }}>
          Edit Team Details
        </Typography>
      </div>
      <form className={classes.modelWidth}>
        {errors.showError && (
          <Alert
            style={{ marginBottom: '10px' }}
            severity="error"
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  setErrors({ showError: false });
                }}>
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }>
            {errors.errorMessage}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              disabled
              fullWidth
              margin="dense"
              label="Team Name"
              variant="outlined"
              value={teams.name}
              onChange={handleChange('name')}
              required
              error={!!errors.name}
              helperText={errors.name}
              InputLabelProps={{ shrink: Boolean(teams.name) }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              margin="dense"
              label="Team Description"
              variant="outlined"
              value={teams.description}
              onChange={handleChange('description')}
              required
              error={!!errors.description}
              helperText={errors.description}
              InputLabelProps={{ shrink: Boolean(teams.description) }}
            />
          </Grid>
          <Grid item xs={12}>
            <Select
              label="Team Status"
              name="status"
              styles={customStyles}
              value={teams.status ? { value: teams.status, label: teams.status } : null}
              options={[
                { value: 'ACTIVE', label: 'ACTIVE' },
                { value: 'INACTIVE', label: 'INACTIVE' }
              ]}
              onChange={onChangeDropdown}
              placeholder="Select Status"
              required
            />
          </Grid>
        </Grid>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleCancel}
            style={{ marginRight: '8px' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!isChanged}
            onClick={handleUpdateTeam}>
            Save Changes
          </Button>
        </div>
      </form>
    </Paper>
  );
};

const TeamsView = () => {
  let params = useParams();
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [teamsData, setTeamsData] = useState([]);

  useEffect(() => {
    setLoading(true);
    getTeamDetailsApi(params.id)
      .then((response) => {
        setTeamsData(response.group);
        setLoading(false);
      })
      .catch((error) => {
        dispatch(updateMainAlert(error.message, 'error'));
        setLoading(false);
      });
  }, [params.id, dispatch]);

  const handleDelete = (id) => {
    // Add your delete logic here
  };

  let filteredData = [];
  if (teamsData.grp_users) {
    filteredData = teamsData.grp_users.map((row) => {
      return {
        id: row._id,
        username: `${row.firstName} ${row.lastName}`,
        email: row.email,
        country: row.country,
        long_organization: row.long_organization
      };
    });
  }

  return (
    <ErrorBoundary>
      <div className={classes.root}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            marginBottom: 20
          }}>
          <ArrowBackIosRounded
            style={{ color: '#3f51b5', cursor: 'pointer' }}
            onClick={() => history.push('/teams')}
          />
        </div>

        <EditTeams
          setLoading={setIsLoaded}
          params={params}
          teamsData={teamsData}
          setTeamsData={setTeamsData}
        />

        <br />

        <DataTable
          title="Team Members"
          columns={[
            {
              id: 'username',
              label: 'Username'
            },
            {
              id: 'email',
              label: 'Email'
            },
            {
              id: 'country',
              label: 'Country'
            },
            {
              id: 'long_organization',
              label: 'Organization'
            }
          ]}
          onRowClick={(row) => {
            return;
          }}
          rows={filteredData}
          loading={loading}
        />
      </div>
    </ErrorBoundary>
  );
};

export default TeamsView;
