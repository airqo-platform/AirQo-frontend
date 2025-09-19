import Image from 'next/image';
import React from 'react';

interface LogoDisplayProps {
  logos: Array<{
    id: any;
    logoUrl: any;
  }>;
  sectionClassName?: string;
  noClick?: boolean;
}

const LogoDisplay: React.FC<LogoDisplayProps> = ({
  logos,
  sectionClassName = 'grid grid-cols-1 lg:grid-cols-2 w-full',
}) => {
  if (!logos || logos.length === 0) {
    return null;
  }

  return (
    // add top padding to ensure logos don't touch separators/dividers
    <div className={`${sectionClassName} pt-6`}>
      {logos.map((logo) => (
        <div
          key={logo.id}
          className="flex items-center justify-center p-6 border border-gray-200"
        >
          <Image
            src={logo.logoUrl || '/assets/images/placeholder.webp'}
            alt="Partner logo"
            width={150}
            height={80}
            className="object-contain"
          />
        </div>
      ))}
    </div>
  );
};

export default LogoDisplay;
