import React from "react";
import { EXPECTED_FIELDS } from "./types";

interface FieldMappingStepProps {
  parsedData: Record<string, string | number | undefined>[];
  fileHeaders: string[];
  fieldMapping: Record<string, string>;
  setFieldMapping: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  errors: Record<string, string>;
}

export const FieldMappingStep: React.FC<FieldMappingStepProps> = ({
  parsedData,
  fileHeaders,
  fieldMapping,
  setFieldMapping,
  errors,
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm">
        <p>We found {parsedData.length} devices in your file. Please map the columns from your file to the expected device fields.</p>
      </div>
      
      {errors.general && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {errors.general}
        </div>
      )}

      <div className="border rounded-md max-h-[400px] overflow-y-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-slate-50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 font-medium border-b w-1/2">Expected Field</th>
              <th className="px-4 py-3 font-medium border-b w-1/2">Your File Column</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {EXPECTED_FIELDS.map((field: { key: string, label: string, required?: boolean }) => (
              <tr key={field.key} className={field.required && !fieldMapping[field.key] ? "bg-red-50/30" : ""}>
                <td className="px-4 py-3 align-middle">
                  <div className="flex items-center">
                    <span className="font-medium">{field.label}</span>
                    {field.required && <span className="ml-1 text-red-500">*</span>}
                  </div>
                </td>
                <td className="px-4 py-2">
                  <select
                    className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 p-2"
                    value={fieldMapping[field.key] || ""}
                    onChange={(e) => setFieldMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                  >
                    <option value="">-- Ignore this field --</option>
                    {fileHeaders.map(header => (
                      <option key={header} value={header}>{header}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
