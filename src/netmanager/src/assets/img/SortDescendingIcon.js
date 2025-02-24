import React from "react";

export const SortDescendingIcon = ({ className, width, style, onClick }) => {
  return (
    <svg
      className={className || ""}
      onClick={onClick}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      width={width || "24"}
      height="24"
      viewBox="0 0 24 24"
    >
      <path d="M19,7H22L18,3L14,7H17V21H19M2,17H12V19H2M6,5V7H2V5M2,11H9V13H2V11Z" />
    </svg>
  );
};
