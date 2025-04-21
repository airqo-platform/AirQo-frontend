function DeviceIcon({
  size = 16,
  strokeWidth = 1.5,
  className = '',
  ...props
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M1 12h20M7 19h8m-9.2-3h10.4c1.68 0 2.52 0 3.162-.327a3 3 0 001.311-1.311C21 13.72 21 12.88 21 11.2V5.8c0-1.68 0-2.52-.327-3.162a3 3 0 00-1.311-1.311C18.72 1 17.88 1 16.2 1H5.8c-1.68 0-2.52 0-3.162.327a3 3 0 00-1.311 1.311C1 3.28 1 4.12 1 5.8v5.4c0 1.68 0 2.52.327 3.162a3 3 0 001.311 1.311C3.28 16 4.12 16 5.8 16z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default DeviceIcon;
