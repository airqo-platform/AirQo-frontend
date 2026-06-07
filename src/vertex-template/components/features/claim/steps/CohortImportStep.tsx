import ReusableInputField from "@/components/shared/inputfield/ReusableInputField";
import { Loader2 } from "lucide-react";

const CohortImportStep = ({
  cohortIdInput,
  onChange,
  error,
  isImporting,
}: {
  cohortIdInput: string;
  onChange: (val: string) => void;
  error: string | null;
  isImporting: boolean;
}) => (
  <div className="space-y-6">
    <p className="text-sm text-gray-500 dark:text-gray-400">Enter the Cohort ID to automatically load its devices.</p>
    <ReusableInputField
      label="Cohort ID"
      placeholder="Enter Cohort ID"
      value={cohortIdInput}
      onChange={(e) => onChange(e.target.value)}
      error={error || undefined}
    />
    {isImporting && (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        <span className="ml-2 text-sm text-gray-500">Verifying Cohort ID...</span>
      </div>
    )}
  </div>
);

export default CohortImportStep;