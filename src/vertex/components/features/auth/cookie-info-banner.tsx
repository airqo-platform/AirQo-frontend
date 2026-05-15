'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function CookieInfoBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    if (!cookiesAccepted) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      backgroundColor: '#0066b3', // Primary color - adjust if different
      color: 'white',
      padding: '12px 16px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <p style={{
          fontSize: '14px',
          textAlign: 'center',
          margin: 0
        }}>
          AirQo uses cookies to deliver and enhance the quality of its services and to analyze traffic.
          {' '}
          <Link 
            href="https://airqo.net/legal/cookies" 
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'white',
              textDecoration: 'underline'
            }}
          >
            Learn more
          </Link>
        </p>
        <button
          onClick={handleDismiss}
          style={{
            backgroundColor: 'white',
            color: '#0066b3',
            border: 'none',
            padding: '4px 16px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          OK, got it
        </button>
      </div>
    </div>
  );
}