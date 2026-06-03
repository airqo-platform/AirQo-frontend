import { AlertCircle } from "lucide-react";
import { VerifiedCohort } from "../claim-device-modal";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";


const DeploymentWarning = ({ isBulk = false }: { isBulk?: boolean }) => (
  <p className="text-sm text-amber-700 dark:text-amber-400 mt-3 max-w-sm mx-auto bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-100 dark:border-amber-900/50">
    <TooltipProvider delayDuration={0}>
      Warning: {isBulk ? 'Any devices currently' : 'If this device is currently'}{' '}
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className="underline decoration-dashed decoration-amber-500/50 underline-offset-4 cursor-help font-medium">deployed</button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Deployment triggers data transmission for a device</p>
        </TooltipContent>
      </Tooltip>
      {isBulk ? ' will be automatically' : ', it will be automatically'}{' '}
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className="underline decoration-dashed decoration-amber-500/50 underline-offset-4 cursor-help font-medium">recalled</button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="max-w-xs">Recalling removes a device from a Site (e.g., for repair) without deleting it from your inventory.</p>
        </TooltipContent>
      </Tooltip>
      {isBulk ? ' and added to your inventory.' : '.'}
    </TooltipProvider>
  </p>
);

export const CohortConfirmStep = ({
  verifiedCohort,
  isExternalOrg,
}: {
  verifiedCohort: VerifiedCohort;
  isExternalOrg: boolean;
}) => (
  <div className="space-y-4">
    <div className="rounded-lg border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 p-4">
      <p className="text-sm text-blue-800 dark:text-blue-200">
        <strong>Cohort Name:</strong> {verifiedCohort.name}
      </p>
      <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
        This will add the devices from this cohort to your {isExternalOrg ? 'organization' : 'personal'} assets.
      </p>
    </div>
    <p className="text-sm text-gray-500 dark:text-gray-400">Continue to import this cohort?</p>
  </div>
);

export const BulkConfirmationStep = ({ count }: { count: number }) => (
  <div className="flex flex-col items-center justify-center py-6 px-4 space-y-4 text-center">
    <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-full">
      <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
    </div>
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Confirm Bulk Claim</h3>
      <div className="text-sm text-gray-600 dark:text-gray-300 max-w-sm mx-auto">
        You are about to claim <span className="font-semibold text-gray-900 dark:text-white">{count}</span> devices.
      </div>
      <DeploymentWarning isBulk />
    </div>
  </div>
);

export const ConfirmationStep = () => (
  <div className="flex flex-col items-center justify-center py-6 px-4 space-y-4 text-center">
    <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-full">
      <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
    </div>
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Confirm Device Claim</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 max-w-sm mx-auto">Are you sure you want to claim this device?</p>
      <DeploymentWarning />
    </div>
  </div>
);