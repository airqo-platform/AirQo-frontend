import * as React from 'react';

function LineChartIcon({
  size = 16,
  strokeWidth = 1.2,
  className = '',
  ...props
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M14 14H3.067c-.374 0-.56 0-.703-.073a.667.667 0 01-.291-.291C2 13.493 2 13.306 2 12.933V2m11.333 3.333l-2.612 2.789c-.1.105-.149.158-.209.186a.333.333 0 01-.168.028c-.065-.005-.13-.039-.258-.106L7.914 7.103c-.128-.067-.193-.1-.258-.106a.333.333 0 00-.169.029c-.06.027-.109.08-.208.186L4.667 10"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default LineChartIcon;
