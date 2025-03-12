import type * as React from "react"

interface IconButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  title: string
  icon: React.ReactNode
}

export const IconButton: React.FC<IconButtonProps> = ({ onClick, title, icon }) => {
  return (
    <button
      onClick={onClick}
      title={title}
      className="inline-flex items-center justify-center p-2 md:p-3 mr-2 text-gray-600 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md"
    >
      {icon}
    </button>
  )
}
