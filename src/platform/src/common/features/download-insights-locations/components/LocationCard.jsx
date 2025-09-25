'use client';
import { Tooltip } from 'flowbite-react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { AqMarkerPin01 } from '@airqo/icons-react';
import { useId } from 'react';

const truncateName = (name, maxLength = 13) => {
  const label =
    typeof name === 'string' ? name.trim() : String(name || '').trim();
  if (!label) return '';
  const lower = label.toLowerCase();
  if (['unknown', 'unknown location', 'n/a', 'na', '-'].includes(lower))
    return '';
  return label.length > maxLength
    ? `${label.substring(0, maxLength)}...`
    : label;
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
  isVisualized = false,
  isLoading = false,
  disableToggle = false,
  cardStyle = null,
  // no download props here
}) => {
  const autoId = useId();
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

  const {
    name,
    search_name,
    country,
    city,
    _id,
    // fields used when visualizing devices
    displayName: deviceDisplayName,
    originalSiteName,
    // associatedDevices is intentionally not destructured here to avoid unused var
    location_name,
  } = site || {};

  // If this card represents a device visualization item, prefer device name on top
  // and show the site/location name underneath. Otherwise fall back to site name.
  const chooseFirstValid = (...vals) => {
    for (const v of vals) {
      if (v == null) continue;
      const s = String(v).trim();
      if (
        !s ||
        ['n/a', 'na', 'unknown', 'unknown location'].includes(s.toLowerCase())
      )
        continue;
      return s;
    }
    return '--';
  };

  const topName =
    deviceDisplayName ||
    chooseFirstValid(
      name,
      search_name && search_name.split(',')[0],
      location_name,
    );

  const displayName = truncateName(topName === '--' ? '' : topName);

  // Prefer explicit location_name or originalSiteName for the small description
  const siteLabel = chooseFirstValid(
    location_name,
    originalSiteName,
    name,
    search_name,
  );

  // Use city/country only if no explicit site label is available
  const locationDescription =
    siteLabel !== '--'
      ? siteLabel
      : formatLocationDescription(country, city) || '--';

  // Always show the card, even if name or location is unknown
  const checkboxId = `checkbox-${_id || autoId}`;

  const handleCardClick = () => {
    if (!disableToggle) onToggle(site);
  };

  return (
    <motion.div
      className={`flex justify-between bg-gray-100 dark:bg-gray-800 items-center p-3 border-2 ${
        isVisualized
          ? 'border-green-500 ring-1 ring-green-500/50'
          : isSelected
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
          className={isVisualized ? 'text-green-600' : ''}
        >
          <AqMarkerPin01 size={20} />
        </motion.div>
        <div className="flex flex-col">
          <Tooltip
            content={topName || 'No name available'}
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
        <label htmlFor={checkboxId} className="sr-only">
          Select {topName || displayName || 'site'}
        </label>
        <input
          type="checkbox"
          id={checkboxId}
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
        {/* no per-site download button here */}
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
    // Device visualization helpers
    displayName: PropTypes.string,
    originalSiteName: PropTypes.string,
    location_name: PropTypes.string,
  }).isRequired,
  onToggle: PropTypes.func.isRequired,
  isSelected: PropTypes.bool.isRequired,
  isVisualized: PropTypes.bool,
  isLoading: PropTypes.bool,
  disableToggle: PropTypes.bool,
  cardStyle: PropTypes.object,
  download: PropTypes.func,
  downloadLoading: PropTypes.bool,
};

export default LocationCard;
