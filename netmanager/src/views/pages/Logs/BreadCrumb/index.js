import { Box } from '@material-ui/core';
import React from 'react';

const LogsBreadCrumb = ({ category }) => {
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
      <Box fontWeight={'300'}>Logs</Box>
      <Box paddingLeft={'10px'} paddingRight={'10px'} fontWeight={'300'}>
        {'>'}
      </Box>
      <Box>{category}</Box>
    </Box>
  );
};

export default LogsBreadCrumb;
