import React from 'react';

interface MonitorNodeProps {
  ringColor: string;
  count?: number;
  selected?: boolean;
}

const MonitorNode: React.FC<MonitorNodeProps> = ({
  ringColor,
  count,
  selected = false,
}) => {
  return (
    <div
      className={`relative transition-transform ${selected ? 'scale-110' : ''}`}
    >
      <span
        className={`grid h-11 w-11 place-items-center rounded-full border-2 bg-white shadow-sm ${
          selected ? 'ring-4 ring-blue-200' : ''
        }`}
        style={{ borderColor: ringColor }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: 9999,
            background: ringColor,
            display: 'block',
          }}
        />
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
