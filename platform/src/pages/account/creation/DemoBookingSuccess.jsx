import React from 'react';
import CongratsImage from '@/images/EventHandling/congratulations.svg';

const DemoBookingSuccess = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center relative overflow-hidden">
      <div className="">
        <CongratsImage className="w-auto h-auto mb-8" />
      </div>
      {/* Main content */}
      <div className="relative z-10 text-center px-6 md:px-48">
        <h3 className="text-3xl text-black-700 font-semibold">
          Congratulations!
        </h3>
        <p className="text-xl max-w-lg font-normal mt-4">
          Your demo request has been submitted successfully. We will contact you
          shortly with the next steps.
        </p>
      </div>
    </div>
  );
};

export default DemoBookingSuccess;
