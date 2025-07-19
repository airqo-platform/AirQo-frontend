import { useState, useRef, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import Image from 'next/image';
import { isValid, format, isSameDay } from 'date-fns';
import { getAQIcon } from '../../MapNodes';
import { images } from '../../../constants/mapConstants';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedWeeklyPrediction } from '@/lib/store/services/map/MapSlice';
import Spinner from '@/components/Spinner';
import { useOutsideClick } from '@/core/hooks';
import Card from '@/components/CardWrapper';

const DayCell = ({ day, date, isActive, imageSrc, loading }) => {
  return (
    <div className="flex flex-col items-center justify-around space-y-2">
      {/* Day letter */}
      <div
        className={`text-sm font-medium ${
          isActive ? 'text-gray-400' : 'text-gray-500'
        }`}
      >
        {day}
      </div>

      {/* Date number */}
      <div
        className={`text-sm font-medium mb-2 ${
          isActive ? 'text-white font-bold' : 'text-gray-500'
        }`}
      >
        {date}
      </div>

      {/* Emoji icon with background */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center `}
      >
        {loading ? (
          <Spinner width={6} height={6} />
        ) : (
          <Image
            src={imageSrc}
            alt="Air Quality Icon"
            width={32}
            height={32}
            className="rounded-full"
          />
        )}
      </div>
    </div>
  );
};

DayCell.propTypes = {
  day: PropTypes.string.isRequired,
  date: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  isActive: PropTypes.bool.isRequired,
  imageSrc: PropTypes.string.isRequired,
  loading: PropTypes.bool,
};

const Predictions = ({ selectedSite, weeklyPredictions, loading }) => {
  const dispatch = useDispatch();
  const recentLocationMeasurements = useSelector(
    (state) => state.recentMeasurements.measurements,
  );
  const selectedWeeklyPrediction = useSelector(
    (state) => state.map.selectedWeeklyPrediction,
  );

  const [value, setValue] = useState(
    new Date(selectedSite?.time || Date.now()),
  );
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const dropdownRef = useRef(null);

  const currentDay = useMemo(
    () => new Date().toLocaleDateString('en-US', { weekday: 'long' }),
    [],
  );

  useOutsideClick(dropdownRef, () => setOpenDatePicker(false));

  const handleDateValueChange = useCallback((newValue) => {
    const date = newValue.start ? new Date(newValue.start) : new Date();
    setValue(date);
  }, []);

  const safeFormatDate = useCallback(
    (date) => (isValid(date) ? format(date, 'MMM dd, yyyy') : 'Invalid date'),
    [],
  );

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

  const getImageSrc = useCallback(
    (prediction) => {
      const siteTime = new Date(
        selectedSite?.time || recentLocationMeasurements?.[0]?.time,
      );
      const predictionTime = new Date(prediction.time);
      const pm25Value =
        selectedSite?.pm2_5 || recentLocationMeasurements?.[0]?.pm2_5?.value;

      if (isSameDay(siteTime, predictionTime)) {
        return images[getAQIcon('pm2_5', pm25Value)] || images['Invalid'];
      }
      return images[getAQIcon('pm2_5', prediction.pm2_5)] || images['Invalid'];
    },
    [selectedSite, recentLocationMeasurements],
  );

  // Generate the week view data
  const weekViewData = useMemo(() => {
    if (weeklyPredictions && weeklyPredictions.length > 0) {
      return weeklyPredictions.map((prediction) => {
        const dateObj = new Date(prediction.time);
        return {
          day: dateObj
            .toLocaleDateString('en-US', { weekday: 'short' })
            .charAt(0),
          fullDay: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
          date: dateObj.getDate(),
          prediction,
          isActive: isActive(prediction),
          imageSrc: getImageSrc(prediction),
        };
      });
    }

    // Fallback when no predictions are available
    return Array.from({ length: 7 }, (_, i) => {
      const dateObj = new Date();
      dateObj.setDate(dateObj.getDate() + i);
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      return {
        day: dayName.charAt(0),
        fullDay: dayName,
        date: dateObj.getDate(),
        isActive: i === 0,
        imageSrc: images['Invalid'],
      };
    });
  }, [weeklyPredictions, isActive, getImageSrc]);

  return (
    <>
      {/* Date selector */}
      {/* <div className="mb-4 relative">
        <Button
          className="flex flex-row-reverse shadow rounded-md text-sm text-gray-600 font-medium leading-tight bg-white h-8 border border-gray-200"
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
      </div> */}

      {/* Week view: Each prediction wrapped in its own Card */}
      <div className="grid grid-cols-7 gap-2">
        {weekViewData.map((item, index) => (
          <Card
            key={index}
            onClick={() => {
              if (item.prediction) {
                dispatch(setSelectedWeeklyPrediction(item.prediction));
              }
            }}
            padding="p-3"
            className={`cursor-pointer flex flex-col items-center justify-center transition-transform duration-200 border border-gray-600 rounded-full`}
            background={`${
              item.isActive ? 'bg-blue-600' : 'bg-secondary-neutral-dark-50'
            }`}
            radius="rounded-full"
            shadow="shadow-sm"
          >
            <DayCell
              day={item.day}
              date={item.date}
              isActive={item.isActive}
              imageSrc={item.imageSrc}
              loading={loading}
            />
          </Card>
        ))}
      </div>
    </>
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
