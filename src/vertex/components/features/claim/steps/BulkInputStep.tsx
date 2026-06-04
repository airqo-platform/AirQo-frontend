import ReusableButton from "@/components/shared/button/ReusableButton";
import { BulkDevice, ErrorAlert } from "../claim-device-modal";
import { FileUploadParser } from "../FileUploadParser";
import { Plus } from "lucide-react";
import { DeviceEntryRow } from "../DeviceEntryRow";
import CohortAssignmentBanner from "./CohortAssignmentBanner";

const BulkInputStep = ({
  bulkDevices,
  isPersonalContext,
  isExternalOrg,
  defaultCohort,
  activeGroupTitle,
  error,
  onAddDevice,
  onRemoveDevice,
  onDeviceChange,
  onFileImport,
  onClear,
}: {
  bulkDevices: BulkDevice[];
  isPersonalContext: boolean;
  isExternalOrg: boolean;
  defaultCohort: string | null;
  activeGroupTitle?: string;
  error: string | null;
  onAddDevice: () => void;
  onRemoveDevice: (i: number) => void;
  onDeviceChange: (i: number, field: 'device_name' | 'claim_token', val: string) => void;
  onFileImport: (devices: BulkDevice[]) => void;
  onClear: () => void;
}) => {
  if (bulkDevices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-4 space-y-6">
        <div className="w-full">
          <FileUploadParser onFilesParsed={onFileImport} variant="dropzone" />
        </div>
        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-gray-800 px-2 text-gray-500">Or</span>
          </div>
        </div>
        <button onClick={onAddDevice} className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">
          Enter device details manually
        </button>
      </div>
    );
  }

  const validCount = bulkDevices.filter((d) => d.device_name.trim() && d.claim_token.trim()).length;

  return (
    <>
      {!isPersonalContext && defaultCohort && (
        <CohortAssignmentBanner
          isExternalOrg={isExternalOrg}
          isPersonalContext={isPersonalContext}
          activeGroupTitle={activeGroupTitle}
        />
      )}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">Review your devices before claiming.</p>
        <button onClick={onClear} className="text-xs text-red-600 hover:text-red-700 dark:text-red-400">Clear All</button>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {bulkDevices.map((device, index) => (
          <DeviceEntryRow
            key={index}
            index={index}
            deviceName={device.device_name}
            claimToken={device.claim_token}
            onDeviceNameChange={(val) => onDeviceChange(index, 'device_name', val)}
            onClaimTokenChange={(val) => onDeviceChange(index, 'claim_token', val)}
            onRemove={() => onRemoveDevice(index)}
            showRemove
          />
        ))}
      </div>
      <div className="flex gap-3">
        <ReusableButton Icon={Plus} onClick={onAddDevice} variant="outlined" className="flex-1">Add Row</ReusableButton>
        <div className="flex-1">
          <FileUploadParser onFilesParsed={(devices) => onFileImport([...bulkDevices, ...devices])} />
        </div>
      </div>
      {error && <ErrorAlert message={error} />}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        <span className="font-medium">{validCount}</span> device(s) ready to claim
      </div>
    </>
  );
};

export default BulkInputStep;