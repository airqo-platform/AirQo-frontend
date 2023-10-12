import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Box } from '@mui/material';
import CancelIcon from 'icons/footer/cancel.svg';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  maxWidth: 600,
  width: '90%',
  bgcolor: 'background.paper',
  outline: 'none'
};

const LocationTracker = ({ countries, setTrackedCountry }) => {
  const [country, setCountry] = useState(localStorage.getItem('country') || 'Uganda');
  const [open, setOpen] = useState(false);
  const API_KEY = process.env.REACT_APP_OPENCAGE_API_KEY || 'TestAPIKey';

  // function to update the users country
  const updateUserCountry = async (latitude, longitude) => {
    try {
      if (latitude && longitude) {
        const response = await axios.get(
          `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${API_KEY}`
        );
        if (response.status !== 200) {
          throw new Error('Rate limit exceeded');
        }
        const countryName = response.data.results[0].components.country || 'Uganda';

        const selectedCountry = countries.some((country) => countryName === country.name)
          ? countryName
          : 'Uganda';

        setCountry(selectedCountry);
        sessionStorage.setItem('country', selectedCountry);
        localStorage.setItem('country', selectedCountry);
        setTrackedCountry(selectedCountry);
      } else {
        console.log('Latitude and longitude not provided');
      }
    } catch (error) {
      console.error('Error fetching user country:', error);
    }
  };

  const handleClose = (userConsent) => {
    setOpen(false);

    if (userConsent && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        updateUserCountry(position.coords.latitude, position.coords.longitude);
      });
    } else {
      console.log('User did not give consent to use their location.');
      sessionStorage.setItem('permissionDenied', true);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('country') && !sessionStorage.getItem('permissionDenied')) {
      const timer = setTimeout(() => {
        setOpen(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    setTrackedCountry(country);
  }, [country]);

  return (
    <>
      <Modal open={open}>
        <Box sx={style}>
          <div className="Permission-modal">
            <div className="modal-title">
              <span>Location Access Request</span>
              <CancelIcon className="modal-cancel" onClick={() => handleClose(false)} />
            </div>
            <div className="divider" />
            <p>
              To provide you with the best user experience, we would like to access your location
              data. This will allow us to determine your country and tailor our services to your
              needs. Your privacy is important to us, and your data will be used strictly for this
              purpose. Do you grant us permission to access your location?
            </p>
            <div className="divider" />
            <div className="btns">
              <div
                className="cancel-btn"
                onClick={() => {
                  sessionStorage.setItem('permissionDenied', true);
                  handleClose(false);
                }}>
                No
              </div>
              <div className="save-btn" onClick={() => handleClose(true)}>
                Yes
              </div>
            </div>
          </div>
        </Box>
      </Modal>
    </>
  );
};

export default LocationTracker;
