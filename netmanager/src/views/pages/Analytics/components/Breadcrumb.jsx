import { Box, Grid } from '@material-ui/core';
import React from 'react';
import DashboardSearchBar from '../../../components/AirqualitySearch/dashboard_searchbar';

const AnalyticsBreadCrumb = ({ isCohort }) => {
  return (
    <Box display={'flex'} flexDirection={'column'} alignItems={'flex-start'} flexWrap={'wrap'}>
      <Box
        display={'flex'}
        justifyContent={'center'}
        width={{ xs: '100%', sm: '100%', lg: '70%' }}
        marginBottom={'20px'}
        mx="auto"
      >
        <DashboardSearchBar />
      </Box>
      <Box
        display={'flex'}
        alignItems={'center'}
        justifyContent={'flex-start'}
        fontSize={'24px'}
        fontWeight={600}
        fontFamily={'sans-serif'}
        marginBottom={'20px'}
      >
        <Box fontWeight={'300'}>Analytics</Box>
        <Box paddingLeft={'10px'} paddingRight={'10px'} fontWeight={'300'}>
          {'>'}
        </Box>
        <Box>{isCohort ? 'Cohorts' : 'Grids'}</Box>
      </Box>
    </Box>
  );
};

export default AnalyticsBreadCrumb;
