'use client';
import { useTheme } from 'next-themes';
import React, { useState, useEffect } from 'react';

import { Checkbox } from '../../ui/checkbox';

const Index = () => {
  const { theme, setTheme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(theme === 'dark');

  useEffect(() => {
    setIsDarkMode(theme === 'dark');
  }, [theme]);

  const handleToggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    setIsDarkMode(newTheme === 'dark');
  };

  return (
    <div>
      <div className="flex flex-col ">
        <div className="space-y-3 mt-4">
          <h2 className="text-xl font-semibold text-gray-400 dark:text-gray-200">
            General Settings
          </h2>

          <div
            onClick={handleToggleTheme}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleToggleTheme();
              }
            }}
            role="button"
            tabIndex={0}
            className="flex items-center space-x-2 mb-4"
          >
            <Checkbox id="darkMode" checked={isDarkMode} />
            <label
              htmlFor="darkMode"
              className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              Enable dark mode
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
