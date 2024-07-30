import React from 'react';
import { RingLoader } from 'react-spinners';

const loading = () => {
  return (
    <div className="w-full h-full flex justify-center items-center">
      <RingLoader size={90} color={'#123abc'} loading={true} />
    </div>
  );
};

export default loading;
