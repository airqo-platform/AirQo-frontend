import React, { useState } from 'react';

/**
 * TabSelector
 * @description Tab selector component
 */
const TabSelector = ({ defaultTab, tabs, setSelectedTab }) => {
  const [selectedTab, setSelectedTabLocal] = useState(defaultTab);

  const handleClick = (tab) => {
    setSelectedTabLocal(tab);
    setSelectedTab(tab);
  };

  if (!Array.isArray(tabs) || tabs.length === 0) {
    return null;
  }

  return (
    <div className='mt-6'>
      <div className='flex flex-row justify-center items-center bg-secondary-neutral-light-25 rounded-md border border-secondary-neutral-light-50 p-1'>
        {tabs.map((tab) => (
          <div
            key={tab}
            onClick={() => handleClick(tab)}
            className={`px-3 py-2 flex justify-center items-center w-full hover:cursor-pointer text-sm font-medium text-secondary-neutral-light-600${
              selectedTab === tab ? ' border rounded-md bg-white shadow-sm' : ''
            }`}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TabSelector;
