import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setCurrentAirQloudData } from 'reduxStore/AirQlouds/operations';

const API_KEY = process.env.REACT_APP_OPENCAGE_API_KEY;
const DEFAULT_COUNTRY = 'Uganda';

const LocationTracker = ({ countries }) => {
  const [country, setCountry] = useState(localStorage.getItem('country') || DEFAULT_COUNTRY);
  const dispatch = useDispatch();

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
        throw new Error('Rate limit exceeded');
      }

      const countryName = response.data.results[0].components.country || DEFAULT_COUNTRY;
      const selectedCountry = countries.some((country) => countryName === country.name)
        ? countryName
        : DEFAULT_COUNTRY;

      setCountry(selectedCountry);
      sessionStorage.setItem('country', selectedCountry);
      localStorage.setItem('country', selectedCountry);
      dispatch(setCurrentAirQloudData(selectedCountry));
    } catch (error) {
      console.error('Error fetching user country:', error);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('country')) {
      if (navigator.geolocation && !sessionStorage.getItem('permissionDenied')) {
        navigator.geolocation.getCurrentPosition(
          (position) => updateUserCountry(position.coords.latitude, position.coords.longitude),
          (error) => {
            console.error('Error fetching user country:', error);
            sessionStorage.setItem('permissionDenied', true);
          }
        );
      }
    }
  }, []);

  useEffect(() => {
    dispatch(setCurrentAirQloudData(country));
  }, [country]);

  return null;
};

export default LocationTracker;
