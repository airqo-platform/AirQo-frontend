import React, { useState, useRef, useEffect } from 'react';
import Calendar from '@/components/Calendar/Calendar';
import Spinner from '@/components/Spinner';
import useOutsideClick from '@/core/utils/useOutsideClick';
import { isValid, format, isSameDay } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedWeeklyPrediction } from '@/lib/store/services/map/MapSlice';
import { getAQIcon, images } from '../../MapNodes';
import Image from 'next/image';
import Button from '@/components/Button';

// Week prediction
const Predictions = ({ selectedSite, weeklyPredictions, loading }) => {
  const dispatch = useDispatch();
  const selectedWeeklyPrediction = useSelector((state) => state.map.selectedWeeklyPrediction);
  // Ensure the initial value is a valid date object
  const [value, setValue] = useState(selectedSite?.time ? new Date(selectedSite.time) : new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const dropdownRef = useRef(null);
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleDateValueChange = (newValue) => {
    // Ensure the new value is a valid date object
    const date = newValue.start ? new Date(newValue.start) : new Date();
    setValue(date);
  };

  useOutsideClick(dropdownRef, () => {
    setOpenDatePicker(false);
  });

  const isActive = (prediction) => {
    const predictionDay = new Date(prediction.time).toLocaleDateString('en-US', {
      weekday: 'long',
    });
    return selectedWeeklyPrediction
      ? prediction.time === selectedWeeklyPrediction.time
      : predictionDay === currentDay;
  };

  // Helper function to safely format the date
  const safeFormatDate = (date) => {
    return isValid(date) ? format(date, 'MMM dd, yyyy') : 'Invalid date';
  };

  return (
    <div className='relative'>
      <div className='mb-5 relative'>
        <Button
          className='flex flex-row-reverse shadow rounded-md text-sm text-secondary-neutral-light-600 font-medium leading-tight bg-white h-8 my-1'
          variant='outlined'
          // onClick={() => setOpenDatePicker(!openDatePicker)}
        >
          {safeFormatDate(value)}
        </Button>

        {openDatePicker && (
          <div className='absolute z-[900]' ref={dropdownRef}>
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
      <div className='flex justify-between items-center gap-2'>
        {weeklyPredictions && weeklyPredictions.length > 0
          ? weeklyPredictions.map((prediction, index) => (
              <div
                key={index}
                onClick={() => dispatch(setSelectedWeeklyPrediction(prediction))}
                className={`rounded-[40px] px-0.5 pt-1.5 pb-0.5 flex flex-col justify-center items-center gap-2 shadow ${
                  isActive(prediction) ? 'bg-blue-600' : 'bg-secondary-neutral-dark-100'
                }`}>
                <div className='flex flex-col items-center justify-start gap-[3px]'>
                  <div
                    className={`text-center text-sm font-semibold leading-tight ${
                      isActive(prediction) ? 'text-primary-300' : 'text-secondary-neutral-dark-400'
                    }`}>
                    {new Date(prediction.time)
                      .toLocaleDateString('en-US', { weekday: 'long' })
                      .charAt(0)}
                  </div>
                  {loading ? (
                    <Spinner width={6} height={6} />
                  ) : (
                    <div
                      className={`text-center text-sm font-medium leading-tight ${
                        isActive(prediction) ? 'text-white' : 'text-secondary-neutral-dark-200'
                      }`}>
                      {new Date(prediction.time).toLocaleDateString('en-US', {
                        day: 'numeric',
                      })}
                    </div>
                  )}
                </div>
                {isSameDay(new Date(selectedSite.time), new Date(prediction.time)) ? (
                  <Image
                    src={
                      selectedSite.pm2_5 && getAQIcon('pm2_5', selectedSite.pm2_5)
                        ? images[getAQIcon('pm2_5', selectedSite.pm2_5)]
                        : images['Invalid']
                    }
                    alt='Air Quality Icon'
                    width={32}
                    height={32}
                  />
                ) : (
                  <Image
                    src={
                      prediction.pm2_5 && getAQIcon('pm2_5', prediction.pm2_5)
                        ? images[getAQIcon('pm2_5', prediction.pm2_5)]
                        : images['Invalid']
                    }
                    alt='Air Quality Icon'
                    width={32}
                    height={32}
                  />
                )}
              </div>
            ))
          : weekDays.map((day) => (
              <div
                className={`rounded-[40px] px-0.5 pt-1.5 pb-0.5 flex flex-col justify-center items-center gap-2 shadow ${
                  day === currentDay ? 'bg-blue-600' : 'bg-secondary-neutral-dark-100'
                }`}
                key={day}>
                <div className='flex flex-col items-center justify-start gap-[3px]'>
                  <div className='text-center text-sm font-semibold leading-tight text-secondary-neutral-dark-400'>
                    {day.charAt(0)}
                  </div>
                  {loading ? (
                    <Spinner width={6} height={6} />
                  ) : (
                    <div className='text-center text-sm font-medium leading-tight text-secondary-neutral-dark-200'>
                      --
                    </div>
                  )}
                </div>
                <Image src={images['Invalid']} alt='Air Quality Icon' width={32} height={32} />
              </div>
            ))}
      </div>
    </div>
  );
};

export default Predictions;
