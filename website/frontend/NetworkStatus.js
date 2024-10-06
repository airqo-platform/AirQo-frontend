import React from 'react';
import { useNetwork } from './utilities/useNetwork';
import OopsImage from 'src/assets/svg/errors/Oops.svg';

const NetworkStatus = ({ children }) => {
  const isOnline = useNetwork();

  if (!isOnline) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          color: '#135dff',
          textAlign: 'center',
          padding: '0 1rem'
        }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Connection Lost</h1>
          <p style={{ fontSize: '1.125rem', marginTop: '1rem' }}>
            We are unable to connect to the internet. Please check your network settings and try
            again.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default NetworkStatus;
