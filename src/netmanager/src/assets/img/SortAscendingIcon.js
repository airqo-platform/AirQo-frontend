import React from "react";

export const SortAscendingIcon = ({ className, width, style, onClick }) => {
  return (
    <svg
      className={className || ""}
      onClick={onClick}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      width={width || "24"}
      viewBox="0 0 24 24"
    >
      <path d="M19,17H22L18,21L14,17H17V3H19M2,17H12V19H2M6,5V7H2V5M2,11H9V13H2V11Z" />
    </svg>
  );
};
