import React from 'react';
import PropTypes from 'prop-types';

const AirQualityCard = ({ airQuality, pollutionSource, pollutant }) => {
  return (
    <div className="flex flex-col sm:flex-row bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
      {/* Air Quality Section */}
      <div className="flex-[2] sm:pr-4 pb-4 sm:pb-0">
        <h3 className="text-xs border-b font-semibold text-gray-500">
          Air Quality
        </h3>
        <p className="text-sm text-gray-800 mt-1">{airQuality}</p>
      </div>

      {/* Pollution Source Section */}
      <div className="flex-1 sm:pr-4 sm:pl-4 pb-4 sm:pb-0">
        <h3 className="text-xs border-b font-semibold text-gray-500">
          Pollution Source
        </h3>
        <p className="text-sm text-gray-800 mt-1">{pollutionSource}</p>
      </div>

      {/* Pollutant Section */}
      <div className="flex-1 sm:pl-4">
        <h3 className="text-xs border-b font-semibold text-gray-500">
          Pollutant
        </h3>
        <p className="text-sm text-gray-800 mt-1">{pollutant}</p>
      </div>
    </div>
  );
};

AirQualityCard.propTypes = {
  airQuality: PropTypes.string.isRequired,
  pollutionSource: PropTypes.string.isRequired,
  pollutant: PropTypes.string.isRequired,
};

export default AirQualityCard;
