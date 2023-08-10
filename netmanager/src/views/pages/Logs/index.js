import React, { useState } from 'react';
import { Box, makeStyles } from '@material-ui/core';
import usersStateConnector from 'views/stateConnectors/usersStateConnector';
import { ErrorBoundary } from '../../ErrorBoundary';
import { withPermission } from '../../containers/PageAccess';
import LogsBreadCrumb from './BreadCrumb';
import LogsTable from './logs_table';
import ServiceDropdown from './ServiceDropdown';
import { useSelector } from 'react-redux';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3)
  },
  content: {
    marginTop: theme.spacing(2)
  }
}));

const SERVICES = [
  'site-registry',
  'device-registry',
  'airqloud-registry',
  'device-maintenance',
  'device-deployment',
  'device-recall',
  'auth',
  'incentives',
  'calibrate',
  'locate',
  'fault-detection',
  'data-export-download',
  'data-export-scheduling'
];

const SERVICE_ARR = SERVICES.map((service) => ({
  label: service.replace(/-/g, ' '), // Replace dashes with spaces
  value: service
}));

const Logs = (props) => {
  const classes = useStyles();
  const activeService = useSelector((state) => state.logs.activeService);

  return (
    <ErrorBoundary>
      <div className={classes.root}>
        <Box
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row', md: 'row', lg: 'row', xl: 'row' }}
          justifyContent="space-between"
          alignItems={'center'}
          paddingBottom={'30px'}
        >
          <LogsBreadCrumb category={activeService} />
          <ServiceDropdown services={SERVICE_ARR} />
        </Box>

        <LogsTable service={activeService} />
      </div>
    </ErrorBoundary>
  );
};
const usrsStateConnector = usersStateConnector(Logs);
export default withPermission(usrsStateConnector, 'CREATE_UPDATE_AND_DELETE_NETWORK_USERS');
