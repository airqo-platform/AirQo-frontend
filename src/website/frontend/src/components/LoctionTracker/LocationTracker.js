import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setCurrentAirQloudData } from 'reduxStore/AirQlouds';

const API_KEY = process.env.REACT_APP_OPENCAGE_API_KEY;
const DEFAULT_COUNTRY = 'Uganda';

const LocationTracker = ({ countries }) => {
  const [country, setCountry] = useState(() => localStorage.getItem('country') || DEFAULT_COUNTRY);
  const dispatch = useDispatch();

  // Function to update the user's country based on coordinates
  const updateUserCountry = async (latitude, longitude) => {
    if (!latitude || !longitude) {
      console.error('Latitude and longitude not provided');
      return;
    }

    try {
      const response = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${API_KEY}`
      );

      if (response.status !== 200) {
        console.error('Failed to fetch user country, rate limit exceeded');
        return;
      }

      const countryName = response.data?.results?.[0]?.components?.country || DEFAULT_COUNTRY;

      const isValidCountry = countries.some((country) => country.name === countryName);
      const selectedCountry = isValidCountry ? countryName : DEFAULT_COUNTRY;

      setCountry(selectedCountry);
      sessionStorage.setItem('country', selectedCountry);
      localStorage.setItem('country', selectedCountry);
      dispatch(setCurrentAirQloudData(selectedCountry));
    } catch (error) {
      console.error('Error fetching user country:', error);
    }
  };

  // Function to get user's current location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser');
      return;
    }

    if (sessionStorage.getItem('permissionDenied')) {
      console.warn('Location permission previously denied');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateUserCountry(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error('Error fetching user location:', error);
        sessionStorage.setItem('permissionDenied', true);
      }
    );
  };

  useEffect(() => {
    if (!localStorage.getItem('country')) {
      getUserLocation();
    } else {
      dispatch(setCurrentAirQloudData(country));
    }
  }, []);

  useEffect(() => {
    dispatch(setCurrentAirQloudData(country));
  }, [country, dispatch]);

  return null;
};

export default LocationTracker;
