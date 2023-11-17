/* eslint-disable */
import React, { useEffect } from 'react';
import './App.css';

import jwt_decode from 'jwt-decode';
import setAuthToken from './utils/setAuthToken';
import { setCurrentUser, logoutUser } from './redux/Join/actions';

import { Provider } from 'react-redux';
import store from './store';
import { ThemeProvider } from '@material-ui/styles';
import theme from './assets/theme';
import { setOrganization } from './redux/Join/actions';
import { setDefaultAirQloud } from './redux/AirQloud/operations';
import { loadSites } from './redux/Dashboard/operations';
import AppRoutes from './AppRoutes';
import { loadPM25HeatMapData } from './redux/MapData/operations';

// Check for token to keep user logged in
if (localStorage.jwtToken) {
  const token = localStorage.jwtToken;
  setAuthToken(token);
  const decoded = jwt_decode(token);
  let currentUser = decoded;

  if (localStorage.currentUser) {
    try {
      currentUser = JSON.parse(localStorage.currentUser);
    } catch (error) {}
  }
  // Set user and isAuthenticated
  store.dispatch(setCurrentUser(currentUser));
  // Check for expired token
  const currentTime = Date.now() / 1000;
  if (decoded.exp < currentTime) {
    store.dispatch(logoutUser());

    window.location.href = './';
  }
  store.dispatch(setOrganization());
  store.dispatch(setDefaultAirQloud());
  store.dispatch(loadSites());
  store.dispatch(loadPM25HeatMapData());
} else {
  store.dispatch(setOrganization());
  store.dispatch(loadPM25HeatMapData());
}

const App = () => {
  useEffect(() => {
    if (process.env.REACT_APP_ALLOW_DEV_TOOLS === 'staging2') {
      return;
    } else {
      // Disable context menu (right click)
      document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
      });

      // Disable F12 key (open developer tools)
      document.addEventListener('keydown', (e) => {
        if (e.keyCode === 123) {
          e.preventDefault();
        }
      });
    }
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <AppRoutes />
      </ThemeProvider>
    </Provider>
  );
};
export default App;
