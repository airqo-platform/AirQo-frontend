import React, { Fragment } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Grid } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(4)
  }
}));

const Reports = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Grid
        // container
        spacing={1}
      >
        <p>Content goes here</p>
      </Grid>
    </div>
  );
};

export default Reports;
