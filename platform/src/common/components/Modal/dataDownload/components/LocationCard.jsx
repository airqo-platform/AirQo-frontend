import React from 'react';
import PropTypes from 'prop-types';

const LocationCard = ({ site, onToggle }) => (
  <div className="flex justify-between p-2 items-start bg-gray-100 rounded-xl">
    <div>
      <h1>
        {typeof site.location === 'string' && site.location.length > 15
          ? `${site.location.substring(0, 18)}...`
          : site.location}
      </h1>
      <small className="text-gray-500">{site.country}</small>
    </div>
    <div>
      <input
        type="checkbox"
        checked={true}
        onChange={() => onToggle(site)}
        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
      />
    </div>
  </div>
);

LocationCard.propTypes = {
  site: PropTypes.shape({
    location: PropTypes.string.isRequired,
    country: PropTypes.string.isRequired,
  }).isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default LocationCard;
