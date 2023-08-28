import React, { useState, useEffect, useCallback } from 'react';
import { getAllLocationsTrackingApi } from '../../../apis';

const LocationTracker = ({ countries }) => {
  const [storedCountry, setStoredCountry] = useState(localStorage.getItem('userCountry'));

  // function to update the users country
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
        // const countryName = 'Uganda';

        const selectedCountry = countries.some((country) => countryName === country.name)
          ? countryName
          : 'Uganda';

        if (selectedCountry !== storedCountry) {
          setStoredCountry(selectedCountry);
          localStorage.setItem('userCountry', selectedCountry);
        }
        return selectedCountry;
      }
    } catch (error) {
      console.error('Error fetching user country:', error);
    }
  }, [countries, storedCountry]);

  useEffect(() => {
    updateUserCountry();
  }, [updateUserCountry]);

  return storedCountry;
};

export default LocationTracker;
