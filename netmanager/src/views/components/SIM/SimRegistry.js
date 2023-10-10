import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid
} from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { isEmpty } from 'underscore';
import Alert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/styles';
import CustomMaterialTable from '../Table/CustomMaterialTable';
import HorizontalLoader from 'views/components/HorizontalLoader/HorizontalLoader';
import { updateMainAlert } from 'redux/MainAlert/operations';
import Select from 'react-select';
import RemoveIcon from '@material-ui/icons/Remove';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import Tooltip from '@material-ui/core/Tooltip';
import DataTable from './Table';
import CloseIcon from '@material-ui/icons/Close';
import { getSimsApi, createSimApi } from '../../apis/accessControl';
import DeleteIcon from '@material-ui/icons/Delete';

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

const RegisterSim = ({ setCreateSimDialog, CreateSimDialog, setIsLoading, setRefresh }) => {
  const classes = useStyles();

  const [sim, setSim] = useState({
    msisdn: ''
  });

  const [errors, setErrors] = useState({
    msisdn: '',
    showError: false,
    errorMessage: ''
  });

  const handleClose = () => {
    setCreateSimDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setSim({
      msisdn: ''
    });

    setErrors({
      msisdn: '',
      showError: false,
      errorMessage: ''
    });
  };

  const handleChange = (name) => (event) => {
    setSim({ ...sim, [name]: event.target.value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleRegisterSim = () => {
    if (!sim.msisdn) {
      setErrors({
        msisdn: 'MSISDN is required',
        showError: true,
        errorMessage: 'MSISDN is required'
      });
    } else {
      setIsLoading(true);
      createSimApi(sim)
        .then((res) => {
          setIsLoading(false);
          if (res.success) {
            setCreateSimDialog(false);
            resetForm();
            setRefresh(true);
          } else {
            setErrors({
              msisdn: res.data.message,
              showError: true,
              errorMessage: res.data.message
            });
          }
        })
        .catch((err) => {
          setIsLoading(false);
          setErrors({
            msisdn: err.message,
            showError: true,
            errorMessage: err.message
          });
        });
    }
  };

  return (
    <Dialog
      open={CreateSimDialog}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
      aria-describedby="form-dialog-description"
      className={classes.modelWidth}>
      <DialogTitle id="form-dialog-title" style={{ textTransform: 'uppercase' }}>
        Register New SIM
      </DialogTitle>
      <DialogContent style={{ maxHeight: 'auto' }}>
        {errors.showError && (
          <Alert
            style={{ marginBottom: 10 }}
            severity="error"
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  setErrors({ ...errors, showError: false });
                }}>
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }>
            {errors.errorMessage}
          </Alert>
        )}

        <TextField
          fullWidth
          margin="dense"
          label="MSISDN"
          variant="outlined"
          value={sim.msisdn}
          onChange={handleChange('msisdn')}
          required
          error={!!errors.msisdn}
          helperText={errors.msisdn}
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
            onClick={handleRegisterSim}
            style={{ margin: '0 15px' }}>
            Register SIM
          </Button>
        </Grid>
        <br />
      </DialogActions>
    </Dialog>
  );
};

const SimRegistry = () => {
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [CreateSimDialog, setCreateSimDialog] = useState(false);
  const [simData, setSimData] = useState([]);

  useEffect(() => {
    setLoading(true);
    getSimsApi()
      .then((res) => {
        setLoading(false);
        if (res.success) {
          setSimData(res.sims);
        } else {
          dispatch(updateMainAlert({ message: res.message, show: true, severity: 'error' }));
        }
      })
      .catch((err) => {
        setLoading(false);
        dispatch(updateMainAlert({ message: err.message, show: true, severity: 'error' }));
      });
  }, [refresh]);

  const handleDelete = (id) => {};

  return (
    <>
      <HorizontalLoader loading={isLoading} />
      <div className={classes.root}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            marginBottom: 20
          }}>
          <Button variant="contained" color="primary" onClick={() => setCreateSimDialog(true)}>
            Register SIM
          </Button>
        </div>

        <DataTable
          title="SIM Registry"
          tableBodyHeight={{ height: 'calc(100vh - 300px)' }}
          columns={[
            {
              id: 'name',
              label: 'Name',
              format: (value, row) => (row.name ? row.name : '')
            },
            {
              id: 'status',
              label: 'Status',
              format: (value, row) => (row.status ? row.status : '')
            },
            {
              id: 'plan',
              label: 'Plan',
              format: (value, row) => (row.plan ? row.plan : '')
            },
            {
              id: 'msisdn',
              label: 'MSISDN',
              format: (value, row) => (row.msisdn ? row.msisdn : '')
            },
            {
              id: 'activationDate',
              label: 'Activation Date',
              format: (value, row) => (row.activationDate ? row.activationDate : '')
            },
            {
              id: 'dataBalanceThreshold',
              label: 'Data Balance Threshold',
              format: (value, row) => (row.dataBalanceThreshold ? row.dataBalanceThreshold : '')
            },
            {
              id: 'action',
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
            return;
          }}
          rows={simData}
          loading={loading}
        />

        <RegisterSim
          setCreateSimDialog={setCreateSimDialog}
          CreateSimDialog={CreateSimDialog}
          setIsLoading={setIsLoading}
          setRefresh={setRefresh}
        />
      </div>
    </>
  );
};

export default SimRegistry;
