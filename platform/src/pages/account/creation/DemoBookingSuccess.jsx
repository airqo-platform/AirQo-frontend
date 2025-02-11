import React from 'react';
import CongratsImage from '@/images/EventHandling/congratulations.svg';

const DemoBookingSuccess = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center relative overflow-hidden px-6">
      <div className="mb-8">
        <CongratsImage className="w-auto h-auto" />
      </div>
      {/* Main content */}
      <div className="relative z-10 text-center md:px-48">
        <h3 className="text-3xl text-black-700 font-semibold">
          Congratulations!
        </h3>
        <p className="text-xl max-w-lg font-normal mt-4">
          Your demo request has been submitted successfully. We will contact you
          shortly with the next steps.
        </p>
      </div>
      {/* Button to take the user to the AirQo website */}
      <div className="mt-12">
        <a
          href="https://www.airqo.net"
          rel="noopener noreferrer"
          target="_blank"
          className="inline-block btn bg-blue-900 text-white rounded-none text-sm outline-none border-none hover:bg-blue-950 px-12 py-3"
          aria-label="Visit AirQo Website (opens in new tab)"
        >
          Visit AirQo Website
        </a>
      </div>
    </div>
  );
};

export default DemoBookingSuccess;
