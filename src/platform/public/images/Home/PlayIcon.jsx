// src/icons/PlayIcon.jsx
import * as React from 'react';

/**
 * A circular “play” button icon whose fill follows `currentColor`.
 */
function PlayIcon({ size = 64, className = '', ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* use currentColor for the circle fill */}
      <circle cx={32} cy={32} r={32} fill="currentColor" />

      <path
        d="M44.713 30.434c1.2.693 1.2 2.426 0 3.119L27.004 43.777c-1.2.693-2.701-.173-2.701-1.56V21.77c0-1.386 1.5-2.252 2.701-1.56l17.709 10.225z"
        fill="#fff"
      />
    </svg>
  );
}

export default PlayIcon;
