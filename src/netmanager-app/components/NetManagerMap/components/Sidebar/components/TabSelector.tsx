import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * TabSelector
 * @description Tab selector component
 */
interface TabSelectorProps {
  defaultTab: string;
  tabs: string[];
  setSelectedTab: (tab: string) => void;
}

const TabSelector: React.FC<TabSelectorProps> = ({ defaultTab, tabs, setSelectedTab }) => {
  const [selectedTab, setSelectedTabLocal] = useState(defaultTab);

  // Ensure defaultTab is part of the tabs array
  useEffect(() => {
    if (!tabs.includes(defaultTab)) {
      setSelectedTabLocal(tabs[0]);
      setSelectedTab(tabs[0]);
    }
  }, [defaultTab, tabs, setSelectedTab]);

  const handleClick = (tab) => {
    setSelectedTabLocal(tab);
    setSelectedTab(tab);
  };

  // Return null if tabs array is invalid
  if (!Array.isArray(tabs) || tabs.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <div className="flex flex-row justify-center items-center bg-secondary-neutral-light-25 rounded-md border border-secondary-neutral-light-50 p-1">
        {tabs.map((tab) => (
          <div
            key={tab}
            onClick={() => handleClick(tab)}
            className={`px-3 py-2 flex justify-center items-center w-full cursor-pointer text-sm font-medium text-secondary-neutral-light-600 ${
              selectedTab === tab ? 'border rounded-md bg-white shadow-sm' : ''
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </div>
        ))}
      </div>
    </div>
  );
};



export default TabSelector;
