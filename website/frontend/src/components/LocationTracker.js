import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCurrentAirQloudData } from '../../reduxStore/AirQlouds/operations';
import axios from 'axios';
const LOCATIONS_TRACKING_URL = process.env.REACT_APP_GEO_LOCATION_URL;

const LocationTracker = ({ countries }) => {
  const dispatch = useDispatch();
  const [storedCountry, setStoredCountry] = useState(localStorage.getItem('userCountry'));

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          await updateUserCountry(latitude, longitude);
        },
        (error) => {
          console.error('Error getting user geolocation:', error);
        }
      );
    }
  }, []);

  const updateUserCountry = async (latitude, longitude) => {
    try {
      const response = await axios.get(
        `${
          LOCATIONS_TRACKING_URL ? LOCATIONS_TRACKING_URL : ''
        }data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}}&localityLanguage=en`
      );
      const { countryName } = response.data;
      console.log('countryName', countryName);
      const selectedCountry = countries.some((country) => countryName === country.name)
        ? countryName
        : 'Uganda';

      if (selectedCountry !== storedCountry) {
        dispatch(setCurrentAirQloudData(selectedCountry));
        setStoredCountry(selectedCountry);
        localStorage.setItem('userCountry', selectedCountry);
      }
    } catch (error) {
      console.error('Error fetching user country:', error);
    }
  };
  return null;
};

export default LocationTracker;
