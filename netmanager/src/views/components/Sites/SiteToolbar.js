import React, { useState, useEffect } from 'react';
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
  TextField,
  CircularProgress
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { createSiteApi, createSiteMetaDataApi } from 'views/apis/deviceRegistry';
import { loadSitesData } from 'redux/SiteRegistry/operations';
import { updateMainAlert } from 'redux/MainAlert/operations';
import { createAlertBarExtraContentFromObject } from 'utils/objectManipulators';
import { isEmpty } from 'underscore';
import HorizontalLoader from 'views/components/HorizontalLoader/HorizontalLoader';
import IconButton from '@material-ui/core/IconButton';
import LocationOnIcon from '@material-ui/icons/LocationOn';

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
  disabled: {
    cursor: 'not-allowed',
    opacity: 0.5
  },
  modelWidth: {
    minWidth: 450,
    [theme.breakpoints.down('sm')]: {
      minWidth: '100%'
    }
  },
  confirm_con: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'left'
  },
  confirm_field: {
    margin: theme.spacing(1, 0),
    fontSize: '14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  confirm_field_title: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#000000',
    marginRight: theme.spacing(2)
  }
}));

const FormDialog = ({
  open,
  modelClose,
  handleClose,
  loading,
  handleConfirmation,
  title,
  children,
  CTA1,
  CTA2,
  showError,
  errorMessage,
  disabled
}) => {
  return (
    <Dialog
      id="site-dialog"
      open={open}
      onBackdropClick={modelClose}
      aria-labelledby="form-dialog-title"
      aria-describedby="form-dialog-description">
      <DialogTitle id="form-dialog-title" style={{ textTransform: 'uppercase' }}>
        {title}
      </DialogTitle>
      <DialogContent>
        {showError &&
          errorMessage.map((error) => (
            <Alert style={{ marginBottom: 10 }} severity="error">
              {errorMessage}
            </Alert>
          ))}
        <div>{children}</div>
      </DialogContent>
      <DialogActions>
        <Grid container alignItems="flex-end" alignContent="flex-end" justify="flex-end">
          {handleClose && (
            <Button variant="contained" type="button" onClick={handleClose} disabled={disabled}>
              {CTA1}
            </Button>
          )}
          {handleConfirmation && (
            <Button
              disabled={disabled}
              variant="contained"
              color="primary"
              type="submit"
              onClick={handleConfirmation}
              style={{ margin: '0 15px' }}>
              {loading ? <CircularProgress size={24} style={{ color: '#FFCC00' }} /> : CTA2}
            </Button>
          )}
        </Grid>
        <br />
      </DialogActions>
    </Dialog>
  );
};

const SiteToolbar = (props) => {
  const { className, setRefresh, ...rest } = props;

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
  const [confirm, setConfirm] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [siteData, setSiteData] = useState(initSiteData);
  const [siteMetaData, setSiteMetaData] = useState([]);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState(initErrorData);
  const [Fields, setFields] = useState(['Country', 'District', 'Region', 'Latitude', 'Longitude']);
  const [isLoading, setIsLoading] = useState(false);
  const userNetworks = JSON.parse(localStorage.getItem('userNetworks')) || [];
  const mapview = process.env.REACT_APP_MAP_PREVIEW;

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

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setShowError(false);
        setErrorMessage('');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleSiteSubmit = async (e) => {
    setIsLoading(true);
    setOpen(false);
    setDisabled(true);

    if (isEmpty(userNetworks)) return;

    const userNetworksNames = userNetworks.map((network) => network.net_name);

    if (!userNetworksNames.includes(siteData.network)) {
      dispatch(
        updateMainAlert({
          message: `You are not a member of the ${siteData.network} organisation. Only members of the org can add devices to it. Contact support if you think this is a mistake.`,
          show: true,
          severity: 'error'
        })
      );
      resetForm();
      return;
    }

    try {
      const resData = await createSiteApi(siteData);
      const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork'));

      if (!isEmpty(activeNetwork)) {
        dispatch(loadSitesData(activeNetwork.net_name));
      }

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

      setRefresh();
    } catch (error) {
      const errors = error.response?.data?.errors;
      setErrors(errors || initErrorData);

      dispatch(
        updateMainAlert({
          message: error.response?.data?.message,
          show: true,
          severity: 'error',
          extra: createAlertBarExtraContentFromObject(errors || {})
        })
      );
    }

    resetForm();
  };

  const resetForm = () => {
    setDisabled(false);
    setConfirm(false);
    setOpen(false);
    setIsLoading(false);
    setSiteData(initSiteData);
    setErrors(initErrorData);
  };

  const handleConfirmation = async () => {
    const { name, latitude, longitude } = siteData;

    if (!name || !latitude || !longitude) {
      setErrorMessage(['Please fill all the fields']);
      setShowError(true);
      return;
    }

    setLoading(true);

    try {
      const resData = await createSiteMetaDataApi({ latitude, longitude });

      if (resData.success) {
        setSiteMetaData(resData.metadata);
        setConfirm(true);
        setOpen(false);
      }
    } catch (error) {
      setErrorMessage(
        Array.isArray(error.response.data.errors.message)
          ? error.response.data.errors.message
          : [error.response.data.errors.message]
      );
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const openMap = (siteMetaData) => {
    window.open(
      `${mapview}/?mlat=${siteMetaData.latitude}&mlon=${siteMetaData.longitude}&zoom=8`,
      '_blank'
    );
  };

  const handleClose = () => {
    setConfirm(false);
    setOpen(true);
  };

  const handleModelClose = () => {
    setConfirm(false);
    setOpen(false);
  };

  return (
    <>
      <div {...rest} className={clsx(classes.root, className)}>
        <HorizontalLoader
          color="#FFCC00"
          loading={isLoading}
          initial={0}
          target={100}
          duration={1500}
        />
        <div className={classes.row}>
          <span className={classes.spacer} />
          <Button
            variant="contained"
            color="primary"
            type="submit"
            align="centre"
            onClick={() => setOpen(!open)}>
            Add Site
          </Button>
        </div>
      </div>
      <>
        <FormDialog
          open={open}
          modelClose={handleModelClose}
          handleClose={handleSiteClose}
          handleConfirmation={handleConfirmation}
          loading={loading}
          title="Add Site"
          CTA1="Cancel"
          CTA2="Create site"
          showError={showError}
          errorMessage={errorMessage}>
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
        </FormDialog>
        <FormDialog
          open={confirm}
          handleClose={handleClose}
          modelClose={handleModelClose}
          handleConfirmation={handleSiteSubmit}
          disabled={disabled}
          title="Site Confirmation"
          CTA1="Edit"
          CTA2="Confirm">
          <form className={classes.modelWidth}>
            <div className={classes.confirm_con}>
              <IconButton
                style={{ position: 'absolute', right: 0, top: 0, margin: '10px' }}
                onClick={() => {
                  openMap(siteMetaData);
                }}>
                <LocationOnIcon />
              </IconButton>

              {Fields.map((field) => (
                <div className={classes.confirm_field} key={field}>
                  <span className={classes.confirm_field_title}>{field}:</span>
                  <span
                    style={{
                      color: field === 'Latitude' || field === 'Longitude' ? 'green' : 'black'
                    }}>
                    {siteMetaData[field.toLowerCase()]}
                  </span>
                </div>
              ))}
            </div>
          </form>
        </FormDialog>
      </>
    </>
  );
};

SiteToolbar.propTypes = {
  className: PropTypes.string
};

export default SiteToolbar;
