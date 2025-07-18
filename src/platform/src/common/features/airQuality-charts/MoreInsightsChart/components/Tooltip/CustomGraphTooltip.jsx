import PropTypes from 'prop-types';
import { format } from 'date-fns';

// helpers
const reduceDecimalPlaces = (num) =>
  Math.round((num + Number.EPSILON) * 10000) / 10000;

const truncate = (str) => (str.length > 20 ? `${str.slice(0, 19)}…` : str);

// dummy category map – replace with real ranges if available
const categoryMap = {
  Good: { text: 'Good', color: 'text-green-600' },
  Moderate: { text: 'Moderate', color: 'text-yellow-600' },
  Unhealthy: { text: 'Unhealthy', color: 'text-red-600' },
};

const getAirQualityLevelText = (value) => {
  if (typeof value !== 'number' || isNaN(value) || value < 0)
    return categoryMap.Good; // fallback
  if (value <= 50) return categoryMap.Good;
  if (value <= 100) return categoryMap.Moderate;
  return categoryMap.Unhealthy;
};

const CustomGraphTooltip = ({
  active,
  payload,
  activeIndex,
  //   pollutionType,
}) => {
  if (!active || !payload?.length) return null;

  const hoveredPointIndex =
    activeIndex !== null && activeIndex < payload.length ? activeIndex : 0;
  const hoveredPoint = payload[hoveredPointIndex];
  const { value, payload: pointPayload } = hoveredPoint;
  const formattedDate = pointPayload?.time
    ? format(new Date(pointPayload.time), 'MMMM dd, yyyy')
    : '';

  const { text, color } = getAirQualityLevelText(value);

  return (
    <div className="w-80 p-3 rounded-lg shadow-md border border-gray-200 dark:bg-gray-800 dark:border-gray-600 bg-white">
      <div className="text-sm mb-2 text-gray-400 dark:text-gray-300">
        {formattedDate}
      </div>

      <div className="space-y-2">
        {payload.map((point, idx) => {
          const isHovered = idx === hoveredPointIndex;
          return (
            <div
              key={idx}
              className={`flex justify-between items-center p-2 rounded-md transition-colors ${
                isHovered ? 'bg-primary/10 dark:bg-primary/20' : ''
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`w-2.5 h-2.5 rounded-full mr-3 transition-colors ${
                    isHovered ? 'bg-primary' : 'bg-gray-400'
                  }`}
                />
                <span
                  className={`text-sm font-medium transition-colors ${
                    isHovered
                      ? 'text-primary'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {truncate(point.name)}
                </span>
              </div>
              <span
                className={`text-sm transition-colors ${
                  isHovered ? 'text-primary font-medium' : 'text-gray-500'
                }`}
              >
                {reduceDecimalPlaces(point.value)} μg/m³
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-300 dark:border-gray-600">
        <div className={`text-sm font-medium ${color}`}>{text}</div>
      </div>
    </div>
  );
};

CustomGraphTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  activeIndex: PropTypes.number,
  pollutionType: PropTypes.string.isRequired,
};

export default CustomGraphTooltip;
