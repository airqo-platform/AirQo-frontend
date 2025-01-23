import Image from 'next/image';
import React from 'react';

interface AppDownloadSectionProps {
  title?: string;
  description?: string;
  appStoreLink?: string;
  googlePlayLink?: string;
  mockupImage?: string;
}

const AppDownloadSection: React.FC<AppDownloadSectionProps> = ({
  title = 'Download the app',
  description = 'Discover the quality of air you are breathing',
  appStoreLink = '#',
  googlePlayLink = '#',
  mockupImage = 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1729071559/website/photos/wrapper_aum5qm.png',
}) => {
  return (
    <section className="w-full ">
      <div className="max-w-5xl relative mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-12 lg:gap-24">
          {/* Left Content */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 lg:w-1/2">
            <h2 className="text-2xl sm:text-3xl lg:text-[40px] font-bold text-blue-600">
              {title}
            </h2>
            <p className="text-base sm:text-[20px] text-blue-600 max-w-md">
              {description}
            </p>
            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4 pt-4">
              <a
                href={appStoreLink}
                className="w-full sm:w-auto transition-transform hover:scale-105"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728179257/website/photos/apple_vpcn6j.png"
                  alt="Download on the App Store"
                  width={140}
                  height={45}
                  className="w-full sm:w-[140px] h-auto object-contain"
                  priority
                />
              </a>
              <a
                href={googlePlayLink}
                className="w-full sm:w-auto transition-transform hover:scale-105"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728179280/website/photos/google_play_vdmjrx.png"
                  alt="Get it on Google Play"
                  width={140}
                  height={45}
                  className="w-full sm:w-[140px] h-auto object-contain"
                  priority
                />
              </a>
            </div>
          </div>

          {/* Right Content - Phone Mockup */}
          <div className="lg:w-1/2 flex justify-center lg:justify-end">
            <div className="relative w-[280px] sm:w-[320px] lg:w-[380px]">
              <div className="relative z-10">
                <Image
                  src={mockupImage}
                  alt="App Interface Preview"
                  width={380}
                  height={760}
                  className="w-full h-auto"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
        {/* Background Decoration */}
        <div className="absolute top-[66%] lg:top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[60%] lg:h-[350px] lg:rounded-xl bg-[#f0f4fa] -z-10" />
      </div>
    </section>
  );
};

export default AppDownloadSection;
