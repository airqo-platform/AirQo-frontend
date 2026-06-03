import React from "react";
import type { ImportDeviceFormData } from "./types";

interface ConfirmationStepProps {
  formData: ImportDeviceFormData;
  selectedCohortId: string;
  selectedCohortName?: string;
}

export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  formData,
  selectedCohortId,
  selectedCohortName,
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-slate-50 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700">
        <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-4 border-b pb-2">Device Summary</h4>
        
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 text-sm">
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Device Name</dt>
            <dd className="font-medium">{formData.long_name || '-'}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Serial Number</dt>
            <dd className="font-medium font-mono text-xs mt-1">{formData.serial_number || '-'}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Manufacturer</dt>
            <dd className="font-medium">{formData.network || '-'}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Category</dt>
            <dd className="font-medium capitalize">{formData.category || '-'}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Auth Required</dt>
            <dd className="font-medium">{formData.authRequired ? 'Yes' : 'No'}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Connection URL</dt>
            <dd className="font-medium truncate" title={formData.api_code}>{formData.api_code || '-'}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-gray-500 dark:text-gray-400">Assigned Cohort</dt>
            <dd className="font-medium">{selectedCohortId ? selectedCohortName || 'Loading group...' : 'None (Will not be grouped)'}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};
