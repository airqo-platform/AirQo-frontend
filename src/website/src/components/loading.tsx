'use client';
import React from 'react';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'large',
  fullScreen = false,
}) => {
  const containerClassName = fullScreen
    ? 'app-route-loader'
    : 'app-inline-loader';

  const spinnerSize =
    size === 'small' ? '28px' : size === 'medium' ? '38px' : '50px';

  return (
    <div className={containerClassName} role="status" aria-live="polite">
      <div className="app-route-loader-content">
        <span
          className="loader app-route-loader-spinner"
          style={{ fontSize: spinnerSize }}
        ></span>
        <p className="app-visually-hidden">Loading...</p>
      </div>
    </div>
  );
};

export default Loading;
