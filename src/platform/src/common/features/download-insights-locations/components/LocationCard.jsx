'use client';
import { Tooltip } from 'flowbite-react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { AqMarkerPin01 } from '@airqo/icons-react';

const truncateName = (name, maxLength = 13) => {
  if (
    !name ||
    name.toLowerCase() === 'unknown' ||
    name === 'Unknown Location'
  ) {
    return ''; // Return empty string for unknown names
  }
  return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
};

// Format location description, return empty string if no valid location data
const formatLocationDescription = (country, city) => {
  const parts = [];
  if (city && city.toLowerCase() !== 'unknown' && city !== 'Unknown Location') {
    parts.push(city);
  }
  if (
    country &&
    country.toLowerCase() !== 'unknown' &&
    country !== 'Unknown Location'
  ) {
    parts.push(country);
  }
  return parts.length > 0 ? parts.join(', ') : ''; // Return empty string instead of null
};

const LocationCard = ({
  site,
  onToggle,
  isSelected,
  isLoading = false,
  disableToggle = false,
  cardStyle = null,
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
        className="flex flex-col gap-3 p-3 items-start bg-gray-100 dark:bg-gray-800 rounded-lg w-full h-[68px]"
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
  const fullName = name || (search_name && search_name.split(',')[0]) || '';
  const displayName = truncateName(fullName);
  const locationDescription = formatLocationDescription(country, city);

  // Always show the card, even if name or location is unknown

  const handleCardClick = () => {
    if (!disableToggle) onToggle(site);
  };

  return (
    <motion.div
      className={`flex justify-between bg-gray-100 dark:bg-gray-800 items-center p-3 border ${
        isSelected
          ? 'border-primary/30 dark:border-primary/50 ring-1 ring-primary/50'
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
          <AqMarkerPin01 size={20} />
        </motion.div>
        <div className="flex flex-col">
          <Tooltip
            content={fullName || 'No name available'}
            placement="top"
            trigger="hover"
          >
            <h3 className="text-sm font-medium dark:text-white cursor-help min-h-[20px]">
              {displayName || ' '}
            </h3>
          </Tooltip>
          <small className="text-xs text-gray-500 dark:text-white min-h-[16px]">
            {locationDescription || ' '}
          </small>
        </div>
      </div>
      <motion.div
        whileTap={{ scale: 1.2 }}
        onClick={(e) => e.stopPropagation()}
        className="flex items-center justify-center"
      >
        <label htmlFor={`checkbox-${_id || 'unknown'}`} className="sr-only">
          Select {displayName || 'site'}
        </label>
        <input
          type="checkbox"
          id={`checkbox-${_id || 'unknown'}`}
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            if (!disableToggle) onToggle(site);
          }}
          className={`w-4 h-4 text-primary bg-white dark:bg-gray-800 border-primary/30 dark:border-primary/50 rounded focus:ring-primary/50 ${
            disableToggle ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
          }`}
          aria-label={`Select ${displayName || 'site'}`}
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

export default LocationCard;
