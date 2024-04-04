import React from 'react'

interface BackArrowProps {
  width?: number
  height?: number
  fill?: string
}

const BackArrow: React.FC<BackArrowProps> = ({
  width = 24,
  height = 24,
  fill,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill={fill || 'none'}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="back-icon back-icon-tabler icons-tabler-outline back-icon-tabler-arrow-left"
    >
      <path d="M0 0h24v24H0z" stroke="none" />
      <path d="M5 12h14M5 12l6 6M5 12l6-6" />
    </svg>
  )
}

export default BackArrow
