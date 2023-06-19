import React, { useState } from 'react';
import './loader.css';

const HorizontalLoader = ({ color, loading, progress }) => {
  return (
    <div
      className="loader-container"
      style={{
        zIndex: loading ? 9999 : -1
      }}>
      {loading && (
        <div
          className="loader"
          style={{
            backgroundColor: color,
            width: `${progress}%`
          }}></div>
      )}
    </div>
  );
};

export default HorizontalLoader;
