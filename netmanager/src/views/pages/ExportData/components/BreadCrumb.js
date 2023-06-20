import { Box } from '@material-ui/core';
import React from 'react';

const ExportDataBreadCrumb = ({ title }) => {
  return (
    <Box
      display={'flex'}
      alignItems={'center'}
      justifyContent={'flex-start'}
      fontSize={'24px'}
      fontWeight={600}
      fontFamily={'sans-serif'}
      paddingBottom={'30px'}
    >
      <Box fontWeight={'300'}>Export data</Box>
      <Box paddingLeft={'10px'} paddingRight={'10px'} fontWeight={'300'}>
        {'>'}
      </Box>
      <Box>{title}</Box>
    </Box>
  );
};

export default ExportDataBreadCrumb;
