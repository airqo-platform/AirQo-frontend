import { CheckCircle2 } from "lucide-react";

const SuccessStep = ({
  isCohortAssignmentSuccess,
  claimData,
}: {
  isCohortAssignmentSuccess: boolean;
  claimData?: { device?: { name: string; long_name?: string } };
}) => (
  <div className="flex flex-col items-center justify-center py-8 space-y-4">
    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
      <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
    </div>
    <div className="text-center">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        {isCohortAssignmentSuccess ? 'Cohort Assigned Successfully!' : 'Device Claimed Successfully!'}
      </h3>
    </div>
    {claimData?.device && (
      <div className="w-full space-y-3 mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Device Name:</span>
          <span className="font-medium text-gray-900 dark:text-white">{claimData.device.long_name || claimData.device.name}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Device ID:</span>
          <span className="font-mono text-xs text-gray-900 dark:text-white">{claimData.device.name}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Status:</span>
          <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
            <CheckCircle2 className="w-3 h-3" /> Claimed
          </span>
        </div>
      </div>
    )}
  </div>
);

export default SuccessStep;