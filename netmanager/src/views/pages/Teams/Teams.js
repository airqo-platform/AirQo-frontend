import React, { useState, useEffect } from 'react';
import DataTable from './Table';
import ErrorBoundary from '../../ErrorBoundary/ErrorBoundary';
import HorizontalLoader from '../../components/HorizontalLoader/HorizontalLoader';
import { makeStyles } from '@material-ui/styles';
import { useHistory } from 'react-router-dom';
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
import { createTeamApi, getTeamsApi } from '../../apis/accessControl';
import { updateMainAlert } from 'redux/MainAlert/operations';
import DeleteIcon from '@material-ui/icons/Delete';
import Tooltip from '@material-ui/core/Tooltip';
import { getUserDetails } from 'redux/Join/actions';

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

const CreateTeam = ({ showCreateTeamDialog, setShowCreateTeamDialog, setIsLoading }) => {
  const dispatch = useDispatch();
  const [team, setTeam] = useState({ name: '', description: '' });
  const [errors, setErrors] = useState({
    name: '',
    description: '',
    showError: false,
    errorMessage: ''
  });

  const handleClose = () => {
    setShowCreateTeamDialog(false);
    setTeam({ name: '', description: '' });
    setErrors({ name: '', description: '' });
  };

  const handleChange = (name) => (event) => {
    setTeam({ ...team, [name]: event.target.value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleCreateTeam = () => {
    setIsLoading(true);
    setErrors({
      name: team.name ? '' : 'Team Name is required',
      description: team.description ? '' : 'Team Description is required'
    });

    if (team.name && team.description) {
      let teamData = {
        grp_title: team.name,
        grp_description: team.description
      };

      createTeamApi(teamData)
        .then((res) => {
          console.log('res', res);
          handleClose();
          setIsLoading(false);
          dispatch(
            updateMainAlert({
              severity: 'success',
              message: res.message,
              show: true
            })
          );
        })
        .catch((err) => {
          setErrors({
            showError: true,
            errorMessage: err.message
          });
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={showCreateTeamDialog}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
      aria-describedby="form-dialog-description">
      <DialogTitle id="form-dialog-title" style={{ textTransform: 'uppercase' }}>
        Create a New Team
      </DialogTitle>
      <DialogContent style={{ maxHeight: 'auto' }}>
        {errors.showError && (
          <Alert style={{ marginBottom: 10 }} severity="error">
            {errors.errorMessage}
          </Alert>
        )}
        <TextField
          fullWidth
          margin="dense"
          label="Team Name"
          variant="outlined"
          value={team.name}
          onChange={handleChange('name')}
          required
          error={!!errors.name}
          helperText={errors.name}
        />
        <TextField
          fullWidth
          margin="dense"
          label="Team Description"
          variant="outlined"
          value={team.description}
          onChange={handleChange('description')}
          required
          error={!!errors.description}
          helperText={errors.description}
        />
      </DialogContent>
      <DialogActions>
        <Grid container alignItems="flex-end" alignContent="flex-end" justify="flex-end">
          <Button variant="contained" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            onClick={handleCreateTeam}
            style={{ margin: '0 15px' }}>
            Create Team
          </Button>
        </Grid>
        <br />
      </DialogActions>
    </Dialog>
  );
};

const Teams = () => {
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateTeamDialog, setShowCreateTeamDialog] = useState(false);

  //   get currentUser from localStorage
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  const handleDelete = (id) => {
    console.log('Deleting team with id:', id);
  };

  useEffect(() => {
    setLoading(true);
    if (currentUser) {
      getUserDetails(currentUser._id)
        .then((res) => {
          setTeams(res.users[0].groups);
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);

  return (
    <ErrorBoundary>
      <HorizontalLoader loading={loading} />
      <div className={classes.root}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            marginBottom: 20
          }}>
          <Button variant="contained" color="primary" onClick={() => setShowCreateTeamDialog(true)}>
            Create a Team
          </Button>
        </div>
        <DataTable
          title="Teams"
          tableBodyHeight={{
            height: 'calc(100vh - 300px)'
          }}
          columns={[
            { id: 'grp_title', label: 'Team title', format: (value, row) => row.grp_title },
            {
              id: 'grp_status',
              label: 'Status',
              format: (value, row) => {
                return (
                  <span style={{ color: row.grp_status === 'ACTIVE' ? 'green' : 'red' }}>
                    {row.grp_status}
                  </span>
                );
              }
            },
            {
              id: 'numberOfGroupUsers',
              label: 'Members count',
              format: (value, row) => {
                return <span>{row.numberOfGroupUsers}</span>;
              }
            },
            {
              id: 'createdAt',
              label: 'Formed on',
              format: (value) =>
                new Date(value).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })
            },
            {
              id: 'actions',
              label: 'Actions',
              format: (value, row) => (
                <Tooltip title="Delete" placement="bottom" arrow>
                  <IconButton onClick={() => handleDelete(row._id)} disabled>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              )
            }
          ]}
          onRowClick={(row) => {
            history.push(`/teams/${row._id}`);
          }}
          rows={teams}
          loading={loading}
        />
        <CreateTeam
          showCreateTeamDialog={showCreateTeamDialog}
          setShowCreateTeamDialog={setShowCreateTeamDialog}
          setIsLoading={setLoading}
        />
      </div>
    </ErrorBoundary>
  );
};

export default Teams;
