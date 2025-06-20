import React from 'react';
import { FaGlobe, FaPalette } from 'react-icons/fa';

const SettingsTabNavigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'organization',
      name: 'Organization',
      icon: FaGlobe,
      description: 'Basic organization information and settings',
    },
    {
      id: 'appearance',
      name: 'Appearance',
      icon: FaPalette,
      description: 'Customize the look and feel',
    },
  ];
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-t-lg">
      <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
              title={tab.description}
            >
              <Icon
                className={`
                  -ml-0.5 mr-2 h-5 w-5 transition-colors duration-200
                  ${
                    isActive
                      ? 'text-primary'
                      : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                  }
                `}
                aria-hidden="true"
              />
              {tab.name}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default SettingsTabNavigation;
