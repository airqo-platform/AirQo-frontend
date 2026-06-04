import React from "react";

interface ImportPreviewStepProps {
  transformedPreview: Record<string, string | string[] | number | boolean | undefined>[];
  errors: Record<string, string>;
}

export const ImportPreviewStep: React.FC<ImportPreviewStepProps> = ({
  transformedPreview,
  errors,
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm">
        <p>Previewing the first {Math.min(5, transformedPreview.length)} of {transformedPreview.length} devices. Please verify the data looks correct before proceeding.</p>
      </div>
      
      {errors.general && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {errors.general}
        </div>
      )}

      <div className="border rounded-md max-h-[400px] overflow-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="text-xs uppercase bg-slate-50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 font-medium border-b">Device Name</th>
              <th className="px-4 py-3 font-medium border-b">Serial Number</th>
              <th className="px-4 py-3 font-medium border-b">Manufacturer</th>
              <th className="px-4 py-3 font-medium border-b">Category</th>
              <th className="px-4 py-3 font-medium border-b">Auth Required</th>
              <th className="px-4 py-3 font-medium border-b">Latitude</th>
              <th className="px-4 py-3 font-medium border-b">Longitude</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {transformedPreview.slice(0, 5).map((device, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="px-4 py-3">{String(device.long_name) || '-'}</td>
                <td className="px-4 py-3 font-mono text-xs">{String(device.serial_number) || '-'}</td>
                <td className="px-4 py-3">{String(device.network) || '-'}</td>
                <td className="px-4 py-3">{String(device.category) || '-'}</td>
                <td className="px-4 py-3">{device.authRequired === false ? 'No' : 'Yes'}</td>
                <td className="px-4 py-3">{device.latitude !== undefined ? String(device.latitude) : '-'}</td>
                <td className="px-4 py-3">{device.longitude !== undefined ? String(device.longitude) : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
