import PropTypes from 'prop-types';

const CustomBar = ({ fill, x, y, width, height }) => (
  <g>
    <foreignObject x={x} y={y} width={width} height={height}>
      <div
        xmlns="http://www.w3.org/1999/xhtml"
        className="w-full h-full rounded"
        style={{ backgroundColor: fill }}
      />
    </foreignObject>
  </g>
);

CustomBar.propTypes = {
  fill: PropTypes.string,
  x: PropTypes.number,
  y: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
};

export default CustomBar;
