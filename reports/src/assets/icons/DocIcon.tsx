import React from 'react'

interface Props {
  width?: number
  height?: number
}

const DocIcon: React.FC<Props> = ({ width = 20, height = 20 }) => {
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
      className="icon icon-tabler icons-tabler-outline icon-tabler-file-type-docx"
    >
      <path d="M0 0h24v24H0z" stroke="none" />
      <path d="M14 3v4a1 1 0 001 1h4" />
      <path d="M5 12V5a2 2 0 012-2h7l5 5v4M2 15v6h1a2 2 0 002-2v-2a2 2 0 00-2-2H2zM17 16.5a1.5 1.5 0 00-3 0v3a1.5 1.5 0 003 0M9.5 15a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 01-3 0v-3A1.5 1.5 0 019.5 15zM19.5 15l3 6M19.5 21l3-6" />
    </svg>
  )
}

export default DocIcon
