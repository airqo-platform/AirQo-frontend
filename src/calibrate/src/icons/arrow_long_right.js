import React from "react";

const arrowLongRightIconStyle = {
  width: "18px",
  height: "18px",
};

const arrow_long_right = () => {
  return (
    <svg
      style={arrowLongRightIconStyle}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
      />
    </svg>
  );
};

export default arrow_long_right;
