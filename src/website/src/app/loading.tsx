import React from 'react';

const Loading = () => {
  return (
    <div className="app-route-loader" role="status" aria-live="polite">
      <div className="app-route-loader-content">
        <span className="loader app-route-loader-spinner"></span>
        <p className="app-visually-hidden">Loading...</p>
      </div>
    </div>
  );
};

export default Loading;
