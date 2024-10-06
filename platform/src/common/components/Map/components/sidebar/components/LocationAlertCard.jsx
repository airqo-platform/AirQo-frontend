import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import ChevronDownIcon from '@/icons/Common/chevron_down.svg';
import { getAQICategory, getAQIMessage } from '../../MapNodes';
import {
  isToday,
  isTomorrow,
  isThisWeek,
  format,
  isSameDay,
  isValid,
} from 'date-fns';
import { useSelector } from 'react-redux';

// Helper function to insert space before capital letters
const addSpacesToCategory = (category) =>
  category?.replace(/([a-z])([A-Z])/g, '$1 $2') || 'Unknown Category';

// Helper function to format the date message
const formatDateMessage = (date) => {
  if (!isValid(date)) return 'Invalid date'; // Ensure date is valid before formatting
  if (isToday(date)) return 'today';
  if (isTomorrow(date)) return 'tomorrow';
  if (isThisWeek(date)) return 'this week';
  return format(date, 'MMMM do');
};

// LocationAlertCard component
const LocationAlertCard = ({
  title,
  selectedSite,
  selectedWeeklyPrediction,
  isCollapsed = true,
}) => {
  const recentLocationMeasurements = useSelector(
    (state) => state.recentMeasurements.measurements,
  );
  const [collapsed, setCollapsed] = useState(isCollapsed);

  // Ensure we have a valid time value before creating Date objects
  const getValidDate = (time) =>
    isValid(new Date(time)) ? new Date(time) : null;

  // Get air quality category based on the current or predicted data
  const getAirQualityCategory = useMemo(() => {
    const currentPM25 =
      selectedSite?.pm2_5 || recentLocationMeasurements?.[0]?.pm2_5?.value;
    const predictedPM25 = selectedWeeklyPrediction?.pm2_5;

    const categoryObject = selectedWeeklyPrediction
      ? isSameDay(
          getValidDate(selectedSite?.time) ||
            getValidDate(recentLocationMeasurements?.[0]?.time),
          getValidDate(selectedWeeklyPrediction?.time),
        )
        ? getAQICategory('pm2_5', currentPM25)
        : getAQICategory('pm2_5', predictedPM25)
      : getAQICategory('pm2_5', currentPM25);

    return addSpacesToCategory(categoryObject?.category);
  }, [selectedSite, selectedWeeklyPrediction, recentLocationMeasurements]);

  // Get the date message
  const getDateMessage = useMemo(() => {
    const selectedTime = selectedWeeklyPrediction
      ? isSameDay(
          getValidDate(selectedSite?.time) ||
            getValidDate(recentLocationMeasurements?.[0]?.time),
          getValidDate(selectedWeeklyPrediction?.time),
        )
        ? getValidDate(selectedSite?.time) ||
          getValidDate(recentLocationMeasurements?.[0]?.time)
        : getValidDate(selectedWeeklyPrediction?.time)
      : getValidDate(selectedSite?.time) ||
        getValidDate(recentLocationMeasurements?.[0]?.time);

    return formatDateMessage(selectedTime);
  }, [selectedSite, selectedWeeklyPrediction, recentLocationMeasurements]);

  // Get location name
  const locationName = useMemo(() => {
    return (
      selectedWeeklyPrediction?.description?.split(',')[0] ||
      selectedSite?.description?.split(',')[0] ||
      selectedSite?.name?.split(',')[0] ||
      selectedSite?.search_name ||
      selectedSite?.location ||
      recentLocationMeasurements?.[0]?.siteDetails?.search_name
    );
  }, [selectedSite, selectedWeeklyPrediction, recentLocationMeasurements]);

  // Generate the air quality message
  const airQualityMessage = useMemo(() => {
    const pm2_5Value = selectedWeeklyPrediction
      ? selectedWeeklyPrediction.pm2_5?.toFixed(2)
      : selectedSite?.pm2_5?.toFixed(2) ||
        recentLocationMeasurements?.[0]?.pm2_5?.value?.toFixed(2);

    if (pm2_5Value) {
      const aqiMessage = getAQIMessage('pm2_5', getDateMessage, pm2_5Value);
      return (
        <>
          <span className="text-blue-500">{`${locationName}'s`}</span> Air
          Quality is expected to be {getAirQualityCategory} {getDateMessage}.{' '}
          {aqiMessage}
        </>
      );
    }

    return 'No air quality data for this place.';
  }, [
    locationName,
    getAirQualityCategory,
    getDateMessage,
    selectedSite,
    selectedWeeklyPrediction,
    recentLocationMeasurements,
  ]);

  return (
    <div className="p-3 bg-white rounded-lg shadow border border-secondary-neutral-dark-100 flex-col justify-center items-center">
      <div
        className={`flex justify-between items-center ${
          collapsed && 'mb-2'
        } cursor-pointer`}
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex justify-start items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary-neutral-dark-50 p-2 flex items-center justify-center text-xl font-bold">
            🚨
          </div>
          <h3 className="text-lg font-medium leading-relaxed text-secondary-neutral-dark-950">
            {title}
          </h3>
        </div>
        <div className="w-7 h-7 rounded-full flex items-center justify-center bg-white">
          <ChevronDownIcon className="text-secondary-neutral-dark-950 w-4 h-4" />
        </div>
      </div>

      {collapsed && (
        <p className="text-xl font-bold leading-7 text-secondary-neutral-dark-950">
          {airQualityMessage}
        </p>
      )}
    </div>
  );
};

// Add PropTypes validation for the component props
LocationAlertCard.propTypes = {
  title: PropTypes.string.isRequired,
  selectedSite: PropTypes.shape({
    time: PropTypes.string,
    description: PropTypes.string,
    pm2_5: PropTypes.number,
    name: PropTypes.string,
    search_name: PropTypes.string,
    location: PropTypes.string,
  }),
  selectedWeeklyPrediction: PropTypes.shape({
    time: PropTypes.string,
    description: PropTypes.string,
    pm2_5: PropTypes.number,
  }),
  isCollapsed: PropTypes.bool,
};

LocationAlertCard.defaultProps = {
  isCollapsed: true,
};

export default LocationAlertCard;
