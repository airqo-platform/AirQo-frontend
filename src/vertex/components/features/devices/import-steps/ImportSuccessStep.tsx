import React from "react";

interface ImportSuccessStepProps {
  deviceName: string;
}

export const ImportSuccessStep: React.FC<ImportSuccessStepProps> = ({ deviceName }) => {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Device(s) Imported Successfully!
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        {deviceName} has been added to your workspace.
      </p>
    </div>
  );
};
