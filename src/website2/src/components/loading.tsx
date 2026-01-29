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
  const containerClasses = fullScreen
    ? 'flex items-center justify-center min-h-screen bg-white z-[9999] fixed inset-0'
    : 'flex items-center justify-center';

  return (
    <div className={containerClasses}>
      <span
        className="loading-spinner"
        style={{
          width:
            size === 'small' ? '24px' : size === 'medium' ? '36px' : '48px',
          height:
            size === 'small' ? '24px' : size === 'medium' ? '36px' : '48px',
        }}
      ></span>
      <style jsx>{`
        .loading-spinner {
          display: inline-block;
          position: relative;
        }
        .loading-spinner::after,
        .loading-spinner::before {
          content: '';
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #145dff;
          position: absolute;
          left: 0;
          top: 0;
          box-sizing: border-box;
          animation: animloader 2s ease-in-out infinite;
        }
        .loading-spinner::after {
          animation-delay: 1s;
        }

        @keyframes animloader {
          0%,
          100% {
            transform: scale(0);
            opacity: 1;
          }
          50% {
            transform: scale(1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Loading;
