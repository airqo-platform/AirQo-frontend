import { mutate } from 'swr';

import type { DataType } from '../types';

interface ErrorDisplayProps {
  type: 'summary' | 'measurements';
  dataType: DataType;
  selectedItem?: any;
  cohortsParams?: any;
  gridsParams?: any;
}

const ErrorDisplay = ({
  type,
  dataType,
  selectedItem,
  cohortsParams,
  gridsParams,
}: ErrorDisplayProps) => {
  const handleRetry = () => {
    if (type === 'summary') {
      if (dataType === 'cohort') {
        mutate(`cohortsSummary-${JSON.stringify(cohortsParams)}`);
      } else {
        mutate(`gridsSummary-${JSON.stringify(gridsParams)}`);
      }
    } else {
      if (selectedItem) {
        if (dataType === 'cohort') {
          mutate(
            `cohortMeasurements-${selectedItem._id}-${JSON.stringify({ limit: 80 })}`,
          );
        } else {
          mutate(
            `gridMeasurements-${selectedItem._id}-${JSON.stringify({ limit: 80 })}`,
          );
        }
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] text-white">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">
          {type === 'summary' ? 'Connection Error' : 'Data Unavailable'}
        </h2>
        <p className="text-lg opacity-90 mb-4">
          {type === 'summary'
            ? 'Unable to load air quality data. Please check your connection and try again.'
            : `Unable to load air quality measurements for this ${dataType}. Please try again.`}
        </p>
        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
};

export default ErrorDisplay;
