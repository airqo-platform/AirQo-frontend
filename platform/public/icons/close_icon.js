const CloseIcon = ({ width, height, fill, strokeWidth }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width={width || '24'}
    height={height || '24'}
    viewBox='0 0 24 24'
    fill={fill || 'none'}>
    <path
      d='M18 6L6 18M6 6L18 18'
      stroke={fill || '#536A87'}
      strokeWidth={strokeWidth || '1.5'}
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

export default CloseIcon;
