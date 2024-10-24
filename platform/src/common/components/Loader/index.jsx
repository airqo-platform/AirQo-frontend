'use client';
import React from 'react';
import Spinner from '../Spinner';

const Loading = () => {
  return (
    <div className="flex justify-center items-center h-dvh">
      <Spinner width={70} height={70} />
    </div>
  );
};

export default Loading;
