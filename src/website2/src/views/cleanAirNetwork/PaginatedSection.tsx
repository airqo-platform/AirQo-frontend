import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ReactNode, useState } from 'react';

import mainConfig from '@/configs/mainConfigs';
import { cn } from '@/lib/utils';

import { Pagination } from '../../components/ui';

const logosPerPage = 8;

type PaginatedSectionProps = {
  title?: ReactNode;
  description?: ReactNode;
  logos: any[];
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

          <div className="w-full flex justify-start">
            <div
              className={cn(
                'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 w-full',
                sectionClassName,
              )}
            >
              {paginatedLogos.map((partner, index) => (
                <div
                  key={index}
                  onClick={() =>
                    !noClick && router.push(`/partners/${partner.id}`)
                  }
                  className="flex justify-center items-center cursor-pointer overflow-hidden w-full h-[144px] border border-gray-300 px-2 py-4"
                >
                  <Image
                    src={partner.logoUrl}
                    alt={'logo'}
                    width={271}
                    height={144}
                    className="object-contain w-full h-full max-h-[144px] min-w-[271px] p-3 max-w-[271px] mix-blend-multiply transition-transform duration-500 ease-in-out transform hover:scale-110"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Conditional Pagination */}
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
