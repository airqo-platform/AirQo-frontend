import Image from 'next/image';
import React from 'react';

import mainConfig from '@/configs/mainConfigs';
import { cn } from '@/lib/utils';

type AnalyticsContentSectionProps = {
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  imageUrl: string;
  backgroundColor?: string;
  subtitleColor?: string;
  subtitleBgColor?: string;
};

const AnalyticsContentSection: React.FC<AnalyticsContentSectionProps> = ({
  title,
  subtitle,
  description,
  buttonText,
  buttonLink,
  imageUrl,
  backgroundColor = 'bg-[#f0f4fa]',
  subtitleColor = 'text-gray-900',
  subtitleBgColor = 'bg-gray-200',
}) => {
  return (
    <section className={cn(backgroundColor, 'pt-16 px-4')}>
      <div
        className={`${mainConfig.containerClass} flex flex-col items-center gap-4`}
      >
        {/* Top Text Section */}
        <div className="flex flex-col lg:flex-row w-full items-start lg:items-center lg:justify-between gap-8 lg:gap-12">
          <div className="lg:w-1/2 w-full space-y-6 text-center lg:text-left">
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
          </div>
          <div className="lg:w-1/2 space-y-4 text-center lg:text-left">
            <p className="text-lg text-gray-600">{description}</p>
            <a
              href={buttonLink}
              className="inline-block text-blue-600 font-medium hover:underline mt-4"
            >
              {buttonText} →
            </a>
          </div>
        </div>

        {/* Image Section */}
        <div className="w-full flex justify-center overflow-hidden">
          <div className="relative md:top-16 w-full max-w-5xl h-[200px] md:h-[500px] lg:h-[600px]">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-contain"
              priority
              loading="eager"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnalyticsContentSection;
