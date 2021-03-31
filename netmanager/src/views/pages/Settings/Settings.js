import React from "react";
import { makeStyles } from "@material-ui/styles";
import { Grid } from "@material-ui/core";

import SettingsNotifications from "./components/Notifications/SettingsNotifications";
import SettingsPassword from "./components/Password/SettingsPassword";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(4),
  },
}));

const Settings = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Grid container spacing={4}>
        <Grid item md={7} xs={12}>
          <SettingsNotifications />
        </Grid>
        <Grid item md={5} xs={12}>
          <SettingsPassword />
        </Grid>
      </Grid>
    </div>
  );
};

export default Settings;
