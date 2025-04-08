import React from 'react';

/**
 * SelectionMessage Component
 * A reusable component for displaying selection information and guidance messages
 * with customizable colors and styling.
 *
 * @param {Object} props - Component props
 * @param {string} props.type - Message type: 'info', 'success', 'warning', 'error'
 * @param {ReactNode} props.children - Message content
 * @param {Function} [props.onClear] - Optional clear function that shows a clear button
 * @param {string} [props.clearText] - Text for the clear button (default: "Clear")
 * @param {string} [props.className] - Additional CSS classes
 */
const SelectionMessage = ({
  type = 'info',
  children,
  onClear,
  clearText = 'Clear',
  className = '',
}) => {
  // Define color schemes based on message type
  const colorSchemes = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-400',
      text: 'text-blue-800',
      buttonHover: 'hover:text-blue-800',
      buttonText: 'text-blue-600',
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-400',
      text: 'text-green-800',
      buttonHover: 'hover:text-green-800',
      buttonText: 'text-green-600',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-400',
      text: 'text-yellow-800',
      buttonHover: 'hover:text-yellow-800',
      buttonText: 'text-yellow-600',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-400',
      text: 'text-red-800',
      buttonHover: 'hover:text-red-800',
      buttonText: 'text-red-600',
    },
  };

  // Get color scheme based on type
  const colors = colorSchemes[type] || colorSchemes.info;

  return (
    <div
      className={`mb-4 px-4 py-2 ${colors.bg} border-l-4 ${colors.border} rounded-md ${className} ${onClear ? 'flex justify-between items-center' : ''}`}
    >
      <div className={`${colors.text} text-sm`}>{children}</div>

      {onClear && (
        <button
          onClick={onClear}
          className={`flex items-center ${colors.buttonText} ${colors.buttonHover} text-sm font-medium`}
          aria-label={clearText}
          type="button"
        >
          {clearText}
        </button>
      )}
    </div>
  );
};

export default SelectionMessage;
