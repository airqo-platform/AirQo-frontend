import PropTypes from 'prop-types';
import { Tooltip } from 'flowbite-react';

const brightness = (hex) => {
  if (!hex) return 0;
  const color = hex.replace('#', '');
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const CustomLegend = ({
  payload,
  onMouseEnter,
  onMouseLeave,
  onClick,
  activeIndex,
}) => {
  const truncateLegend = payload.length > 3;

  const sorted = [...payload].sort(
    (a, b) => brightness(a.color) - brightness(b.color),
  );

  return (
    <div className="flex flex-wrap relative justify-end gap-2 w-full">
      {sorted.map((entry, idx) => {
        const isActive = activeIndex === null || activeIndex === idx;
        return (
          <div
            key={`legend-${idx}`}
            className={`flex items-center gap-1 text-xs dark:text-gray-300 whitespace-nowrap cursor-pointer transition-opacity duration-200 ${
              !isActive ? 'opacity-50' : 'opacity-100'
            }`}
            onMouseEnter={() => onMouseEnter(idx)}
            onMouseLeave={onMouseLeave}
            onClick={() => onClick(idx)}
          >
            <span
              className="w-3 h-3 rounded-full transition-transform duration-200"
              style={{
                backgroundColor: entry.color || 'var(--color-primary)',
                transform: isActive ? 'scale(1.2)' : 'scale(1)',
              }}
            />
            {truncateLegend ? (
              <Tooltip content={entry.value} className="w-auto">
                <div className="truncate max-w-[100px] text-gray-700 dark:text-gray-200">
                  {entry.value}
                </div>
              </Tooltip>
            ) : (
              <div className="text-gray-700 dark:text-gray-200">
                {entry.value}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

CustomLegend.propTypes = {
  payload: PropTypes.array.isRequired,
  onMouseEnter: PropTypes.func.isRequired,
  onMouseLeave: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
  activeIndex: PropTypes.number,
};

export default CustomLegend;
