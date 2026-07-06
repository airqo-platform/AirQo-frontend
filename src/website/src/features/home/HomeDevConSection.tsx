import Image from 'next/image';
import Link from 'next/link';
import { FiArrowRight, FiExternalLink } from 'react-icons/fi';
import { FiCalendar, FiMapPin } from 'react-icons/fi';

import mainConfig from '@/config/site.config';
import { DEVCON_APPLY_URL, DEVCON_IMAGE_SRC, DEVCON_ROUTE } from '@/lib/devcon';

const HomeDevConSection = () => {
  return (
    <section className="bg-[#EDF3FF] px-4 py-12">
      <div
        className={`${mainConfig.containerClass} grid grid-cols-1 items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]`}
      >
        <div className="space-y-5 text-center lg:text-left">
          <span className="inline-block rounded-full bg-white px-3 py-1 text-sm font-medium text-blue-600">
            AirQo DevCon 2026
          </span>
          <h2 className="text-3xl font-medium leading-tight text-gray-900 lg:text-[40px]">
            Build the Future of Clean Air
          </h2>
          <p className="text-base leading-7 text-gray-600 lg:text-lg">
            A free, 2-day hands-on DevCon for students ready to build hardware,
            software, and AI systems for real air quality impact.
          </p>

          <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-medium text-blue-700 shadow-sm">
              <FiCalendar aria-hidden="true" />
              17 - 18 June 2026
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-medium text-blue-700 shadow-sm">
              <FiMapPin aria-hidden="true" />
              Makerere University
            </span>
          </div>

          <div className="flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Link
              href={DEVCON_ROUTE}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 px-6 py-4 text-sm font-medium text-white transition-transform duration-300 active:scale-95"
            >
              Learn more
              <FiArrowRight aria-hidden="true" />
            </Link>
            <a
              href={DEVCON_APPLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-blue-50 px-6 py-4 text-sm font-medium text-blue-700 transition-transform duration-300 active:scale-95"
            >
              Apply Now
              <FiExternalLink aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="flex w-full justify-center lg:justify-end">
          <div className="relative h-[260px] w-full overflow-hidden rounded-lg shadow-sm sm:h-[300px] lg:h-[340px]">
            <Image
              src={DEVCON_IMAGE_SRC}
              alt="Students building air quality hardware and software at AirQo DevCon"
              fill
              sizes="(max-width: 1024px) 100vw, 520px"
              className="object-cover object-center"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeDevConSection;
