import { Box } from '@material-ui/core';
import React from 'react';

const AnalyticsBreadCrumb = ({ isCohort }) => {
  return (
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
  );
};

export default AnalyticsBreadCrumb;
