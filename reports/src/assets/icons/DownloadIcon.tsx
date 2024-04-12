import React from 'react'

interface DownloadIconProps {
  width?: number
  height?: number
}

const DownloadIcon: React.FC<DownloadIconProps> = ({
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
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="icon icon-tabler icons-tabler-outline icon-tabler-server-cog"
    >
      <path d="M8 17l4 4m0 0l4-4m-4 4v-9m8 4.743A5.5 5.5 0 0016.5 7a.62.62 0 01-.534-.302 7.5 7.5 0 10-11.78 9.096" />
    </svg>
  )
}

export default DownloadIcon
