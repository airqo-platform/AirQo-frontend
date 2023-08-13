import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setCurrentAirQloudData } from '../../../reduxStore/AirQlouds/operations';
import { getAllLocationsTrackingApi } from '../../../apis';

const LocationTracker = ({ countries }) => {
  const dispatch = useDispatch();
  const [storedCountry, setStoredCountry] = useState(localStorage.getItem('userCountry'));

  const updateUserCountry = useCallback(async () => {
    try {
      const { geolocation } = navigator;

      if (!geolocation) {
        console.error('Geolocation is not supported by this browser.');
        return;
      }

      const permissionResult = await new Promise((resolve) => {
        geolocation.getCurrentPosition(resolve, () => {
          console.error('Geolocation permission denied.');
        });
      });

      if (permissionResult) {
        const countryName = await getAllLocationsTrackingApi();

        const selectedCountry = countries.some((country) => countryName === country.name)
          ? countryName
          : 'Uganda';

        if (selectedCountry !== storedCountry) {
          dispatch(setCurrentAirQloudData(selectedCountry));
          setStoredCountry(selectedCountry);
          localStorage.setItem('userCountry', selectedCountry);
        }
      }
    } catch (error) {
      console.error('Error fetching user country:', error);
    }
  }, [countries, dispatch, storedCountry]);

  useEffect(() => {
    updateUserCountry();
  }, [updateUserCountry]);

  return null;
};

export default LocationTracker;
