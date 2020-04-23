import React, { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Grid} from '@material-ui/core';
import { Display, Filters } from './components';


const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3)
  },
  content: {
    marginTop: theme.spacing(2)
  }
}));

const Graphs = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Grid
        container
        spacing={0.1}
      >
        <Grid
          item
          lg={8}
          sm={8}
          xl={8}
          xs={12}
        >
          <Display />
        </Grid>
        <Grid
          item
          lg={4}
          sm={4}
          xl={4}
          xs={12}
        >
          <Filters />
        </Grid>
      </Grid>
    </div>
  );
};

export default Graphs;
