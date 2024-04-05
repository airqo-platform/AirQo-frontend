import React from 'react'

interface RefreshIconProps {
  width?: number
  height?: number
}

export const RefreshIcon: React.FC<RefreshIconProps> = ({
  width = 24,
  height = 24,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="icon icon-tabler icons-tabler-outline icon-tabler-rotate"
    >
      <path d="M0 0h24v24H0z" stroke="none" />
      <path d="M19.95 11a8 8 0 10-.5 4m.5 5v-5h-5" />
    </svg>
  )
}
