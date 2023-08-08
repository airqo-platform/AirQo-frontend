import React, { useState } from 'react';
import { Button, Grid, makeStyles } from '@material-ui/core';
import ErrorBoundary from 'views/ErrorBoundary/ErrorBoundary';
import AnalyticsAirqloudsDropDown from './components/airqloud_dropdown';
import ImportExportIcon from '@material-ui/icons/ImportExport';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(4)
  }
}));

const Analytics = () => {
  const classes = useStyles();
  const [isCohort, setIsCohort] = useState(true);

  const handleSwitchAirqloudTypeClick = () => {
    setIsCohort(!isCohort);
  };

  return (
    <ErrorBoundary>
      <div className={classes.root}>
        <Grid container lg={8} xs={12} sm={12} md={12} xl={8}>
          {/* Dropdown and Button */}
          <Grid item lg={7} xl={7} md={7} sm={12} xs={12}>
            <AnalyticsAirqloudsDropDown isCohort={isCohort} />
          </Grid>
          <Grid item lg={5} xl={5} md={5} sm={12} xs={12}>
            <Button
              margin="dense"
              color="primary"
              style={{
                width: 'auto',
                color: '#175df5',
                textTransform: 'initial',
                height: '44px'
              }}
              onClick={handleSwitchAirqloudTypeClick}
            >
              <ImportExportIcon /> Switch to {isCohort ? 'Grid' : 'Cohort'}
            </Button>
          </Grid>
        </Grid>
      </div>
    </ErrorBoundary>
  );
};

export default Analytics;
