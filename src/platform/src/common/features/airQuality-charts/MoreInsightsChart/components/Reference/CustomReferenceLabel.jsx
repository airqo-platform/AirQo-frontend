import PropTypes from 'prop-types';

const CustomReferenceLabel = ({ viewBox, name }) => (
  <g>
    <foreignObject
      x={viewBox.x + viewBox.width - 40}
      y={viewBox.y}
      width={40}
      height={25}
    >
      <div
        xmlns="http://www.w3.org/1999/xhtml"
        className="flex justify-center items-center text-white text-sm bg-red-500"
        style={{ width: '100%', height: '100%', padding: '0.25rem' }}
      >
        {name}
      </div>
    </foreignObject>
  </g>
);

CustomReferenceLabel.propTypes = {
  viewBox: PropTypes.object,
  name: PropTypes.string,
};

export default CustomReferenceLabel;
