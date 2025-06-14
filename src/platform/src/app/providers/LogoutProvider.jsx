'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import LogoutOverlay from '@/common/components/LogoutOverlay';
import { setLogoutContext } from '@/core/HOC/LogoutUser';

const LogoutContext = createContext({
  isLoggingOut: false,
  setIsLoggingOut: () => {},
  logoutMessage: 'Logging out...',
  setLogoutMessage: () => {},
});

export const useLogout = () => {
  const context = useContext(LogoutContext);
  if (!context) {
    throw new Error('useLogout must be used within a LogoutProvider');
  }
  return context;
};

export const LogoutProvider = ({ children }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState('Logging out...');

  // Register the context handlers with LogoutUser
  useEffect(() => {
    setLogoutContext(setIsLoggingOut, setLogoutMessage);
  }, []);

  const value = {
    isLoggingOut,
    setIsLoggingOut,
    logoutMessage,
    setLogoutMessage,
  };

  return (
    <LogoutContext.Provider value={value}>
      {children}
      <LogoutOverlay isVisible={isLoggingOut} message={logoutMessage} />
    </LogoutContext.Provider>
  );
};

export default LogoutProvider;
