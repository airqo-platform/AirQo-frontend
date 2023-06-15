import React from 'react';
import { makeStyles } from '@material-ui/core';
import usersStateConnector from 'views/stateConnectors/usersStateConnector';
import { ErrorBoundary } from '../../../ErrorBoundary';
import { withPermission } from '../../../containers/PageAccess';
import LogsBreadCrumb from '../BreadCrumb';
import DataExportLogsTable from './logs_table';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3)
  },
  content: {
    marginTop: theme.spacing(2)
  }
}));

const DataExportLogs = (props) => {
  const classes = useStyles();

  return (
    <ErrorBoundary>
      <div className={classes.root}>
        <LogsBreadCrumb category="Data Export" />
        <DataExportLogsTable />
      </div>
    </ErrorBoundary>
  );
};
const usrsStateConnector = usersStateConnector(DataExportLogs);
export default withPermission(usrsStateConnector, 'CREATE_UPDATE_AND_DELETE_NETWORK_USERS');
