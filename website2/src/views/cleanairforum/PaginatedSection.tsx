'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { ReactNode, useState } from 'react';

import { Pagination } from '@/components/ui';
import mainConfig from '@/configs/mainConfigs';
import { cn } from '@/lib/utils';

const logosPerPage = 8;

type PaginatedSectionProps = {
  title?: ReactNode;
  description?: ReactNode;
  logos: {
    id?: number;
    logoUrl: string;
  }[];
  bgColor?: string;
  sectionClassName?: string;
  noClick?: boolean;
};

const PaginatedSection: React.FC<PaginatedSectionProps> = ({
  title,
  description,
  logos,
  bgColor = '',
  sectionClassName = '',
  noClick = false,
}) => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(logos.length / logosPerPage);

  const startIndex = (currentPage - 1) * logosPerPage;
  const paginatedLogos = logos.slice(startIndex, startIndex + logosPerPage);

  return (
    <section className={`${bgColor} py-14`}>
      <div className={`${mainConfig.containerClass} px-4 lg:px-0 w-full`}>
        <div className="flex flex-col gap-8 items-center">
          {title && description && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div>{title}</div>
              <div>{description}</div>
            </div>
          )}

          {/* Logo Grid */}
          <div className="w-full flex justify-center">
            <div
              className={cn(
                'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
                sectionClassName,
              )}
            >
              {paginatedLogos.map((partner, index) => (
                <div
                  key={partner.id ?? index}
                  onClick={() =>
                    !noClick && router.push(`/partners/${partner.id}`)
                  }
                  className="relative w-[271px] h-[144px] border border-gray-300 cursor-pointer overflow-hidden"
                >
                  <Image
                    src={partner.logoUrl}
                    alt="logo"
                    fill
                    sizes="(max-width: 768px) 100vw, 271px"
                    className="object-contain p-4 mix-blend-multiply transition-transform duration-500 ease-in-out hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          {logos.length > logosPerPage && (
            <div className="flex justify-center mt-8">
              <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PaginatedSection;
