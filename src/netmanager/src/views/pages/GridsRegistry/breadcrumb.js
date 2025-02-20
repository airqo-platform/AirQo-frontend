import { Box } from '@material-ui/core';
import React from 'react';

const BreadCrumb = ({ children }) => {
  return (
    <Box
      display={'flex'}
      flexDirection={{ xs: 'column', sm: 'row' }}
      alignItems={'center'}
      justifyContent={'space-between'}
      fontSize={'24px'}
      fontWeight={600}
      fontFamily={'sans-serif'}
      paddingBottom={'20px'}
      width={'100%'}
    >
      <Box fontWeight={'300'}>Grid registry</Box>
      <Box paddingLeft={'10px'} paddingRight={'10px'} fontWeight={'300'}>
        {children}
      </Box>
    </Box>
  );
};

export default BreadCrumb;
