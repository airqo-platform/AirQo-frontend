import Image from 'next/image';
import React from 'react';

interface Logo {
  id: any;
  logoUrl: any;
  link?: string | null;
}

interface PaginatedSectionProps {
  logos: Logo[];
  sectionClassName?: string;
  noClick?: boolean;
}

const PaginatedSection: React.FC<PaginatedSectionProps> = ({
  logos,
  sectionClassName = 'grid grid-cols-1 lg:grid-cols-2 w-full',
}) => {
  if (!logos || logos.length === 0) {
    return null;
  }

  return (
    // add top padding so logos don't sit flush against dividers
    <div className={`${sectionClassName} pt-6`}>
      {logos.map((logo) => (
        <div
          key={logo.id}
          className="flex items-center justify-center p-6 border border-gray-200"
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

export default PaginatedSection;
