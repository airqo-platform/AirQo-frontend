import Box from '@/components/Collocation/Report/box';
import Button from '@/components/Button';
import ArrowDropDownIcon from '@/icons/arrow_drop_down';
import PollutantDropdown from '@/components/Collocation/Report/PollutantDropdown';
import CorrelationChart from '@/components/Collocation/Report/Charts/CorrelationLineChart';
import { useGetDeviceStatusSummaryQuery } from '@/lib/store/services/collocation';
import Spinner from '@/components/Spinner';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import {
  addActiveSelectedDeviceCollocationReportData,
  addActiveSelectedDeviceReport,
} from '@/lib/store/services/collocation/collocationDataSlice';
import moment from 'moment';
import { useGetCollocationResultsMutation } from '@/lib/store/services/collocation';

const CustomLegend = () => {
  '#8884d8', '#82ca9d';
  return (
    <div className='flex items-center justify-end mt-4 mb-3 mr-7'>
      <div className='flex justify-center items-center bg-grey-200 h-5 w-[93px] rounded-md mr-2'>
        <hr className='w-4 h-[2px] border border-purple-550 mr-2' />
        <span className='text-xs text-grey-300'>Sensor 01</span>
      </div>
      <div className='flex justify-center items-center bg-grey-200 h-5 w-[93px] rounded-md'>
        <hr className='w-4 h-[2px] border border-purple-550 border-dashed mr-2' />
        <span className='text-xs text-grey-300'>Sensor 02</span>
      </div>
      <span className='uppercase mx-2 text-[10px] text-grey-800'>Compared to</span>
      <div className='flex justify-center items-center bg-grey-200 h-5 w-[93px] rounded-md mr-2'>
        <hr className='w-4 h-[2px] border border-purple-400 mr-2' />
        <span className='text-xs text-grey-300'>Sensor 01</span>
      </div>
      <div className='flex justify-center items-center bg-grey-200 h-5 w-[93px] rounded-md'>
        <hr className='w-4 h-[2px] border border-purple-400 border-dashed mr-2' />
        <span className='text-xs text-grey-300'>Sensor 02</span>
      </div>
    </div>
  );
};

const InterCorrelationChart = ({
  interCorrelationConcentration,
  toggleInterCorrelationConcentrationChange,
  collocationResults,
  correlationDevices,
  isLoading,
  deviceList,
}) => {
  const router = useRouter();
  const { device, startDate, endDate } = router.query;
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);

  const activeSelectedDeviceCollocationReportData = useSelector(
    (state) => state.collocationData.activeSelectedDeviceCollocationReportData,
  );
  const activeSelectedDeviceReport = useSelector(
    (state) => state.collocationData.activeSelectedDeviceReport,
  );

  useEffect(() => {
    if (!activeSelectedDeviceCollocationReportData) {
      dispatch(addActiveSelectedDeviceCollocationReportData(collocationResults));
    }
  }, [activeSelectedDeviceCollocationReportData, collocationResults]);

  useEffect(() => {
    const getActiveSelectedDeviceReport = () => {
      if (!device || !startDate || !endDate) return;
      dispatch(addActiveSelectedDeviceReport({ device, startDate, endDate }));
    };

    getActiveSelectedDeviceReport();
  }, [device, startDate, endDate]);

  const handleSelect = async (newDevice, newStartDate, newEndDate) => {
    let startDate = moment(newStartDate).format('YYYY-MM-DD');
    let endDate = moment(newEndDate).format('YYYY-MM-DD');
    dispatch(addActiveSelectedDeviceReport({ device: newDevice, startDate, endDate }));

    const response = await getCollocationResultsData({
      devices: newDevice,
      startDate,
      endDate,
    });

    // if (!response.error) {
    //   const updatedQuery = {
    //     ...router.query,
    //     device: newDevice,
    //     startDate,
    //     endDate,
    //   };

    //   router.replace({
    //     pathname: `/collocation/reports/monitor_report/${newDevice}`,
    //     query: updatedQuery,
    //   });

    //   dispatch(addActiveSelectedDeviceCollocationReportData(response.data.data));
    // }
    setIsOpen(false);
  };

  return (
    <Box
      isBigTitle
      title='Inter Sensor Correlation'
      subtitle='Detailed comparison of data between two sensors that are located within the same device. By comparing data from sensors to create a more accurate and reliable reading.'
      contentLink='#'
    >
      {isLoading ? (
        <div data-testid='correlation-data-loader'>
          <Spinner />
        </div>
      ) : (
        <div className='flex flex-col justify-start w-full'>
          <div className='flex justify-between'>
            <div className='relative'>
              <Button
                className='relative w-auto h-10 bg-purple-600 rounded-lg text-base font-semibold text-purple-700 ml-6'
                onClick={() => setIsOpen(!isOpen)}
              >
                <span className='uppercase'>
                  {activeSelectedDeviceReport && activeSelectedDeviceReport.device}
                </span>
                <span className='ml-2 text-purple-700'>
                  <ArrowDropDownIcon fillColor='#584CAB' />
                </span>
              </Button>
              {isOpen && (
                <ul className='absolute z-30 bg-white mt-1 ml-6 py-1 w-36 rounded border border-gray-200 max-h-60 overflow-y-auto text-sm'>
                  {deviceList.map((device, index) => (
                    <>
                      {activeSelectedDeviceReport.device !== device.device_name && (
                        <li
                          key={index}
                          className='px-4 py-2 hover:bg-gray-200 cursor-pointer text-xs uppercase'
                          onClick={() =>
                            handleSelect(device.device_name, device.start_date, device.end_date)
                          }
                        >
                          {device.device_name}
                        </li>
                      )}
                    </>
                  ))}
                </ul>
              )}
            </div>
            {correlationDevices.length == 2 ? (
              <div>
                <Button className='max-w-[115px] h-10 bg-purple-600 rounded-lg text-base font-semibold text-purple-700 ml-6 mb-6'>
                  <span className='text-base'>{deviceName}</span>
                  <span className='ml-2 text-purple-700'>
                    <ArrowDropDownIcon fillColor='#584CAB' />
                  </span>
                </Button>
              </div>
            ) : (
              <div className='flex flex-col-reverse md:flex-row items-center mr-6 mb-6'>
                <span className='text-sm text-black-600 opacity-70 max-w-[96px] md:max-w-full'>
                  Select a monitor to compare with{' '}
                  <span className='uppercase'>
                    {activeSelectedDeviceReport && activeSelectedDeviceReport.device}
                  </span>
                </span>
                <Button className='w-auto h-10 bg-blue-200 rounded-lg text-base font-semibold text-purple-700 ml-2'>
                  <span className='text-blue-300 text-base'>Select Monitor</span>
                  <span className='ml-2 text-purple-700'>
                    <ArrowDropDownIcon fillColor='#584CAB' />
                  </span>
                </Button>
              </div>
            )}
          </div>
          <PollutantDropdown
            pollutantValue={interCorrelationConcentration}
            handlePollutantChange={toggleInterCorrelationConcentrationChange}
            options={[
              { value: '2.5', label: 'pm2_5' },
              { value: '10', label: 'pm10' },
            ]}
          />
          {collocationResults ? (
            <CorrelationChart
              data={collocationResults}
              pmConcentration={interCorrelationConcentration}
              isInterSensorCorrelation
            />
          ) : (
            <div className='text-center text-grey-300'>No data available</div>
          )}
          {/* <CustomLegend /> */}
        </div>
      )}
    </Box>
  );
};

export default InterCorrelationChart;
