import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Alert } from '@material-ui/lab';
import { useMaintenanceStatus } from 'utils/hooks/useMaintenanceStatus';
import { formatDateString } from '../../../utils/dateTime';

const useStyles = makeStyles((theme) => ({
  banner: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    '& .MuiAlert-message': {
      width: '100%',
      textAlign: 'center'
    }
  }
}));

const MaintenanceBanner = () => {
  const classes = useStyles();
  const { maintenance, loading } = useMaintenanceStatus();

  if (loading || !maintenance || !maintenance.isActive) {
    return null;
  }

  return (
    <Alert severity="warning" className={classes.banner}>
      {maintenance.message || 'System maintenance in progress. Some features may be unavailable.'}
      Estimated downtime: {formatDateString(maintenance.startDate)} -{' '}
      {formatDateString(maintenance.endDate)}
    </Alert>
  );
};

export default MaintenanceBanner;
