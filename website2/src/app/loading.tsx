import React from 'react';

const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="relative w-32 h-32 animate-pulse">
        {/* AirQo Logo Shape */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-28 h-28 bg-blue-600 rounded-full flex items-center justify-center">
            <div className="w-24 h-24 bg-blue-600 rounded-t-full rounded-b-lg rounded-l-lg rounded-r-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">airqo</span>
            </div>
          </div>
        </div>

        {/* Ripple Effect */}
        <div className="absolute inset-0">
          <div className="w-full h-full bg-blue-500/20 rounded-full animate-ping"></div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
