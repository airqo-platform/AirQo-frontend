import React, { useState } from 'react';
import ChevronDownIcon from '@/icons/Common/chevron_down.svg';
import { getAQICategory, getAQIMessage } from '../../MapNodes';
import { isToday, isTomorrow, isThisWeek, format, isSameDay } from 'date-fns';
import { useSelector } from 'react-redux';

// Helper function to insert space before capital letters
const addSpacesToCategory = (category) => {
  return category.split('').reduce((result, char, index) => {
    if (index > 0 && char === char.toUpperCase()) {
      return result + ' ' + char;
    }
    return result + char;
  }, '');
};

// Helper function to format the date message
const formatDateMessage = (date) => {
  if (isToday(date)) {
    return 'today';
  } else if (isTomorrow(date)) {
    return 'tomorrow';
  } else if (isThisWeek(date)) {
    return 'this week';
  } else {
    return format(date, 'MMMM do');
  }
};

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

  const getAirQualityMessage = () => {
    if (
      (selectedWeeklyPrediction && selectedWeeklyPrediction.airQuality) ||
      selectedSite?.airQuality ||
      recentLocationMeasurements?.[0]?.pm2_5?.value
    ) {
      const locationName =
        selectedWeeklyPrediction && selectedWeeklyPrediction.description
          ? selectedWeeklyPrediction.description.split(',')[0]
          : selectedSite?.description?.split(',')[0] ||
            selectedSite?.name?.split(',')[0] ||
            selectedSite?.search_name ||
            selectedSite?.location ||
            recentLocationMeasurements?.[0]?.siteDetails.search_name;

      const airQualityCategory = selectedWeeklyPrediction
        ? isSameDay(
            new Date(
              selectedSite.time || recentLocationMeasurements?.[0]?.time,
            ),
            new Date(selectedWeeklyPrediction.time),
          )
          ? addSpacesToCategory(
              getAQICategory(
                'pm2_5',
                selectedSite.pm2_5 ||
                  recentLocationMeasurements?.[0]?.pm2_5?.value,
              ).category,
            )
          : addSpacesToCategory(
              getAQICategory('pm2_5', selectedWeeklyPrediction.pm2_5).category,
            )
        : addSpacesToCategory(
            getAQICategory(
              'pm2_5',
              selectedSite.pm2_5 ||
                recentLocationMeasurements?.[0]?.pm2_5?.value,
            ).category,
          );

      const dateMessage = formatDateMessage(
        selectedWeeklyPrediction
          ? isSameDay(
              new Date(
                selectedSite.time || recentLocationMeasurements?.[0]?.time,
              ),
              new Date(selectedWeeklyPrediction.time),
            )
            ? new Date(
                selectedSite.time || recentLocationMeasurements?.[0]?.time,
              )
            : new Date(selectedWeeklyPrediction.time)
          : new Date(
              selectedSite.time || recentLocationMeasurements?.[0]?.time,
            ),
      );

      const aqiMessage = getAQIMessage(
        'pm2_5',
        dateMessage,
        selectedWeeklyPrediction
          ? selectedWeeklyPrediction.pm2_5.toFixed(2)
          : selectedSite?.pm2_5?.toFixed(2) ||
              recentLocationMeasurements?.[0]?.pm2_5?.value.toFixed(2),
      );

      return (
        <>
          <span className="text-blue-500">{locationName}'s</span> Air Quality is
          expected to be {airQualityCategory} {dateMessage}. {aqiMessage}
        </>
      );
    } else {
      return 'No air quality for this place.';
    }
  };

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
          {getAirQualityMessage()}
        </p>
      )}
    </div>
  );
};

export default LocationAlertCard;
