import React, { useState, useRef, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import Image from 'next/image';
import { isValid, format, isSameDay } from 'date-fns';
import { getAQIcon, images } from '../../MapNodes';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedWeeklyPrediction } from '@/lib/store/services/map/MapSlice';
import Button from '@/components/Button';
import Calendar from '@/components/Calendar/Calendar';
import Spinner from '@/components/Spinner';
import { useOutsideClick } from '@/core/hooks';

const Predictions = ({ selectedSite, weeklyPredictions, loading }) => {
  const dispatch = useDispatch();
  const recentLocationMeasurements = useSelector(
    (state) => state.recentMeasurements.measurements,
  );
  const selectedWeeklyPrediction = useSelector(
    (state) => state.map.selectedWeeklyPrediction,
  );

  // Local state
  const [value, setValue] = useState(
    () => new Date(selectedSite?.time || Date.now()),
  );
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const dropdownRef = useRef(null);
  const currentDay = useMemo(
    () => new Date().toLocaleDateString('en-US', { weekday: 'long' }),
    [],
  );
  const weekDays = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  // Close date picker when clicking outside
  useOutsideClick(dropdownRef, () => setOpenDatePicker(false));

  // Handle date picker changes
  const handleDateValueChange = useCallback((newValue) => {
    const date = newValue.start ? new Date(newValue.start) : new Date();
    setValue(date);
  }, []);

  // Format date safely
  const safeFormatDate = useCallback(
    (date) => (isValid(date) ? format(date, 'MMM dd, yyyy') : 'Invalid date'),
    [],
  );

  // Get active state for prediction
  const isActive = useCallback(
    (prediction) => {
      const predictionDay = new Date(prediction.time).toLocaleDateString(
        'en-US',
        {
          weekday: 'long',
        },
      );
      return selectedWeeklyPrediction
        ? prediction.time === selectedWeeklyPrediction.time
        : predictionDay === currentDay;
    },
    [selectedWeeklyPrediction, currentDay],
  );

  // Get the image source for the prediction
  const getImageSrc = useCallback(
    (prediction) => {
      const siteTime = new Date(
        selectedSite.time || recentLocationMeasurements?.[0]?.time,
      );
      const predictionTime = new Date(prediction.time);
      const pm25Value =
        selectedSite.pm2_5 || recentLocationMeasurements?.[0]?.pm2_5?.value;

      if (isSameDay(siteTime, predictionTime)) {
        return images[getAQIcon('pm2_5', pm25Value)] || images['Invalid'];
      }
      return images[getAQIcon('pm2_5', prediction.pm2_5)] || images['Invalid'];
    },
    [selectedSite, recentLocationMeasurements],
  );

  // Render individual prediction block
  const renderPredictionBlock = useCallback(
    (prediction, index) => (
      <div
        key={index}
        onClick={() => dispatch(setSelectedWeeklyPrediction(prediction))}
        className={`rounded-[40px] px-0.5 pt-1.5 pb-0.5 flex flex-col justify-center items-center gap-2 shadow ${
          isActive(prediction) ? 'bg-blue-600' : 'bg-secondary-neutral-dark-100'
        }`}
      >
        <div className="flex flex-col items-center justify-start gap-[3px]">
          <div
            className={`text-center text-sm font-semibold leading-tight ${
              isActive(prediction)
                ? 'text-primary-300'
                : 'text-secondary-neutral-dark-400'
            }`}
          >
            {new Date(prediction.time)
              .toLocaleDateString('en-US', { weekday: 'long' })
              .charAt(0)}
          </div>
          {loading ? (
            <Spinner width={6} height={6} />
          ) : (
            <div
              className={`text-center text-sm font-medium leading-tight ${
                isActive(prediction)
                  ? 'text-white'
                  : 'text-secondary-neutral-dark-200'
              }`}
            >
              {new Date(prediction.time).toLocaleDateString('en-US', {
                day: 'numeric',
              })}
            </div>
          )}
        </div>
        <Image
          src={getImageSrc(prediction)}
          alt="Air Quality Icon"
          width={32}
          height={32}
        />
      </div>
    ),
    [dispatch, getImageSrc, isActive, loading],
  );

  return (
    <div className="relative">
      <div className="mb-5 relative">
        <Button
          className="flex flex-row-reverse shadow rounded-md text-sm text-secondary-neutral-light-600 font-medium leading-tight bg-white h-8 my-1"
          variant="outlined"
          onClick={() => setOpenDatePicker(!openDatePicker)}
        >
          {safeFormatDate(value)}
        </Button>

        {openDatePicker && (
          <div className="absolute z-[900]" ref={dropdownRef}>
            <Calendar
              handleValueChange={handleDateValueChange}
              closeDatePicker={() => setOpenDatePicker(false)}
              initialMonth1={new Date()}
              initialMonth2={new Date()}
              showTwoCalendars={false}
            />
          </div>
        )}
      </div>
      <div className="flex justify-between items-center gap-2">
        {weeklyPredictions && weeklyPredictions.length > 0
          ? weeklyPredictions.map(renderPredictionBlock)
          : weekDays.map((day) => (
              <div
                className={`rounded-[40px] px-0.5 pt-1.5 pb-0.5 flex flex-col justify-center items-center gap-2 shadow ${
                  day === currentDay
                    ? 'bg-blue-600'
                    : 'bg-secondary-neutral-dark-100'
                }`}
                key={day}
              >
                <div className="flex flex-col items-center justify-start gap-[3px]">
                  <div className="text-center text-sm font-semibold leading-tight text-secondary-neutral-dark-400">
                    {day.charAt(0)}
                  </div>
                  {loading ? (
                    <Spinner width={6} height={6} />
                  ) : (
                    <div className="text-center text-sm font-medium leading-tight text-secondary-neutral-dark-200">
                      --
                    </div>
                  )}
                </div>
                <Image
                  src={images['Invalid']}
                  alt="Air Quality Icon"
                  width={32}
                  height={32}
                />
              </div>
            ))}
      </div>
    </div>
  );
};

Predictions.propTypes = {
  selectedSite: PropTypes.shape({
    time: PropTypes.string,
    pm2_5: PropTypes.number,
  }),
  weeklyPredictions: PropTypes.arrayOf(
    PropTypes.shape({
      time: PropTypes.string.isRequired,
      pm2_5: PropTypes.number.isRequired,
    }),
  ),
  loading: PropTypes.bool,
};

export default Predictions;
