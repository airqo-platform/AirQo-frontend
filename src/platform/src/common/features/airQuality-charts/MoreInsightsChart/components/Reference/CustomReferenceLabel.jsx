import PropTypes from 'prop-types';

const LABEL_WIDTH = 40;
const LABEL_HEIGHT = 25;
const BG_COLOR = '#ef4444'; // Tailwind bg-red-500
const TEXT_COLOR = '#fff';
const FONT_SIZE = 12;

const CustomReferenceLabel = ({ viewBox, name }) => {
  const x = viewBox.x + viewBox.width - LABEL_WIDTH;
  const y = viewBox.y;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={LABEL_WIDTH}
        height={LABEL_HEIGHT}
        fill={BG_COLOR}
        rx={4}
        ry={4}
        opacity={0.95}
      />
      <text
        x={x + LABEL_WIDTH / 2}
        y={y + LABEL_HEIGHT / 2 + 4}
        textAnchor="middle"
        alignmentBaseline="middle"
        fill={TEXT_COLOR}
        fontSize={FONT_SIZE}
        fontFamily="inherit"
        fontWeight="bold"
        pointerEvents="none"
      >
        {name}
      </text>
    </g>
  );
};

CustomReferenceLabel.propTypes = {
  viewBox: PropTypes.object,
  name: PropTypes.string,
};

export default CustomReferenceLabel;
