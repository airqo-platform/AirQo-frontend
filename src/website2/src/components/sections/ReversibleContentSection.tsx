import Image from 'next/image';
import React from 'react';

import { cn } from '@/lib/utils';
import { Link } from '@/navigation';

type ReversibleContentSectionProps = {
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  imageUrl: string;
  reverse?: boolean;
  backgroundColor?: string;
  subtitleColor?: string;
  subtitleBgColor?: string;
  leftWidth?: string;
  rightWidth?: string;
  imageClassName?: string;
};

const ReversibleContentSection: React.FC<ReversibleContentSectionProps> = ({
  title,
  subtitle,
  description,
  buttonText,
  buttonLink,
  imageUrl,
  reverse = false,
  backgroundColor = 'bg-[#f0f4fa]',
  subtitleColor = 'text-blue-600',
  subtitleBgColor = 'bg-blue-100',
  leftWidth = 'lg:w-1/2',
  rightWidth = 'lg:w-1/2',
  imageClassName = 'object-contain lg:object-cover',
}) => {
  const isExternalLink = buttonLink.startsWith('https');
  return (
    <section className={cn(backgroundColor, 'py-16 px-4')}>
      <div
        className={cn(
          'max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 px-6',
          reverse && 'lg:flex-row-reverse',
        )}
      >
        {/* Content Section */}
        <div
          className={cn(leftWidth, 'w-full text-center lg:text-left space-y-8')}
        >
          <span
            className={cn(
              'inline-block text-sm font-medium py-1 px-3 rounded-full',
              subtitleColor,
              subtitleBgColor,
            )}
          >
            {subtitle}
          </span>
          <h2 className="text-3xl lg:text-5xl font-medium text-gray-900">
            {title}
          </h2>
          <p className="text-lg text-gray-600">{description}</p>

          <button
            onClick={() => {}}
            className="inline-block text-blue-600 font-medium hover:underline mt-4"
          >
            {isExternalLink ? (
              <a href={buttonLink} target="_blank" rel="noopener noreferrer">
                {buttonText} →
              </a>
            ) : (
              <Link href={buttonLink}>{buttonText} →</Link>
            )}
          </button>
        </div>

        {/* Image Section */}
        <div
          className={cn(
            rightWidth,
            'w-full flex justify-center lg:justify-end',
          )}
        >
          <div className="relative w-full h-80 sm:h-[400px] md:h-[450px] lg:h-[500px] xl:h-[550px] overflow-hidden">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className={cn(imageClassName)}
              priority
              loading="eager"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReversibleContentSection;
