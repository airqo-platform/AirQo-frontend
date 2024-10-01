'use client';
import React from 'react';

const loading = () => {
  return (
    <div className="flex justify-center items-center h-full dark:bg-[#1a202c]">
      <div className="spinnerLoader"></div>
    </div>
  );
};

export default loading;
