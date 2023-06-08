import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField
} from '@material-ui/core';
import { createSiteApi } from 'views/apis/deviceRegistry';
import { loadSitesData } from 'redux/SiteRegistry/operations';
import { updateMainAlert } from 'redux/MainAlert/operations';
import { createAlertBarExtraContentFromObject } from 'utils/objectManipulators';
import { isEmpty } from 'underscore';

const useStyles = makeStyles((theme) => ({
  root: {},
  row: {
    height: '42px',
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(1)
  },
  spacer: {
    flexGrow: 1
  },
  importButton: {
    marginRight: theme.spacing(1)
  },
  exportButton: {
    marginRight: theme.spacing(1)
  },
  searchInput: {
    marginRight: theme.spacing(1)
  },
  link: {
    color: '#3344FF',
    marginRight: theme.spacing(1),
    fontWeight: 'bold'
  },
  // for cursor not allowed
  disabled: {
    cursor: 'not-allowed',
    opacity: 0.5
  }
}));

const SiteToolbar = (props) => {
  const { className, ...rest } = props;

  const classes = useStyles();

  const dispatch = useDispatch();

  const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork')).net_name;

  const initSiteData = {
    latitude: '',
    longitude: '',
    name: '',
    network: activeNetwork
  };

  const initErrorData = {
    latitude: '',
    longitude: '',
    name: '',
    network: ''
  };

  const [open, setOpen] = useState(false);
  const [siteData, setSiteData] = useState(initSiteData);
  const [errors, setErrors] = useState(initErrorData);

  const userNetworks = JSON.parse(localStorage.getItem('userNetworks')) || [];

  const handleSiteClose = () => {
    setOpen(false);
    setSiteData(initSiteData);
    setErrors(initErrorData);
  };

  const handleSiteDataChange = (key) => (event) => {
    if (key === 'phoneNumber') {
      let re = /\s*|\d+(\.d+)?/;
      if (!re.test(event.target.value)) {
        return;
      }
    }
    return setSiteData({ ...siteData, [key]: event.target.value });
  };

  const handleSiteSubmit = (e) => {
    setOpen(false);
    if (!isEmpty(userNetworks)) {
      const userNetworksNames = userNetworks.map((network) => network.net_name);

      if (!userNetworksNames.includes(siteData.network)) {
        dispatch(
          updateMainAlert({
            message: `You are not a member of the ${siteData.network} organisation. Only members of the org can add devices to it. Contact support if you think this is a mistake.`,
            show: true,
            severity: 'error'
          })
        );

        // clear the form
        setSiteData(initSiteData);
        setErrors(initErrorData);
        return;
      } else {
        createSiteApi(siteData)
          .then((resData) => {
            const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork'));
            if (!isEmpty(activeNetwork)) {
              dispatch(loadSitesData(activeNetwork.net_name));
            }
            handleSiteClose();
            dispatch(
              updateMainAlert({
                message: `${resData.message}. ${
                  siteData.network !== activeNetwork.net_name
                    ? `Switch to the ${siteData.network} organisation to see the new device.`
                    : ''
                }`,
                show: true,
                severity: 'success'
              })
            );
          })
          .catch((error) => {
            const errors = error.response && error.response.data && error.response.data.errors;
            setErrors(errors || initErrorData);
            dispatch(
              updateMainAlert({
                message: error.response && error.response.data && error.response.data.message,
                show: true,
                severity: 'error',
                extra: createAlertBarExtraContentFromObject(errors || {})
              })
            );
          });
      }
    }
  };

  return (
    <>
      <div {...rest} className={clsx(classes.root, className)}>
        <div className={classes.row}>
          <span className={classes.spacer} />
          <Button
            variant="contained"
            color="primary"
            type="submit"
            align="centre"
            onClick={() => setOpen(!open)}>
            {' '}
            Add Site
          </Button>
        </div>
      </div>
      <Dialog
        open={open}
        onClose={handleSiteClose}
        aria-labelledby="form-dialog-title"
        aria-describedby="form-dialog-description">
        <DialogTitle id="form-dialog-title" style={{ textTransform: 'uppercase' }}>
          Add a site
        </DialogTitle>

        <DialogContent>
          <form className={classes.modelWidth}>
            <TextField
              autoFocus
              margin="dense"
              label="Site Name"
              variant="outlined"
              value={siteData.name}
              onChange={handleSiteDataChange('name')}
              fullWidth
              required
              error={!!errors.name}
              helperText={errors.name}
            />
            <TextField
              autoFocus
              margin="dense"
              label="Latitude"
              variant="outlined"
              value={siteData.latitude}
              onChange={handleSiteDataChange('latitude')}
              error={!!errors.latitude}
              helperText={errors.latitude}
              fullWidth
              required
            />
            <TextField
              autoFocus
              margin="dense"
              label="Longitude"
              variant="outlined"
              value={siteData.longitude}
              onChange={handleSiteDataChange('longitude')}
              error={!!errors.longitude}
              helperText={errors.longitude}
              fullWidth
              required
            />
            <TextField
              fullWidth
              margin="dense"
              label="Network"
              value={siteData.network}
              defaultChecked={siteData.network}
              variant="outlined"
              error={!!errors.network}
              helperText={errors.network}
              InputProps={{
                classes: {
                  disabled: useStyles().disabled
                }
              }}
              disabled
            />
          </form>
        </DialogContent>

        <DialogActions>
          <Grid container alignItems="flex-end" alignContent="flex-end" justify="flex-end">
            <Button variant="contained" type="button" onClick={handleSiteClose}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              onClick={handleSiteSubmit}
              style={{ margin: '0 15px' }}>
              Create Site
            </Button>
          </Grid>
          <br />
        </DialogActions>
      </Dialog>
    </>
  );
};

SiteToolbar.propTypes = {
  className: PropTypes.string
};

export default SiteToolbar;
