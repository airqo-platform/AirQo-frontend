import { useEffect } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setCurrentAirQloudData } from '../../reduxStore/AirQlouds/operations';
import { LOCATIONS_TRACKING_URL } from '../../config/urls';

const UserCountry = ({ countries }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const getUserCountryFromStorage = () => {
      const storedCountry = localStorage.getItem('userCountry');
      if (storedCountry) {
        dispatch(setCurrentAirQloudData(storedCountry));
        return storedCountry;
      } else {
        getUserGeolocation();
      }
    };

    // Function to fetch users country based on their IP address
    const getUserCountry = async (latitude, longitude) => {
      try {
        const response = await axios.get(
          LOCATIONS_TRACKING_URL +
            `?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        const { countryName } = response.data;
        if (countries.some((country) => countryName === country.name)) {
          dispatch(setCurrentAirQloudData(countryName));
          localStorage.setItem('userCountry', countryName);
        } else {
          dispatch(setCurrentAirQloudData('Uganda'));
          localStorage.setItem('userCountry', 'Uganda');
        }
      } catch (error) {
        console.error('Error fetching user country:', error);
      }
    };

    // Function to get user's geolocation if available
    const getUserGeolocation = () => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const storedLatitude = parseFloat(localStorage.getItem('latitude'));
            const storedLongitude = parseFloat(localStorage.getItem('longitude'));
            if (
              !storedLatitude ||
              !storedLongitude ||
              distance(storedLatitude, storedLongitude, latitude, longitude) > 100
            ) {
              try {
                await getUserCountry(latitude, longitude);
                localStorage.setItem('latitude', latitude);
                localStorage.setItem('longitude', longitude);
              } catch (error) {
                console.error('Error fetching user country from geolocation:', error);
              }
            }
          },
          (error) => {
            console.error('Error getting user geolocation:', error);
          }
        );
      }
    };

    getUserCountryFromStorage();
  }, []);

  // Function to calculate distance between two sets of latitude and longitude
  const distance = (lat1, lon1, lat2, lon2) => {
    const p = 0.017453292519943295;
    const a =
      0.5 -
      Math.cos((lat2 - lat1) * p) / 2 +
      (Math.cos(lat1 * p) * Math.cos(lat2 * p) * (1 - Math.cos((lon2 - lon1) * p))) / 2;
    return 12742 * Math.asin(Math.sqrt(a));
  };

  return null;
};

export default UserCountry;
