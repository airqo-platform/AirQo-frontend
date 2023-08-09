import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core';
import usersStateConnector from 'views/stateConnectors/usersStateConnector';
import { ErrorBoundary } from '../../ErrorBoundary';
import { withPermission } from '../../containers/PageAccess';
import LogsBreadCrumb from './BreadCrumb';
import LogsTable from './logs_table';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3)
  },
  content: {
    marginTop: theme.spacing(2)
  }
}));

const Logs = (props) => {
  const classes = useStyles();
  const [service, setService] = useState('data-export');

  return (
    <ErrorBoundary>
      <div className={classes.root}>
        <LogsBreadCrumb category={service} />
        <LogsTable />
      </div>
    </ErrorBoundary>
  );
};
const usrsStateConnector = usersStateConnector(Logs);
export default withPermission(usrsStateConnector, 'CREATE_UPDATE_AND_DELETE_NETWORK_USERS');
