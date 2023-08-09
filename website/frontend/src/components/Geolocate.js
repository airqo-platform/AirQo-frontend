import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setCurrentAirQloudData } from '../../reduxStore/AirQlouds/operations';
import { getUserCountryApi } from '../../apis';

const Geolocate = ({ countries }) => {
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

  const updateUserCountry = useCallback(
    async (latitude, longitude) => {
      try {
        const response = await getUserCountryApi(latitude, longitude);
        console.log('response', response);
        const { countryName } = response;
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
    },
    [countries, dispatch, storedCountry]
  );

  return null;
};

export default React.memo(Geolocate);
