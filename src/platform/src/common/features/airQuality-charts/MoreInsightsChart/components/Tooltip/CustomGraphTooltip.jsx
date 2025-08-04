import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { getAQICategoryKey, categoryDetails } from '../../utils/aqiUtils';

const reduceDecimalPlaces = (n) =>
  Math.round((n + Number.EPSILON) * 10000) / 10000;
const truncate = (s) => (s.length > 20 ? `${s.slice(0, 19)}…` : s);

const CustomGraphTooltip = ({
  active,
  payload,
  activeIndex,
  pollutionType = 'pm2_5',
}) => {
  if (!active || !payload?.length) return null;

  const hoveredIdx =
    activeIndex != null && activeIndex < payload.length ? activeIndex : 0;
  const hovered = payload[hoveredIdx];
  const { value, payload: p } = hovered;

  const date = p?.time ? format(new Date(p.time), 'MMM dd, yyyy') : '';
  const {
    text,
    icon: Icon,
    color,
  } = categoryDetails[getAQICategoryKey(value, pollutionType)] || {};

  return (
    <div className="w-60 p-2.5 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* date */}
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">
        {date}
      </div>

      {/* readings */}
      <div className="space-y-1">
        {payload.map((pt, idx) => {
          const isHovered = idx === hoveredIdx;
          return (
            <div
              key={idx}
              className={`flex justify-between items-center px-1.5 py-1 rounded transition-colors ${
                isHovered ? 'bg-primary/5 dark:bg-primary/10' : ''
              }`}
            >
              <div className="flex items-center">
                <span
                  className={`w-2 h-2 rounded-full mr-1.5 ${
                    isHovered ? 'bg-primary' : 'bg-gray-400'
                  }`}
                />
                <span
                  className={`text-xs font-medium ${
                    isHovered
                      ? 'text-primary'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {truncate(pt.name || '--')}
                </span>
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {reduceDecimalPlaces(pt.value)}
              </span>
            </div>
          );
        })}
      </div>

      {/* unit label */}
      <div className="text-[0.7rem] text-gray-400 dark:text-gray-500 text-right -mt-0.5 mb-1.5">
        μg/m³
      </div>

      {/* AQI summary */}
      <div className="flex items-center space-x-1.5 pt-1.5 mt-1 border-t border-gray-200 dark:border-gray-700">
        {Icon && (
          <div className="w-4 h-4 flex items-center justify-center">
            <Icon />
          </div>
        )}
        <span className={`text-xs font-semibold ${color}`}>{text}</span>
      </div>
    </div>
  );
};

CustomGraphTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  activeIndex: PropTypes.number,
  pollutionType: PropTypes.string,
};

export default CustomGraphTooltip;
