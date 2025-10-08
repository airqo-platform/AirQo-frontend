import PropTypes from 'prop-types';

const CustomDot = ({ cx, cy, fill, payload }) =>
  payload?.active ? <circle cx={cx} cy={cy} r={6} fill={fill} /> : null;

CustomDot.propTypes = {
  cx: PropTypes.number,
  cy: PropTypes.number,
  fill: PropTypes.string,
  payload: PropTypes.object,
};

export default CustomDot;
