'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const LoadingStep = ({ status, text }) => {
  return (
    <div className="flex items-center space-x-3">
      {status === 'pending' && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"
        />
      )}
      {status === 'complete' && (
        <div className="w-5 h-5 flex items-center justify-center text-green-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
      <span
        className={`text-sm ${status === 'complete' ? 'text-green-600' : 'text-gray-600'}`}
      >
        {text}
      </span>
    </div>
  );
};

const LoginSetupLoader = () => {
  const [authenticating, setAuthenticating] = useState('pending');
  const [loadingUserData, setLoadingUserData] = useState('pending');
  const [loadingPreferences, setLoadingPreferences] = useState('waiting');
  const [finalizing, setFinalizing] = useState('waiting');

  useEffect(() => {
    // Simulate the loading process with realistic timings
    const timer1 = setTimeout(() => {
      setAuthenticating('complete');
      setLoadingUserData('pending');
    }, 1000);

    const timer2 = setTimeout(() => {
      setLoadingUserData('complete');
      setLoadingPreferences('pending');
    }, 2500);

    const timer3 = setTimeout(() => {
      setLoadingPreferences('complete');
      setFinalizing('pending');
    }, 3800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center bg-white dark:bg-gray-900">
      <div className="flex flex-col items-center mb-6">
        <img
          src="/icons/airqo_logo.svg"
          alt="AirQo Logo"
          className="h-16 mb-4"
          onError={(e) => {
            e.target.src = '/icons/airqo.png';
          }}
        />
        <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-2">
          Setting up your workspace
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Please wait while we prepare your dashboard
        </p>
      </div>

      <div className="flex flex-col space-y-6 max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <LoadingStep
          status={authenticating}
          text="Authenticating your session"
        />
        <LoadingStep
          status={loadingUserData}
          text="Loading user profile and groups"
        />
        <LoadingStep
          status={loadingPreferences}
          text="Retrieving your preferences"
        />
        <LoadingStep status={finalizing} text="Finalizing your workspace" />
      </div>
    </div>
  );
};

export default LoginSetupLoader;
