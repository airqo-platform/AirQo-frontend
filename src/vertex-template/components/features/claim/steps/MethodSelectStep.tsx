import { 
  // Smartphone, 
  // FileSpreadsheet, 
  Database } from 'lucide-react';
import { ClaimFlowMode, FlowStep } from '../claim-device-modal';

interface MethodSelectStepProps {
  onSelect: (step: FlowStep) => void;
  mode?: ClaimFlowMode;
}

const ALL_METHODS = [
  {
    step: 'cohort-import' as FlowStep,
    icon: (
      <Database className="w-5 h-5 text-violet-600 dark:text-violet-400" />
    ),
    iconBg:
      'bg-violet-100 dark:bg-violet-900/40 group-hover:bg-violet-200 dark:group-hover:bg-violet-800',
    border:
      'hover:border-violet-500 dark:hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20',
    title: 'Import from Cohort',
    desc: 'Enter a Cohort ID to prefill devices.',
    modes: ['guided', 'fast'] as ClaimFlowMode[],
  },
  /*
  {
    step: 'qr-scan' as FlowStep,
    icon: <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    iconBg:
      'bg-blue-100 dark:bg-blue-900/40 group-hover:bg-blue-200 dark:group-hover:bg-blue-800',
    border:
      'hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20',
    title: 'Add Single Device',
    desc: 'Scan a QR code or manually enter a Device ID.',
    modes: ['guided', 'fast'] as ClaimFlowMode[],
  },
  {
    step: 'bulk-input' as FlowStep,
    icon: (
      <FileSpreadsheet className="w-5 h-5 text-green-600 dark:text-green-400" />
    ),
    iconBg:
      'bg-green-100 dark:bg-green-900/40 group-hover:bg-green-200 dark:group-hover:bg-green-800',
    border:
      'hover:border-green-500 dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20',
    title: 'Add Multiple Devices',
    desc: 'Upload a CSV file or enter a list of IDs for bulk setup.',
    modes: ['guided', 'fast'] as ClaimFlowMode[],
  },
  */
];

const MethodSelectStep = ({ onSelect, mode = 'fast' }: MethodSelectStepProps) => {
  const visibleMethods = ALL_METHODS.filter(m => m.modes.includes(mode));

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Choose how you would like to add your device(s).
      </p>
      <div className="grid grid-cols-1 gap-4">
        {visibleMethods.map(({ step, icon, iconBg, border, title, desc }) => (
          <button
            key={step}
            onClick={() => onSelect(step)}
            className={`flex items-center p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg ${border} transition-colors text-left w-full group`}
          >
            <div
              className={`p-2 ${iconBg} rounded-full transition-colors mr-4 shrink-0`}
            >
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

export default MethodSelectStep;