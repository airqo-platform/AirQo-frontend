import React from 'react';
import { Smartphone, FileSpreadsheet } from 'lucide-react';

export type ImportFlowMode = 'single' | 'bulk';

interface ImportMethodSelectStepProps {
  onSelect: (method: ImportFlowMode) => void;
}

const METHODS = [
  {
    id: 'single' as ImportFlowMode,
    icon: <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    iconBg: 'bg-blue-100 dark:bg-blue-900/40 group-hover:bg-blue-200 dark:group-hover:bg-blue-800',
    border: 'hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20',
    title: 'Import Single Device',
    desc: 'Manually enter credentials for a single device.',
  },
  {
    id: 'bulk' as ImportFlowMode,
    icon: <FileSpreadsheet className="w-5 h-5 text-green-600 dark:text-green-400" />,
    iconBg: 'bg-green-100 dark:bg-green-900/40 group-hover:bg-green-200 dark:group-hover:bg-green-800',
    border: 'hover:border-green-500 dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20',
    title: 'Import Multiple Devices',
    desc: 'Upload a CSV or JSON file to import devices in bulk.',
  },
];

export const ImportMethodSelectStep: React.FC<ImportMethodSelectStepProps> = ({ onSelect }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {METHODS.map(({ id, icon, iconBg, border, title, desc }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`flex items-center p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg ${border} transition-colors text-left w-full group`}
          >
            <div className={`p-2 ${iconBg} rounded-full transition-colors mr-4 shrink-0`}>
              {icon}
            </div>
            <div>
              <h4 className="font-semibold text-base text-gray-900 dark:text-white">
                {title}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {desc}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
