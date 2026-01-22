import { cn } from '@/lib/utils';

import type { DataType } from '../types';

interface BillboardHeaderProps {
  hideControls?: boolean;
  dataType: DataType;
  onDataTypeChange: (type: DataType) => void;
}

const BillboardHeader = ({
  hideControls,
  dataType,
  onDataTypeChange,
}: BillboardHeaderProps) => {
  if (hideControls) return null;

  return (
    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <div className="font-bold text-lg sm:text-xl">Air Quality</div>
        <div className="text-xs sm:text-sm opacity-90 flex items-center gap-2 flex-wrap">
          <span>
            {new Date().toLocaleDateString([], {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
          <span>
            {new Date().toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>

      {/* Data Type Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => onDataTypeChange('cohort')}
          className={cn(
            'px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-xs sm:text-sm',
            dataType === 'cohort'
              ? 'bg-white text-blue-600 shadow-lg'
              : 'bg-blue-500/50 text-white hover:bg-blue-500/70',
          )}
        >
          Cohort
        </button>
        <button
          onClick={() => onDataTypeChange('grid')}
          className={cn(
            'px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-xs sm:text-sm',
            dataType === 'grid'
              ? 'bg-white text-blue-600 shadow-lg'
              : 'bg-blue-500/50 text-white hover:bg-blue-500/70',
          )}
        >
          Grid
        </button>
      </div>
    </div>
  );
};

export default BillboardHeader;
