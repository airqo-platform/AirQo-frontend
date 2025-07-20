import PropTypes from 'prop-types';

const ImprovedAxisTick = ({ x, y, payload, fill, frequency }) => {
  const date = new Date(payload.value);
  let label;
  switch (frequency) {
    case 'hourly':
      label = date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      break;
    case 'daily':
      label = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      break;
    case 'weekly':
      label = `W${Math.ceil(date.getDate() / 7)} ${date.toLocaleDateString([], {
        month: 'short',
      })}`;
      break;
    case 'monthly':
      label = date.toLocaleDateString([], { month: 'short', year: '2-digit' });
      break;
    default:
      label = date.toLocaleDateString();
  }

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="middle"
        fill={fill}
        fontSize={12}
        className="chart-tick-text"
      >
        {label}
      </text>
    </g>
  );
};

ImprovedAxisTick.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  payload: PropTypes.object,
  fill: PropTypes.string,
  frequency: PropTypes.oneOf(['hourly', 'daily', 'weekly', 'monthly']),
};

export default ImprovedAxisTick;
