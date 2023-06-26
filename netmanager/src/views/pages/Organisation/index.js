import React from 'react';
import { ErrorBoundary } from '../../ErrorBoundary';
import OrgToolbar from './components/toolbar';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3)
  },
  content: {
    marginTop: theme.spacing(2)
  }
}));

const Organisation = () => {
  const classes = useStyles();

  return (
    <ErrorBoundary>
      <div className={classes.root}>
        <OrgToolbar />
      </div>
    </ErrorBoundary>
  );
};

export default Organisation;
