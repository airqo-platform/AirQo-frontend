import React from "react";
import type { BulkImportDeviceResponse } from "@/app/types/devices";

interface BulkResultsStepProps {
  bulkResults: BulkImportDeviceResponse;
}

export const BulkResultsStep: React.FC<BulkResultsStepProps> = ({ bulkResults }) => {
  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-md ${bulkResults.failed === 0 ? 'bg-green-50 text-green-700' : bulkResults.imported === 0 ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-800'}`}>
        <h3 className="font-medium mb-1">
          {bulkResults.imported} of {bulkResults.total} devices imported. {bulkResults.failed} failed.
        </h3>
      </div>
      
      <div className="border rounded-md max-h-[300px] overflow-y-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-slate-50 sticky top-0">
            <tr>
              <th className="px-4 py-2 font-medium">Device Name</th>
              <th className="px-4 py-2 font-medium">Serial Number</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {bulkResults.results?.map((result: any, idx: number) => (
              <tr key={idx} className={!result.success ? "bg-red-50/50" : ""}>
                <td className="px-4 py-2">{result.long_name || '-'}</td>
                <td className="px-4 py-2 font-mono text-xs">{result.serial_number || '-'}</td>
                <td className="px-4 py-2">
                  {result.success ? (
                    <span className="text-green-600 font-medium">Success</span>
                  ) : (
                    <span className="text-red-600 font-medium text-xs break-words">{result.error || 'Failed'}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
