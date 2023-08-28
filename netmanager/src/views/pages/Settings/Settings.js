import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Grid } from '@material-ui/core';

import SettingsNotifications from './components/Notifications/SettingsNotifications';
import SettingsPassword from './components/Password/SettingsPassword';
import GenerateToken from './components/GenerateToken/GenerateToken';
import ErrorBoundary from 'views/ErrorBoundary/ErrorBoundary';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(4)
  }
}));

const Settings = () => {
  const classes = useStyles();

  return (
    <ErrorBoundary>
      <div className={classes.root}>
        <Grid container spacing={4}>
          <Grid item md={12}>
            <SettingsPassword />
            <br />
            <SettingsNotifications />
            <br />
            <GenerateToken />
          </Grid>
        </Grid>
      </div>
    </ErrorBoundary>
  );
};

export default Settings;
