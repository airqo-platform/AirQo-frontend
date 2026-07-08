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
    <div className="flex gap-1 p-1 bg-[#f4f4f5] rounded-md">
      {frameworks.map((framework) => (
        <button
          key={framework.name}
          onClick={() => onSelectFramework(framework.name)}
          className={`flex-1 px-3 py-1.5 text-[13px] font-medium rounded transition-colors ${
            activeFramework === framework.name
              ? 'bg-white text-[#18181b] border border-[#e4e4e7]'
              : 'text-[#71717a] hover:text-[#18181b]'
          }`}
        >
          {framework.displayName}
        </button>
      ))}
    </div>
  );
}
