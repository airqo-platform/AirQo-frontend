import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCurrentAirQloudData } from '../../reduxStore/AirQlouds/operations';
import { getUserCountryApi } from '../../apis';

const UserCountry = ({ countries }) => {
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
      const response = await getUserCountryApi(latitude, longitude);
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
  };

  return null;
};

export default UserCountry;
