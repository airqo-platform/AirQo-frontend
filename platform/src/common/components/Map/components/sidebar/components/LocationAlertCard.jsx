import React, { useState, useEffect } from 'react';
import ChevronDownIcon from '@/icons/Common/chevron_down.svg';
import { getAQICategory, getAQIMessage } from '../../MapNodes';
import { isToday, isTomorrow, isThisWeek, format, isValid } from 'date-fns';
import { useSelector } from 'react-redux';

const addSpacesToCategory = (category) => {
  return category.replace(/([A-Z])/g, ' $1').trim();
};

const formatDateMessage = (date) => {
  // Validate the date before formatting
  if (!isValid(date)) {
    return null; // Return null or a default string if the date is invalid
  }

  if (isToday(date)) return 'today';
  if (isTomorrow(date)) return 'tomorrow';
  if (isThisWeek(date)) return 'this week';
  return format(date, 'MMMM do');
};

const LoadingSkeleton = () => (
  <div className='animate-pulse flex-col gap-3 p-3 bg-white rounded-lg shadow border border-secondary-neutral-dark-100'>
    <div className='flex items-center justify-between mb-2'>
      <div className='flex gap-3'>
        <div className='w-10 h-10 bg-secondary-neutral-dark-50 rounded-full'></div>
        <div className='h-4 w-36 bg-secondary-neutral-dark-50 rounded'></div>
      </div>
      <div className='w-7 h-7 bg-secondary-neutral-dark-50 rounded-full'></div>
    </div>
    <div className='h-4 w-full bg-secondary-neutral-dark-50 rounded mb-2'></div>
    <div className='h-4 w-3/4 bg-secondary-neutral-dark-50 rounded'></div>
  </div>
);

const LocationAlertCard = ({
  title,
  selectedSite,
  selectedWeeklyPrediction,
  isCollapsed = true,
  isLoading,
}) => {
  const recentLocationMeasurements = useSelector((state) => state.recentMeasurements.measurements);
  const [collapsed, setCollapsed] = useState(isCollapsed);

  const getAirQualityMessage = () => {
    const pm2_5Value =
      selectedSite?.pm2_5 ||
      recentLocationMeasurements?.[0]?.pm2_5?.value ||
      selectedSite?.pm2_5_prediction;

    if (pm2_5Value) {
      const locationName =
        selectedWeeklyPrediction?.description?.split(',')[0] ||
        selectedSite?.description?.split(',')[0] ||
        selectedSite?.name?.split(',')[0] ||
        selectedSite?.search_name ||
        selectedSite?.location ||
        recentLocationMeasurements?.[0]?.siteDetails?.search_name;

      const airQualityCategory = selectedWeeklyPrediction
        ? addSpacesToCategory(getAQICategory('pm2_5', selectedWeeklyPrediction.pm2_5).category)
        : addSpacesToCategory(getAQICategory('pm2_5', pm2_5Value).category);

      const dateValue = new Date(
        selectedWeeklyPrediction?.time ||
          selectedSite?.time ||
          recentLocationMeasurements?.[0]?.time,
      );

      const dateMessage = formatDateMessage(dateValue);

      // If the dateMessage is null, fallback to a default string
      const formattedDateMessage = dateMessage || 'an upcoming day';

      const aqiMessage = getAQIMessage(
        'pm2_5',
        formattedDateMessage,
        selectedWeeklyPrediction
          ? selectedWeeklyPrediction.pm2_5.toFixed(2)
          : pm2_5Value.toFixed(2),
      );

      return (
        <>
          <span className='text-blue-500'>{locationName}'s</span> Air Quality is expected to be{' '}
          {airQualityCategory} {formattedDateMessage}. {aqiMessage}
        </>
      );
    }
    return 'No air quality information for this place.';
  };

  return isLoading ? (
    <LoadingSkeleton />
  ) : (
    <div className='p-3 bg-white rounded-lg shadow border border-secondary-neutral-dark-100 flex-col justify-center items-center'>
      <div
        className={`flex justify-between items-center ${collapsed ? 'mb-2' : ''} cursor-pointer`}
        onClick={() => setCollapsed(!collapsed)}>
        <div className='flex justify-start items-center gap-3'>
          <div className='w-10 h-10 rounded-full bg-secondary-neutral-dark-50 p-2 flex items-center justify-center text-xl font-bold'>
            🚨
          </div>
          <h3 className='text-lg font-medium leading-relaxed text-secondary-neutral-dark-950'>
            {title}
          </h3>
        </div>
        <div className='w-7 h-7 rounded-full flex items-center justify-center bg-white'>
          <ChevronDownIcon className='text-secondary-neutral-dark-950 w-4 h-4' />
        </div>
      </div>

      {collapsed && (
        <p className='text-xl font-bold leading-7 text-secondary-neutral-dark-950'>
          {getAirQualityMessage()}
        </p>
      )}
    </div>
  );
};

export default LocationAlertCard;
