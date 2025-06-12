import Image from 'next/image';

import TriangleImage from '@/icons/airqo.png';

const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="relative">
        {/* Outer Wave Circles */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute w-48 h-48 rounded-full bg-blue-500 opacity-30 animate-[ping_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>
          <div className="absolute w-64 h-64 rounded-full bg-blue-400 opacity-20 animate-[ping_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>
          <div className="absolute w-80 h-80 rounded-full bg-blue-300 opacity-10 animate-[ping_2.5s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>
        </div>

        {/* Triangle Image with Overlay */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Triangle Image */}{' '}
          <Image
            src={TriangleImage}
            alt="AirQo Triangle"
            fill
            style={{ objectFit: 'contain' }}
            className="text-blue-600 mix-blend-multiply transition-opacity"
            priority
            loading="eager"
            aria-hidden="true"
          />
          {/* Text Overlay */}
          <div className="absolute inset-0 flex items-center justify-center top-6">
            <span className="text-white font-bold text-2xl">AirQo</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
