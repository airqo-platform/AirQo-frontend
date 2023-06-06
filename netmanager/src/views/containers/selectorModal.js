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
import { isEmpty } from 'underscore';

const useStyles = makeStyles((theme) => ({
  modalSelector: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    maxHeight: 400,
    overflowY: 'auto',
  },
  dropdown: {
    cursor: 'pointer',
  },
  dropdownIcon: {
    color: theme.palette.text.secondary,
  },
  modalSiteItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1, 2),
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
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

      <Dialog open={openModal} onClose={handleCloseModal} aria-labelledby="selector-modal-title">
        <DialogTitle id="selector-modal-title">
          {currentAirqQloud.long_name} AirQloud
          <span>{currentAirqQloud.sites && currentAirqQloud.sites.length} sites</span>
        </DialogTitle>
        <DialogContent>
          <div className={classes.modalSelector}>
            <ul>
              {airqlouds.map(
                (airqloud, key) =>
                  currentAirqQloud._id !== airqloud._id && (
                    <li
                      key={key}
                      className={classes.modalSiteItem}
                      onClick={handleAirQloudChange(airqloud)}
                    >
                      <span>{airqloud.long_name}</span>
                      <span>{airqloud.sites.length} sites</span>
                    </li>
                  )
              )}
            </ul>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Tooltip title="Refresh AirQloud">
        <div className="dd-reload" onClick={handleAirQloudRefresh(currentAirqQloud)}>
          <ReloadIcon />
        </div>
      </Tooltip>
    </>
  );
};

export default SelectorModal;
