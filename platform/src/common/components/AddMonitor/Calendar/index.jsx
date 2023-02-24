import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import { useState } from 'react';
import ArrowRight from '@/icons/arrow_right_alt_blue.svg';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import {
  addEndDate,
  addStartDate,
} from '@/lib/store/services/addMonitor/selectedCollocateDevicesSlice';

const ScheduleCalendar = () => {
  const collationDurations = [4, 7, 14];
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const dispatch = useDispatch();

  const handleStartDateChange = (event) => {
    setStartDate(moment(event.target.value, 'YYYY-MM-DD').toDate());
    dispatch(addStartDate(new Date(event.target.value).toISOString()));
  };

  const handleEndDateChange = (event) => {
    setEndDate(moment(event.target.value, 'YYYY-MM-DD').toDate());
    dispatch(addEndDate(new Date(event.target.value).toISOString()));
  };

  const handleCalendarChange = (date) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
    }

    if (startDate && !endDate) {
      if (date >= startDate) {
        setEndDate(date);
      } else {
        setEndDate(startDate);
        setStartDate(date);
      }
    }
  };

  const formatShortWeekday = (locale, date) => {
    const options = { weekday: 'short' };
    return new Intl.DateTimeFormat(locale, options).format(date).substring(0, 2);
  };

  return (
    <div>
      <div className='px-6 pb-7'>
        <h3 className='font-medium text-xl'>Choose collocation period</h3>
        <h5 className='text-light-text text-sm mb-4'>Select your collocation period.</h5>
        {collationDurations.map((duration) => (
          <div className='border border-grey-100 py-1 px-4 rounded-md my-2 flex flex-row justify-between items-center'>
            {duration} {'days'}
            <input type='radio' name='duration' />
          </div>
        ))}
        <div className='border border-grey-100 py-2 px-4 rounded-md my-2 flex flex-row justify-between items-center'>
          Custom
          <input type='radio' name='duration' />
        </div>
      </div>
      <div className='border-none border-r-0 border-l-0 border-b-0 border-t-skeleton'>
        <div className='mb-8 flex flex-row justify-between items-center px-6'>
          {/* TODO: Duration upon range selection */}
          <span>
            <input
              className='appearance-none border border-grey-100 rounded-md opacity-50 text-sm w-[104px] px-1'
              type='date'
              id='startDate'
              value={startDate ? moment(startDate).format('YYYY-MM-DD') : ''}
              onChange={handleStartDateChange}
            />
          </span>
          <span className='bg-baby-blue h-8 w-8 flex justify-center items-center'>
            <ArrowRight />
          </span>
          <span>
            <input
              className='appearance-none border border-grey-100 rounded-md opacity-50 text-sm w-[104px] px-1'
              type='date'
              id='endDate'
              value={endDate ? moment(endDate).format('YYYY-MM-DD') : ''}
              onChange={handleEndDateChange}
            />
          </span>
        </div>
      </div>

      {/* TODO: Calendar styling and connecting duration */}
      <div>
        <Calendar
          className='prose border-none'
          onChange={handleCalendarChange}
          value={[startDate, endDate]}
          selectRange={true}
          prev2Label={null}
          next2Label={null}
          formatShortWeekday={formatShortWeekday}
          calendarType='US'
          locale='en-US'
        />
      </div>
    </div>
  );
};

export default ScheduleCalendar;
