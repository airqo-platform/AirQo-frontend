import React from 'react';
import { makeStyles } from '@material-ui/styles';
import HostsTable from './HostsTable';
import ErrorBoundary from 'views/ErrorBoundary/ErrorBoundary';
import { withPermission } from '../../containers/PageAccess';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3)
  },
  content: {
    marginTop: theme.spacing(2)
  },
  title: {
    fontWeight: 700,
    color: '#000000',
    fontSize: 24,
    fontFamily: 'Open Sans'
  }
}));

const HostRegistry = () => {
  const classes = useStyles();
  return (
    <ErrorBoundary>
      <div className={classes.root}>
        <div className={classes.content}>
          <HostsTable />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default withPermission(HostRegistry, 'CREATE_UPDATE_AND_DELETE_NETWORK_DEVICES');
