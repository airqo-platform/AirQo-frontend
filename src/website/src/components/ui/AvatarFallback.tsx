import React from 'react';

interface AvatarFallbackProps {
  name?: string;
  className?: string;
}

const AvatarFallback: React.FC<AvatarFallbackProps> = ({ name, className }) => {
  const initials = name
    ? name
        .split(' ')
        .filter((word) => word.length > 0)
        .map((word) => word[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'TM';

  return (
    <div
      className={`flex items-center justify-center bg-gray-300 text-gray-700 font-medium ${className}`}
    >
      {initials}
    </div>
  );
};

export default AvatarFallback;
