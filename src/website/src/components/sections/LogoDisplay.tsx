import Image from 'next/image';
import React from 'react';

interface LogoDisplayProps {
  logos: Array<{
    id: any;
    logoUrl: any;
    link?: string | null;
    onClick?: () => void;
  }>;
  sectionClassName?: string;
  noClick?: boolean;
  columns?: number; // Add columns prop to control layout
}

const LogoDisplay: React.FC<LogoDisplayProps> = ({
  logos,
  sectionClassName,
  columns = 2, // Default to 2 columns
}) => {
  if (!logos || logos.length === 0) {
    return null;
  }

  // Dynamic grid classes based on columns prop
  const getGridClass = () => {
    switch (columns) {
      case 3:
        return 'grid grid-cols-1 lg:grid-cols-3 w-full';
      case 4:
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full';
      default:
        return 'grid grid-cols-1 lg:grid-cols-2 w-full';
    }
  };

  const gridClass = sectionClassName || getGridClass();

  return (
    // add top padding to ensure logos don't touch separators/dividers
    <div className={`${gridClass} pt-6`}>
      {logos.map((logo) => (
        <div
          key={logo.id}
          className={`flex items-center justify-center p-6 border border-gray-200 ${
            logo.onClick
              ? 'cursor-pointer hover:bg-gray-50 transition-colors'
              : ''
          }`}
          onClick={logo.onClick}
        >
          {logo.link ? (
            <a
              href={logo.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Image
                src={logo.logoUrl || '/assets/images/placeholder.webp'}
                alt="Partner logo"
                width={150}
                height={80}
                className="object-contain"
              />
            </a>
          ) : (
            <Image
              src={logo.logoUrl || '/assets/images/placeholder.webp'}
              alt="Partner logo"
              width={150}
              height={80}
              className="object-contain"
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default LogoDisplay;
