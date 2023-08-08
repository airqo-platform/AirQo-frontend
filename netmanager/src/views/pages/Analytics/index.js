import React, { useState } from 'react';
import { Button, Grid } from '@material-ui/core';
import ErrorBoundary from 'views/ErrorBoundary/ErrorBoundary';
import AnalyticsAirqloudsDropDown from './components/airqloud_dropdown';

const Analytics = () => {
  const [isCohort, setIsCohort] = useState(true);

  const handleSwitchAirqloudTypeClick = () => {
    setIsCohort(!isCohort);
  };

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
};

export default Analytics;
