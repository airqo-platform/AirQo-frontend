'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { ReactNode } from 'react';

import { CustomButton } from '@/components/ui';
import { cn } from '@/lib/utils';

interface ContentSectionProps {
  subtitle?: string;
  title: string;
  description: ReactNode;
  buttonText?: string;
  buttonLink?: string;
  imgSrc: string;
  imgAlt: string;
  reverse?: boolean;
  titleClassName?: string;
  contentClassName?: string;
  buttonClassName?: string;
}

const ContentSection: React.FC<ContentSectionProps> = ({
  subtitle,
  title,
  description,
  buttonText,
  buttonLink,
  imgSrc,
  imgAlt,
  reverse = false,
  titleClassName,
  contentClassName,
  buttonClassName,
}) => {
  const router = useRouter();

  return (
    <section className="w-full py-16 px-4 lg:px-0">
      <div
        className={cn(
          'flex flex-col lg:gap-12 items-center',
          reverse ? 'lg:flex-row-reverse' : 'lg:flex-row',
        )}
      >
        {/* Image Section */}
        <div className="flex-1 flex justify-center items-center w-full mb-8 lg:mb-0">
          <Image
            src={imgSrc}
            alt={imgAlt}
            width={600}
            height={482}
            layout="responsive"
            objectFit="cover"
            loading="eager"
            className="rounded-lg shadow-sm w-full max-w-[600px] max-h-[482px]"
          />
        </div>

        {/* Text Content Section */}
        <div className={cn('flex-1 w-full', contentClassName)}>
          {subtitle && (
            <span className="text-blue-600 text-[14px] bg-blue-50 rounded-full py-1 px-4 font-semibold mb-2 inline-block">
              {subtitle}
            </span>
          )}
          <h2 className={cn('text-4xl font-medium', titleClassName)}>
            {title}
          </h2>
          <div className="text-lg text-gray-600 mb-6">{description}</div>
          {buttonText && buttonLink && (
            <CustomButton
              onClick={() => router.push(buttonLink)}
              className={cn('text-white  rounded-lg', buttonClassName)}
            >
              {buttonText}
            </CustomButton>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContentSection;
