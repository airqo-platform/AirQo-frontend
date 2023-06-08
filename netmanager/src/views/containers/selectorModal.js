import React, { useRef, useState, useEffect } from 'react';
import ReloadIcon from '@material-ui/icons/Replay';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { Tooltip, Modal, Backdrop, Fade, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, InputAdornment } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useDispatch } from 'react-redux';
import { setCurrentAirQloudData } from 'redux/AirQloud/operations';
import { resetDefaultGraphData } from 'redux/Dashboard/operations';
import { refreshAirQloud } from 'redux/AirQloud/operations';
import { fetchDashboardAirQloudsData } from '../../redux/AirQloud/operations';
import { useCurrentAirQloudData } from 'redux/AirQloud/selectors';
import { useDashboardAirqloudsData } from '../../redux/AirQloud/selectors';
import 'assets/css/modal.css';
import { isEmpty } from 'underscore';

const useStyles = makeStyles((theme) => ({
  modalSelector: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    overflowY: 'auto',
  },
  dropdown: {
    cursor: 'pointer',
    '& .MuiInputBase-input': {
      color: '#0560c9',
      fontSize: '1rem',
      fontWeight: 'bold',
    },
  },
  dropdownIcon: {
    color: theme.palette.text.secondary,
  },
}));

const SelectorModal = () => {
  const ref = useRef();
  const [openModal, setOpenModal] = useState(false);
  const currentAirqQloud = useCurrentAirQloudData();
  const dispatch = useDispatch();
  const classes = useStyles();

  const airqlouds = Object.values(useDashboardAirqloudsData());

  airqlouds.sort((a, b) => {
    if (a.long_name < b.long_name) return -1;
    if (a.long_name > b.long_name) return 1;
    return 0;
  });

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleAirQloudChange = (airqloud) => async () => {
    handleCloseModal();
    await dispatch(setCurrentAirQloudData(airqloud));
    dispatch(resetDefaultGraphData());
  };

  const handleAirQloudRefresh = (airQloud) => async () => {
    const data = await dispatch(refreshAirQloud(airQloud.long_name, airQloud._id));
    if (data && data.refreshed_airqloud) setCurrentAirQloudData(data.refreshed_airqloud);
  };

  useEffect(() => {
    const checkIfClickedOutside = (e) => {
      if (
        openModal &&
        ref.current &&
        !ref.current.contains(e.target) &&
        !e.target.classList.contains('MuiDialog-container') &&
        !e.target.classList.contains('MuiDialogContent-root') &&
        !e.target.classList.contains(classes.modalSelector)
      ) {
        setOpenModal(false);
      }
    };

    document.addEventListener('mousedown', checkIfClickedOutside);

    return () => {
      // Cleanup the event listener
      document.removeEventListener('mousedown', checkIfClickedOutside);
    };
  }, [openModal]);

  useEffect(() => {
    if (isEmpty(airqlouds)) {
      dispatch(fetchDashboardAirQloudsData());
    }
  }, []);

  return (
    <>
      <TextField
      variant="outlined"
      className={`${classes.dropdown} dropdown`}
      onClick={handleOpenModal}
      value={currentAirqQloud.long_name}
      InputProps={{
        readOnly: true,
        className: classes.dropdown,
        endAdornment: (
          <InputAdornment position="end">
            <Button className="dropdown-icon" onClick={handleOpenModal}>
              <ArrowDropDownIcon className={classes.dropdownIcon} />
            </Button>
          </InputAdornment>
        ),
      }}
    />

      <Dialog className="dialog-container" open={openModal} onClose={handleCloseModal} aria-labelledby="selector-modal-title" maxWidth="lg">
        <DialogTitle  className="selector-modal-title">
        <div className="dialog-title">
          <span id="long">{currentAirqQloud.long_name} AirQloud{'   '}</span>
          <span>{currentAirqQloud.sites && currentAirqQloud.sites.length} sites</span>
        </div>
        </DialogTitle>
        <hr/>
        <DialogContent>
          <div className="dialog-content">
            <ul >
              {airqlouds.map(
                (airqloud, key) =>
                  currentAirqQloud._id !== airqloud._id && (
                    <li
                      key={key}
                      className="modal-site-item"
                      onClick={handleAirQloudChange(airqloud)}
                    >
                      <span id="long_name">{airqloud.long_name}</span>{'  '}
                      <span id="sites">{airqloud.sites.length} sites</span>
                    </li>
                  )
              )}
            </ul>
          </div>
        </DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={handleCloseModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Tooltip title="Refresh AirQloud" className={`dd-reload ${classes.dropdown}`} >
        <div onClick={handleAirQloudRefresh(currentAirqQloud)}>
          <ReloadIcon className={classes.reloadIcon} />
        </div>
      </Tooltip>
    </>
  );
};

export default SelectorModal;