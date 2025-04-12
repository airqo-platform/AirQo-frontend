'use client';
import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import LocationIcon from '@/icons/Analytics/LocationIcon';

const truncateName = (name, maxLength = 13) => {
  if (!name) return 'Unknown Location';
  return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
};

const LocationCard = ({
  site,
  onToggle,
  isSelected,
  isLoading,
  disableToggle,
  cardStyle,
}) => {
  const cardVariants = {
    initial: { opacity: 0, y: 5 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    hover: {
      y: -2,
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
      transition: { type: 'spring', stiffness: 300, damping: 15 },
    },
    tap: { scale: 0.98 },
  };

  if (isLoading) {
    return (
      <motion.div
        className="flex flex-col gap-3 p-3 items-start bg-gray-100 dark:bg-gray-800 rounded-xl w-full h-[68px]"
        variants={cardVariants}
        initial="initial"
        animate="animate"
      >
        <div className="flex justify-between w-full h-auto">
          <div className="w-2/3 h-4 bg-gray-300 dark:bg-gray-600 rounded mb-1 animate-pulse"></div>
          <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
        </div>
        <div className="w-2/3 h-3 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
      </motion.div>
    );
  }

  const { name, search_name, country, city, _id } = site;
  const displayName = truncateName(
    name || (search_name && search_name.split(',')[0]) || '',
  );
  const locationDescription = country || city || 'Unknown Location';

  const handleCardClick = () => {
    if (!disableToggle) onToggle(site);
  };

  return (
    <motion.div
      className={`flex justify-between bg-gray-100 dark:bg-gray-800 items-center p-3 border ${
        isSelected
          ? 'border-blue-300 dark:border-blue-500 ring-1 ring-blue-500'
          : 'border-gray-200 dark:border-gray-700'
      } rounded-lg shadow-sm w-full ${disableToggle ? 'opacity-90' : ''}`}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover={!disableToggle ? 'hover' : undefined}
      whileTap={!disableToggle ? 'tap' : undefined}
      onClick={handleCardClick}
      role="button"
      aria-pressed={isSelected}
      aria-disabled={disableToggle}
      tabIndex={disableToggle ? -1 : 0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disableToggle) {
          e.preventDefault();
          onToggle(site);
        }
      }}
      style={cardStyle}
    >
      <div className="flex items-center gap-2">
        <motion.div
          initial={{ rotate: 0 }}
          animate={isSelected ? { rotate: [0, 15, 0] } : {}}
          transition={{ duration: 0.3 }}
        >
          <LocationIcon
            width={20}
            height={20}
            fill={isSelected ? '#3B82F6' : '#9EA3AA'}
          />
        </motion.div>
        <div className="flex flex-col">
          <h3 className="text-sm font-medium dark:text-white">{displayName}</h3>
          <small className="text-xs text-gray-500 dark:text-white">
            {locationDescription}
          </small>
        </div>
      </div>
      <motion.div
        whileTap={{ scale: 1.2 }}
        onClick={(e) => e.stopPropagation()}
        className="flex items-center justify-center"
      >
        <label htmlFor={`checkbox-${_id || 'unknown'}`} className="sr-only">
          Select {displayName}
        </label>
        <input
          type="checkbox"
          id={`checkbox-${_id || 'unknown'}`}
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            if (!disableToggle) onToggle(site);
          }}
          className={`w-4 h-4 text-blue-600 bg-white dark:bg-gray-800 border-blue-300 dark:border-blue-500 rounded focus:ring-blue-500 ${
            disableToggle ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
          }`}
          aria-label={`Select ${displayName}`}
          disabled={disableToggle}
        />
      </motion.div>
    </motion.div>
  );
};

LocationCard.propTypes = {
  site: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string,
    search_name: PropTypes.string,
    country: PropTypes.string,
    city: PropTypes.string,
  }).isRequired,
  onToggle: PropTypes.func.isRequired,
  isSelected: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool,
  disableToggle: PropTypes.bool,
  cardStyle: PropTypes.object,
};

LocationCard.defaultProps = {
  isLoading: false,
  disableToggle: false,
  cardStyle: null,
};

export default LocationCard;
