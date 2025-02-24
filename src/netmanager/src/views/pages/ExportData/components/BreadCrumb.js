import { Box } from '@material-ui/core';
import React from 'react';

const ExportDataBreadCrumb = ({ title, paddingBottom }) => {
  return (
    <Box
      display={'flex'}
      alignItems={'center'}
      justifyContent={'flex-start'}
      fontSize={'24px'}
      fontWeight={600}
      fontFamily={'sans-serif'}
      paddingBottom={paddingBottom || '30px'}
      width={'100%'}
    >
      <Box fontWeight={'300'}>Export</Box>
      <Box paddingLeft={'10px'} paddingRight={'10px'} fontWeight={'300'}>
        {'>'}
      </Box>
      <Box>{title}</Box>
    </Box>
  );
};

export default ExportDataBreadCrumb;
