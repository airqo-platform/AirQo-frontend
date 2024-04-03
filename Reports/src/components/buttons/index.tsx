import React, { ReactNode, MouseEvent } from 'react'

interface ButtonProps {
  backgroundColor: string
  icon?: ReactNode
  text: React.ReactNode
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  backgroundColor,
  icon,
  text,
  onClick,
  disabled,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        backgroundColor,
      }}
      className={`text-white font-bold py-2 px-4 rounded transition-all duration-300 flex items-center justify-center space-x-2 hover:shadow-lg ${
        disabled ? 'cursor-not-allowed opacity-50' : ''
      }`}
    >
      {icon && <span>{icon}</span>}
      {text && (
        <span className={`${icon ? 'hidden md:inline' : ''}`}>{text}</span>
      )}
    </button>
  )
}
