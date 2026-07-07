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

  const sizeClass =
    size === 'small'
      ? 'loader--small'
      : size === 'medium'
        ? 'loader--medium'
        : '';

  return (
    <div className={containerClassName} role="status" aria-live="polite">
      <div className="app-route-loader-content">
        <div className={`loader ${sizeClass}`}></div>
        <p className="app-visually-hidden">Loading...</p>
      </div>
    </div>
  );
};

export default Loading;
