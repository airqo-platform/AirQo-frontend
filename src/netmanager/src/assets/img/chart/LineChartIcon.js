import React from "react";

export const LineChartIcon = ({ className, style, width, onClick }) => {
  return (
    <svg
      className={className || ""}
      style={style || {}}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={width || "24"}
      onClick={onClick}
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" />
    </svg>
  );
};
