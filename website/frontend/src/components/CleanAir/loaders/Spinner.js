import React from 'react';
import LoopIcon from '@mui/icons-material/Loop';
import { styled, keyframes } from '@mui/system';

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const RotatingLoopIcon = styled(LoopIcon)({
  animation: `${rotate} 2s linear infinite`,
  fontSize: '40px',
});

const Spinner = () => {
  return <RotatingLoopIcon />;
};

export default Spinner;
