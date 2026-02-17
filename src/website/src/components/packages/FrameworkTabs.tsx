'use client';
import React from 'react';

interface Framework {
  name: string;
  package: string;
  displayName: string;
}

interface FrameworkTabsProps {
  frameworks: Framework[];
  activeFramework: string;
  onSelectFramework: (framework: string) => void;
}

export default function FrameworkTabs({
  frameworks,
  activeFramework,
  onSelectFramework,
}: FrameworkTabsProps) {
  return (
    <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
      {frameworks.map((framework) => (
        <button
          key={framework.name}
          onClick={() => onSelectFramework(framework.name)}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
            activeFramework === framework.name
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {framework.displayName}
        </button>
      ))}
    </div>
  );
}
