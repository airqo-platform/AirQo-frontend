import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import mainConfig from '@/configs/mainConfigs';

const Highlight = () => {
  return (
    <div
      className={`flex flex-col lg:flex-row items-center justify-center p-8 lg:p-14 bg-[#EBFFF5] dark:bg-[#1F2937] lg:rounded-xl ${mainConfig.containerClass}`}
    >
      {/* Left section: Portrait */}
      <div className="flex justify-center lg:justify-end items-center w-full lg:w-1/2 mb-8 lg:mb-0 lg:mr-12">
        <Image
          src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132440/website/photos/highlights/engineer_byss3s.webp"
          alt="Leader Portrait"
          width={444}
          height={469}
          className="grayscale w-full h-full max-w-[444px] transition-transform duration-500 ease-in-out transform hover:scale-110 cursor-pointer"
          loading="lazy"
        />
      </div>

      {/* Right section: Content */}
      <div className="flex flex-col justify-center items-center lg:items-start w-full lg:w-1/2 text-center lg:text-left">
        {/* Google logo */}
        <div className="flex justify-center lg:justify-start mb-8">
          <Image
            src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132441/website/photos/highlights/google-org_clia2b.svg"
            alt="Google Logo"
            width={120}
            height={120}
            loading="lazy"
          />
        </div>

        <h2 className="text-[18px] font-semibold mb-4 text-[#353E52] dark:text-white">
          Google.org Leaders to Watch 2022
        </h2>
        <p className="text-[24px] lg:text-[28px] text-gray-700 dark:text-gray-300 mb-8">
          From expanding equity in education to addressing environmental issues,
          this year&apos;s Leaders to Watch are building a better future for
          everyone.
        </p>
        <Link
          href="https://www.google.org/leaders-to-watch/#engineer-bainomugisha"
          target="_blank"
          className="inline-flex items-center py-3 text-lg text-black dark:text-gray-100 rounded-full transition-all hover:underline focus:outline-none"
        >
          Learn more →
        </Link>
      </div>
    </div>
  );
};

export default Highlight;
