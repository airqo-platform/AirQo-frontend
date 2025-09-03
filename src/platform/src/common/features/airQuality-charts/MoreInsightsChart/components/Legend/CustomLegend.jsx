import PropTypes from 'prop-types';
import { Tooltip } from 'flowbite-react';

// ...existing code...

const CustomLegend = ({
  payload,
  onMouseEnter,
  onMouseLeave,
  onClick,
  activeIndex,
}) => {
  // Keep legend order matching the series order so colors map consistently.
  const entries = Array.isArray(payload) ? payload : [];
  const truncateLegend = entries.length > 3;

  return (
    <div className="flex flex-wrap relative justify-end gap-2 w-full">
      {entries.map((entry, idx) => {
        const isActive = activeIndex === null || activeIndex === idx;
        return (
          <div
            key={`legend-${entry.dataKey || idx}`}
            className={`flex items-center gap-1.5 text-xs cursor-pointer transition-opacity duration-200 ${
              !isActive ? 'opacity-50' : 'opacity-100'
            }`}
            onMouseEnter={() => onMouseEnter(idx)}
            onMouseLeave={onMouseLeave}
            onClick={() => onClick(idx)}
          >
            <span
              className="w-2 h-2 rounded-full transition-transform duration-200"
              style={{
                backgroundColor: entry.color || 'var(--color-primary)',
                transform: isActive ? 'scale(1.1)' : 'scale(1)',
                // Add a thin border for contrast on light colors
                border: '1px solid rgba(0,0,0,0.12)',
                boxSizing: 'border-box',
              }}
            />
            {truncateLegend ? (
              <Tooltip content={entry.value} className="w-auto">
                <div className="truncate max-w-[80px]">{entry.value}</div>
              </Tooltip>
            ) : (
              <div>{entry.value}</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

CustomLegend.propTypes = {
  payload: PropTypes.arrayOf(
    PropTypes.shape({
      dataKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      value: PropTypes.string.isRequired,
      color: PropTypes.string,
    }),
  ).isRequired,
  onMouseEnter: PropTypes.func.isRequired,
  onMouseLeave: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
  activeIndex: PropTypes.number,
};

CustomLegend.defaultProps = {
  activeIndex: null,
};

export default CustomLegend;
