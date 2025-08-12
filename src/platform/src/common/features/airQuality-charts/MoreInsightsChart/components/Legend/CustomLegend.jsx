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
