const ArrowDropDownIcon = ({ fillColor, width, height }) => (
  <svg
    width={width || '10'}
    height={height || '6'}
    viewBox="0 0 10 6"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 5.49219L0 0.492188H10L5 5.49219Z"
      fill={fillColor || '#1C1B1F'}
    />
  </svg>
);

export default ArrowDropDownIcon;
