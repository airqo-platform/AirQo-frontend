import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Paper, Typography, Box } from '@material-ui/core';
import { Warning as WarningIcon } from '@material-ui/icons';
import { useMaintenanceStatus } from 'utils/hooks/useMaintenanceStatus';
import { format } from 'date-fns';

const useStyles = makeStyles((theme) => ({
  banner: {
    padding: theme.spacing(2),
    backgroundColor: '#fff3e0', // Light warning color
    border: '1px solid #ffb74d', // Warning border
    borderRadius: '4px',
    marginBottom: theme.spacing(2),
    margin: 5
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(2)
  },
  icon: {
    color: '#f57c00' // Warning icon color
  },
  message: {
    color: '#424242', // Dark text for readability
    fontWeight: 'bold',
    fontSize: 18
  },
  timeInfo: {
    marginTop: theme.spacing(1),
    color: '#616161', // Slightly lighter text for secondary info
    fontSize: '0.875rem',
    textAlign: 'center'
  }
}));

const MaintenanceBanner = () => {
  const classes = useStyles();
  const { maintenance, loading } = useMaintenanceStatus();

  if (loading || !maintenance || !maintenance.isActive) {
    return null;
  }

  return (
    <Paper elevation={0} className={classes.banner}>
      <Box className={classes.content}>
        <WarningIcon className={classes.icon} />
        <Typography variant="body1" className={classes.message}>
          {maintenance.message ||
            'System maintenance in progress. Some features may be unavailable.'}
        </Typography>
      </Box>
      <Typography variant="body2" className={classes.timeInfo}>
        Estimated downtime:{' '}
        {maintenance.startDate && !isNaN(new Date(maintenance.startDate))
          ? format(new Date(maintenance.startDate), 'MMM d, yyyy h:mm a')
          : 'Invalid start date'}{' '}
        -{' '}
        {maintenance.endDate && !isNaN(new Date(maintenance.endDate))
          ? format(new Date(maintenance.endDate), 'MMM d, yyyy h:mm a')
          : 'Invalid end date'}
      </Typography>
    </Paper>
  );
};

export default MaintenanceBanner;
