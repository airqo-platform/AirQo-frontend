import React, { useState, useMemo, useRef, useEffect } from 'react';
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
import Card from '@/components/CardWrapper';

const addSpacesToCategory = (category) =>
  category?.replace(/([a-z])([A-Z])/g, '$1 $2') || 'Unknown Category';

const formatDateMessage = (date) => {
  if (!isValid(date)) return 'Invalid date';
  if (isToday(date)) return 'today';
  if (isTomorrow(date)) return 'tomorrow';
  if (isThisWeek(date)) return 'this week';
  return format(date, 'MMMM do');
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
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);

  const getValidDate = (time) =>
    isValid(new Date(time)) ? new Date(time) : null;

  const airQualityCategory = useMemo(() => {
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

  const dateMessage = useMemo(() => {
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

  const airQualityMessage = useMemo(() => {
    const pm2_5Value = selectedWeeklyPrediction
      ? selectedWeeklyPrediction.pm2_5?.toFixed(2)
      : selectedSite?.pm2_5?.toFixed(2) ||
        recentLocationMeasurements?.[0]?.pm2_5?.value?.toFixed(2);

    if (pm2_5Value) {
      const aqiMessage = getAQIMessage('pm2_5', dateMessage, pm2_5Value);
      return (
        <>
          <span className="text-blue-500">{`${locationName}'s`}</span> Air
          Quality is expected to be {airQualityCategory} {dateMessage}.{' '}
          {aqiMessage}
        </>
      );
    }
    return 'No air quality data for this place.';
  }, [
    locationName,
    airQualityCategory,
    dateMessage,
    selectedSite,
    selectedWeeklyPrediction,
    recentLocationMeasurements,
  ]);

  // Measure content height for smooth animation
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [collapsed, selectedSite, selectedWeeklyPrediction]);

  // Custom header for the Card component
  const cardHeader = (
    <div
      className="flex justify-between items-center w-full cursor-pointer"
      onClick={() => setCollapsed(!collapsed)}
      data-testid="alert-card-header"
    >
      <div className="flex justify-start items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-secondary-neutral-dark-50 p-2 flex items-center justify-center text-xl font-bold">
          🚨
        </div>
        <h3 className="text-lg font-medium leading-relaxed text-secondary-neutral-dark-950 dark:text-white">
          {title}
        </h3>
      </div>
      <div
        className={`rounded-full flex items-center justify-center p-2 bg-white transition-transform duration-300 ${
          collapsed ? 'rotate-0' : 'rotate-180'
        }`}
      >
        <ChevronDownIcon />
      </div>
    </div>
  );

  return (
    <Card
      padding="p-0"
      className="mb-4 transition-all duration-300 dark:bg-gray-800 border dark:border-gray-600 rounded-xl"
      shadow="shadow"
      header={cardHeader}
      headerProps={{
        className: 'p-3',
      }}
      testId="location-alert-card"
    >
      {/* Content with smooth height transition */}
      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-300 ease-in-out px-3 pb-3"
        style={{
          maxHeight: collapsed ? '0px' : `${contentHeight}px`,
          opacity: collapsed ? 0 : 1,
          marginTop: collapsed ? 0 : '8px',
          visibility: collapsed ? 'hidden' : 'visible',
        }}
        data-testid="alert-card-content"
      >
        <p className="text-xl font-bold leading-7 text-secondary-neutral-dark-950 dark:text-white">
          {airQualityMessage}
        </p>
      </div>
    </Card>
  );
};

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
