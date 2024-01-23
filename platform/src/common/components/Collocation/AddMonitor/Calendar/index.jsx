import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  addEndDate,
  addStartDate,
  addScheduledBatchName,
  addScheduledBatchDataCompletenessThreshold,
  addScheduledBatchDifferencesThreshold,
  addScheduledBatchInterCorrelationThreshold,
  addScheduledBatchIntraCorrelationThreshold,
} from '@/lib/store/services/collocation/selectedCollocateDevicesSlice';
import Datepicker from 'react-tailwindcss-datepicker';
import moment from 'moment';
import { useSelector } from 'react-redux';

const ScheduleCalendar = () => {
  const dispatch = useDispatch();
  const storedStartDate = useSelector((state) => state.selectedCollocateDevices.startDate);
  const storedEndDate = useSelector((state) => state.selectedCollocateDevices.endDate);
  const scheduledBatchName = useSelector(
    (state) => state.selectedCollocateDevices.scheduledBatchName,
  );
  const scheduledBatchDataCompletenessThresholdRedux = useSelector(
    (state) => state.selectedCollocateDevices.scheduledBatchDataCompletenessThreshold,
  );
  const scheduledBatchInterCorrelationThresholdRedux = useSelector(
    (state) => state.selectedCollocateDevices.scheduledBatchInterCorrelationThreshold,
  );
  const scheduledBatchIntraCorrelationThresholdRedux = useSelector(
    (state) => state.selectedCollocateDevices.scheduledBatchIntraCorrelationThreshold,
  );
  const scheduledBatchDifferencesThresholdRedux = useSelector(
    (state) => state.selectedCollocateDevices.scheduledBatchDifferencesThreshold,
  );

  const [value, setValue] = useState({
    startDate: storedStartDate,
    endDate: storedEndDate,
  });

  const collationDurations = [4, 7, 14];
  const [duration, setDuration] = useState(null);
  const [customRange, setCustomRange] = useState(false);

  const [scheduledBatchDataCompletenessThreshold, setScheduledBatchDataCompletenessThreshold] =
    useState(scheduledBatchDataCompletenessThresholdRedux);
  const [scheduledBatchInterCorrelationThreshold, setScheduledBatchInterCorrelationThreshold] =
    useState(scheduledBatchInterCorrelationThresholdRedux);
  const [scheduledBatchIntraCorrelationThreshold, setScheduledBatchIntraCorrelationThreshold] =
    useState(scheduledBatchIntraCorrelationThresholdRedux);
  const [scheduledBatchDifferencesThreshold, setScheduledBatchDifferencesThreshold] = useState(
    scheduledBatchDifferencesThresholdRedux,
  );

  useEffect(() => {
    // Difference between the start and end date
    if (value && value.startDate && value.endDate) {
      const diffDates = moment(value.endDate).diff(moment(value.startDate), 'days');
      if (diffDates > 0) {
        setDuration(diffDates + 1);
      }
    }
  }, []);

  const handleValueChange = (newValue) => {
    setValue(newValue);
    dispatch(addStartDate(newValue.startDate));
    dispatch(addEndDate(newValue.endDate));
  };

  const handleDurationChange = (event) => {
    let startDate, endDate;
    setDuration(Number(event.target.value));
    setCustomRange(false);
    const today = moment();
    startDate = today.format('YYYY-MM-DD');
    endDate = today.add(event.target.value - 1, 'days').format('YYYY-MM-DD');
    dispatch(addStartDate(startDate));
    dispatch(addEndDate(endDate));
    setValue({
      startDate: startDate,
      endDate: endDate,
    });
  };

  const handleCustomRangeChange = (event) => {
    setCustomRange(event.target.checked);
  };

  const validateIntraCorrelationThreshold = (value) => {
    if (value < 0 || value > 1) {
      return 'Intra correlation threshold should range from 0 to 1';
    }
    return '';
  };

  const validateInterCorrelationThreshold = (value) => {
    if (value < 0 || value > 1) {
      return 'Inter correlation threshold should range from 0 to 1';
    }
    return '';
  };

  const validateDataCompletenessThreshold = (value) => {
    if (value < 0 || value > 100) {
      return 'Data completeness threshold should range from 1 to 100';
    }
    return '';
  };

  const validateDifferencesThreshold = (value) => {
    if (value < 0 || value > 5) {
      return 'Differences threshold should range from 0 to 5';
    }
    return '';
  };

  return (
    <div className='pt-6'>
      <div className='px-6 pb-7'>
        <h3 className='text-xl'>Choose collocation period</h3>
        <h5 className='text-grey-300 text-sm mb-4'>Select your collocation period</h5>
        {collationDurations.map((option, index) => (
          <div
            className='border border-grey-100 py-1 px-4 rounded-md my-2 flex flex-row justify-between items-center text-sm'
            key={index}
            data-testid='duration-option'
          >
            {option} {'days'}
            <input
              type='radio'
              name='duration'
              value={option}
              checked={duration === option && !customRange}
              onChange={handleDurationChange}
            />
          </div>
        ))}
        <div className='border border-grey-100 py-2 px-4 rounded-md my-2 flex flex-row justify-between items-center text-sm'>
          Custom
          <input
            type='radio'
            name='duration'
            value='custom'
            checked={customRange}
            onChange={handleCustomRangeChange}
          />
        </div>
        {customRange && (
          <div className='border-none border-r-0 border-l-0 border-b-0 border-t-skeleton'>
            <div className='mb-8 flex flex-row justify-between items-center px-6'>
              {/* TODO: Duration upon range selection */}
              <Datepicker
                value={value}
                onChange={handleValueChange}
                placeholder={'YYYY-MM-DD to YYYY-MM-DD'}
                separator={'to'}
                readOnly={true}
                inputClassName='font-sans text-xs text-grey-300 font-normal'
                classNames={{ calendar: 'bg-white' }}
              />
            </div>
          </div>
        )}
        <div>
          <h3 className='text-xl'>Batch configuration</h3>
          <h5 className='text-grey-300 text-sm mb-4'>
            Customise the batch configurations. Can be modified later
          </h5>
          <div className='form-control w-full'>
            <label className='label'>
              <span className='label-text'>Batch name*</span>
            </label>
            <input
              type='text'
              value={scheduledBatchName}
              className='input input-bordered input-sm w-full rounded-md mb-3 bg-gray-50 border-none'
              onChange={(e) => {
                dispatch(addScheduledBatchName(e.target.value));
              }}
              required
              aria-required='true'
            />
            {
              <p className='text-red-500 text-xs'>
                {scheduledBatchName.length < 1 && 'Batch name is required'}
              </p>
            }
          </div>
          <div className='form-control w-full'>
            <label className='label'>
              <span className='label-text'>Data completeness threshold</span>
            </label>
            <input
              type='text'
              value={scheduledBatchDataCompletenessThreshold}
              className='input input-bordered input-sm w-full rounded-md mb-3 bg-gray-50 border-none'
              onChange={(e) => {
                setScheduledBatchDataCompletenessThreshold(e.target.value);
                dispatch(addScheduledBatchDataCompletenessThreshold(e.target.value));
              }}
            />
            {
              <p className='text-red-500 text-xs'>
                {validateDataCompletenessThreshold(scheduledBatchDataCompletenessThreshold)}
              </p>
            }
          </div>
          <div className='form-control w-full'>
            <label className='label'>
              <span className='label-text'>Intercorrelation threshold</span>
            </label>
            <input
              type='text'
              value={scheduledBatchInterCorrelationThreshold}
              className='input input-bordered input-sm w-full rounded-md mb-3 bg-gray-50 border-none'
              onChange={(e) => {
                setScheduledBatchInterCorrelationThreshold(e.target.value);
                dispatch(addScheduledBatchInterCorrelationThreshold(e.target.value));
              }}
            />
            {
              <p className='text-red-500 text-xs'>
                {validateInterCorrelationThreshold(scheduledBatchInterCorrelationThreshold)}
              </p>
            }
          </div>
          <div className='form-control w-full'>
            <label className='label'>
              <span className='label-text'>Intracorrelation threshold</span>
            </label>
            <input
              type='text'
              value={scheduledBatchIntraCorrelationThreshold}
              className='input input-bordered input-sm w-full rounded-md mb-3 bg-gray-50 border-none'
              onChange={(e) => {
                setScheduledBatchIntraCorrelationThreshold(e.target.value);
                dispatch(addScheduledBatchIntraCorrelationThreshold(e.target.value));
              }}
            />
            {
              <p className='text-red-500 text-xs'>
                {validateIntraCorrelationThreshold(scheduledBatchIntraCorrelationThreshold)}
              </p>
            }
          </div>
          <div className='form-control w-full'>
            <label className='label'>
              <span className='label-text'>Differences threshold</span>
            </label>
            <input
              type='text'
              value={scheduledBatchDifferencesThreshold}
              className='input input-bordered input-sm w-full rounded-md mb-3 bg-gray-50 border-none'
              onChange={(e) => {
                setScheduledBatchDifferencesThreshold(e.target.value);
                dispatch(addScheduledBatchDifferencesThreshold(e.target.value));
              }}
            />
            {
              <p className='text-red-500 text-xs'>
                {validateDifferencesThreshold(scheduledBatchDifferencesThreshold)}
              </p>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleCalendar;
