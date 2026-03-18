import { AqWifi, AqWifiOff } from '@airqo/icons-react';
import React from 'react';

interface MonitorNodeProps {
  isOnline: boolean;
  ringColor: string;
  count?: number;
  selected?: boolean;
}

const MonitorNode: React.FC<MonitorNodeProps> = ({
  isOnline,
  ringColor,
  count,
  selected = false,
}) => {
  return (
    <div
      className={`relative transition-transform ${selected ? 'scale-110' : ''}`}
    >
      <span
        className={`grid h-11 w-11 place-items-center rounded-full border-2 bg-white shadow-md ${selected ? 'ring-4 ring-blue-200' : ''}`}
        style={{ borderColor: ringColor }}
      >
        <span style={{ color: ringColor }}>
          {isOnline ? (
            <AqWifi className="h-5 w-5" />
          ) : (
            <AqWifiOff className="h-5 w-5" />
          )}
        </span>
      </span>
      {!!count && count > 1 && (
        <span className="absolute -right-1 -top-1 rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-bold text-white">
          +{count - 1}
        </span>
      )}
    </div>
  );
};

export default MonitorNode;
