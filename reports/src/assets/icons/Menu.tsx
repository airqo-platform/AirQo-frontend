import React from 'react'

interface MenuProps {
  width?: number
  height?: number
}

const Menu: React.FC<MenuProps> = ({ width = 24, height = 24 }) => {
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
      className="icon icon-tabler icons-tabler-outline icon-tabler-menu"
    >
      <path d="M0 0h24v24H0z" stroke="none" />
      <path d="M4 8h16M4 16h16" />
    </svg>
  )
}

export default Menu
