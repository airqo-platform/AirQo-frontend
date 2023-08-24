/* eslint-disable */
import React, { useState } from 'react';
import {
  Button,
  TextField,
  DialogTitle,
  DialogContent,
  Dialog,
  DialogActions,
  Box
} from '@material-ui/core';
import { assignDevicesToCohort, createCohortApi } from 'views/apis/deviceRegistry';
import { updateMainAlert } from 'redux/MainAlert/operations';
import Select from 'react-select';
import { useDispatch } from 'react-redux';

const AddCohortToolbar = ({ open, handleClose, deviceOptions, isCohort }) => {
  const dispatch = useDispatch();
  const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork') || {});
  const [selectedDevices, setSelectedDevices] = useState([]);
  const initialState = {
    name: '',
    network: activeNetwork.net_name,
    devices: ''
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

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const cohortData = {
      name: form.name,
      network: form.network
    };

    await createCohortApi(cohortData)
      .then((res) => {
        assignDevicesToCohort(
          res.cohort._id,
          selectedDevices.map((device) => device.value)
        )
          .then((res) => {
            // dispatch(setActiveCohort(res.updated_cohort[0]));
            dispatch(
              updateMainAlert({
                show: true,
                message: res.message,
                severity: 'success'
              })
            );
            clearState();
            setSelectedDevices([]);
            handleClose();
            setLoading(false);
          })
          .catch((error) => {
            dispatch(
              updateMainAlert({
                show: true,
                message: error.response && error.response.data && error.response.data.message,
                severity: 'error'
              })
            );
            setLoading(false);
          });
      })
      .catch((error) => {
        dispatch(
          updateMainAlert({
            show: true,
            message: error.response && error.response.data && error.response.data.message,
            severity: 'error'
          })
        );
      });
  };
  return (
    <Dialog
      open={open && isCohort}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
      maxWidth="sm"
      scroll="paper"
    >
      <DialogTitle id="form-dialog-title">Add New Cohort</DialogTitle>
      <DialogContent dividers={'paper'}>
        <TextField
          margin="dense"
          variant="outlined"
          id="name"
          name="name"
          label="Cohort name"
          type="text"
          onChange={onChange}
          value={form.name}
          fullWidth
          style={{
            marginBottom: '20px'
          }}
          autoFocus
        />
        <TextField
          margin="dense"
          variant="outlined"
          id="network"
          label="Network"
          name="network"
          type="text"
          onChange={onChange}
          value={form.network}
          fullWidth
          disabled
          style={{
            marginBottom: '20px'
          }}
        />
        <Select
          fullWidth
          name="devices"
          placeholder="Select Devices(s)"
          value={selectedDevices}
          options={deviceOptions}
          onChange={(options) => setSelectedDevices(options)}
          isMulti
          variant="outlined"
          margin="dense"
          required
          style={{
            marginBottom: '20px'
          }}
          autoFocus
        />
        <Box height="70px" />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="primary" variant="outlined">
          Cancel
        </Button>
        <Button onClick={onSubmit} color="primary" variant="contained" disabled={loading}>
          {loading ? 'Loading...' : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCohortToolbar;
