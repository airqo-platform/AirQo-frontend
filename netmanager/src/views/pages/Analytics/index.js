import React, { useState } from 'react';
import { Box, Button, makeStyles } from '@material-ui/core';
import ErrorBoundary from 'views/ErrorBoundary/ErrorBoundary';
import AnalyticsAirqloudsDropDown from './components/airqloud_dropdown';
import ImportExportIcon from '@material-ui/icons/ImportExport';
import GridsDashboardView from './components/grids_dashboard';
import AnalyticsBreadCrumb from './components/breadcrumb';

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
        <AnalyticsBreadCrumb isCohort={isCohort} />
        <Box
          display={'flex'}
          flexDirection={{ xs: 'column', sm: 'column', md: 'row', lg: 'row', xl: 'row' }}
          justifyContent={'space-between'}
          alignItems={'center'}
        >
          <Box
            width={'100%'}
            maxWidth={{ xs: 'none', sm: 'none', md: '400px', lg: '400px', xl: '400px' }}
            marginBottom={{ xs: '20px', sm: '20px', md: '0', lg: '0', xl: '0' }}
          >
            <AnalyticsAirqloudsDropDown isCohort={isCohort} />
          </Box>
          <Button
            margin="dense"
            color="primary"
            style={{
              width: 'auto',
              textTransform: 'initial',
              height: '44px'
            }}
            variant="contained"
            onClick={handleSwitchAirqloudTypeClick}
          >
            <ImportExportIcon /> Switch to {isCohort ? 'Grid View' : 'Cohort View'}
          </Button>
        </Box>

        {!isCohort && <GridsDashboardView />}
      </div>
    </ErrorBoundary>
  );
};

export default Analytics;
