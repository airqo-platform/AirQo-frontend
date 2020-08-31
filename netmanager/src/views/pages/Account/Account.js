import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Grid } from '@material-ui/core';

import {
  connectedAccountProfile as ConnectedAccountProfile, 
  connectedAccountsDetails as ConnectedAccountDetails
} from 'views/components/Users/containers/Users';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(4)
  }
}));

const Account = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Grid
        container
        spacing={4}
      >
        <Grid
          item
          lg={4}
          md={6}
          xl={4}
          xs={12}
        >
          <ConnectedAccountProfile />
        </Grid>
        <Grid
          item
          lg={8}
          md={6}
          xl={8}
          xs={12}
        >
          <ConnectedAccountDetails />
        </Grid>
      </Grid>
    </div>
  );
};

export default Account;
