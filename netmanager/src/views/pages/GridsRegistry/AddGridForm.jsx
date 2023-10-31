/* eslint-disable */
import React, { useState } from 'react';
import {
  Button,
  TextField,
  DialogTitle,
  DialogContent,
  Dialog,
  DialogActions,
  Grid,
  Box
} from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import PolygonMap from './PolygonMap';
import { createGridApi } from 'views/apis/deviceRegistry';
import Alert from '@material-ui/lab/Alert';
import { setActiveGrid } from 'redux/Analytics/operations';
import { refreshGridApi } from '../../apis/deviceRegistry';
import { fetchAllGrids } from '../../../redux/Analytics/operations';

const AddGridToolbar = ({ open, handleClose }) => {
  const dispatch = useDispatch();
  const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork') || {});
  const polygon = useSelector((state) => state.analytics.polygonShape);
  const initialState = {
    name: '',
    network: activeNetwork.net_name,
    admin_level: ''
  };
  const [form, setState] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
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
    const gridData = {
      name: form.name,
      admin_level: form.admin_level,
      shape: polygon
    };

    await createGridApi(gridData)
      .then((res) => {
        setErrorMessage({
          message: 'Refreshing grid to create sites. Please wait...',
          severity: 'info'
        });
        refreshGridApi(res.grid._id)
          .then(() => {
            setErrorMessage({
              message: res.message,
              severity: 'success'
            });
            const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork') || {});
            dispatch(fetchAllGrids(activeNetwork.net_name));
            setTimeout(() => {
              setErrorMessage(null);
              clearState();
              handleClose();
              setLoading(false);
            }, 3000);
          })
          .catch((error) => {
            setErrorMessage({
              message: error.response.data.errors.message,
              severity: 'error'
            });
            setTimeout(() => {
              setErrorMessage(null);
            }, 5000);
            setLoading(false);
          });
      })
      .catch((error) => {
        setErrorMessage({
          message: error.response.data.errors.message,
          severity: 'error'
        });
        setTimeout(() => {
          setErrorMessage(null);
        }, 5000);
        setLoading(false);
      });
  };
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
      fullWidth
      maxWidth="lg"
      scroll="paper"
    >
      <DialogTitle id="form-dialog-title" data-testid="add-grid-form-title">
        Add New Grid
      </DialogTitle>
      <DialogContent dividers={true}>
        {errorMessage && (
          <Box paddingBottom={'12px'}>
            <Alert severity={errorMessage.severity}>{errorMessage.message}</Alert>
          </Box>
        )}
        <Grid container spacing={4}>
          <Grid item lg={6} xl={6} md={12} sm={12} xs={12}>
            <TextField
              margin="dense"
              variant="outlined"
              id="name"
              name="name"
              label="Grid name"
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
              id="admin_level"
              name="admin_level"
              label="Administrative level"
              type="text"
              onChange={onChange}
              value={form.admin_level}
              fullWidth
              style={{
                marginBottom: '20px'
              }}
              autoFocus
              helperText="eg province, state, village, county, etc"
            />

            <TextField
              margin="dense"
              variant="outlined"
              id="polygon_shape"
              name="polygon_shape"
              label="Shapefile"
              type="text"
              value={JSON.stringify(polygon)}
              fullWidth
              style={{
                marginBottom: '20px'
              }}
              disabled
              helperText="Select polygon icon on map to generate a polygon"
            />
          </Grid>

          <Grid item lg={6} xl={6} md={12} sm={12} xs={12}>
            <PolygonMap />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={() => {
            setErrorMessage(null);
            clearState();
            setLoading(false);
            handleClose();
          }}
          color="primary"
          variant="outlined"
        >
          Cancel
        </Button>
        <Button onClick={onSubmit} color="primary" variant="contained" disabled={loading}>
          {loading ? 'Loading...' : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddGridToolbar;
