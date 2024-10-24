const MenuBarIcon = ({ width, height, fill }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width || 24}
    height={height || 24}
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M3 12h18M3 6h18M9 18h12"
      stroke={fill || '#1C1D20'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default MenuBarIcon;
