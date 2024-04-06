import React from 'react'

interface ShareIconProps {
  width?: number
  height?: number
}

const ShareIcon: React.FC<ShareIconProps> = ({ width = 24, height = 24 }) => {
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
      <path d="M7 11c-.93 0-1.395 0-1.776.102a3 3 0 00-2.122 2.121C3 13.605 3 14.07 3 15v1.2c0 1.68 0 2.52.327 3.162a3 3 0 001.311 1.311C5.28 21 6.12 21 7.8 21h8.4c1.68 0 2.52 0 3.162-.327a3 3 0 001.311-1.311C21 18.72 21 17.88 21 16.2V15c0-.93 0-1.395-.102-1.777a3 3 0 00-2.122-2.12C18.395 11 17.93 11 17 11m-1-4l-4-4m0 0L8 7m4-4v12" />
    </svg>
  )
}

export default ShareIcon
