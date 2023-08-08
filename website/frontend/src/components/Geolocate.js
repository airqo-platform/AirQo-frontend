import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCurrentAirQloudData } from '../../reduxStore/AirQlouds/operations';
import { getUserCountryApi } from '../../apis/index';

const UserCountry = ({ countries }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const storedCountry = localStorage.getItem('userCountry');
    if (storedCountry) {
      setStoredCountry(storedCountry);
    } else {
      getUserGeolocation();
    }
  }, []);

  const setStoredCountry = (countryName) => {
    dispatch(setCurrentAirQloudData(countryName));
  };

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
            await getUserCountry(latitude, longitude);
            localStorage.setItem('latitude', latitude);
            localStorage.setItem('longitude', longitude);
          }
        },
        (error) => {
          console.error('Error getting user geolocation:', error);
        }
      );
    }
  };

  const getUserCountry = async (latitude, longitude) => {
    try {
      const response = await getUserCountryApi(latitude, longitude);
      console.log('response', response);
      const { countryName } = response.data;
      const countryExists = countries.some((country) => countryName === country.name);
      const selectedCountry = countryExists ? countryName : 'Uganda';
      setStoredCountry(selectedCountry);
      localStorage.setItem('userCountry', selectedCountry);
    } catch (error) {
      console.error('Error fetching user country:', error);
      setStoredCountry('Uganda');
      localStorage.setItem('userCountry', 'Uganda');
    }
  };

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
