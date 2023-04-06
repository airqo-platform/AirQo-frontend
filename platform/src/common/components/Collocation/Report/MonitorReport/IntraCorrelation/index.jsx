import Box from '@/components/Collocation/Report/box';
import Button from '@/components/Button';
import ArrowDropDownIcon from '@/icons/arrow_drop_down';
import PollutantDropdown from '@/components/Collocation/Report/PollutantDropdown';
import CorrelationChart from '@/components/Collocation/Report/Charts/CorrelationLineChart';
import Spinner from '@/components/Spinner';
import { useEffect, useState } from 'react';
import { useGetCollocationResultsMutation } from '@/lib/store/services/collocation';
import moment from 'moment';

const CustomLegend = () => {
  return (
    <div className='flex items-center justify-end mt-4 mb-3 mr-7'>
      <div className='flex justify-center items-center bg-grey-200 h-5 w-[93px] rounded-md'>
        <hr className='w-4 h-[2px] border border-purple-400 mr-2' />
        <span className='text-xs text-grey-300'>Sensor 01</span>
      </div>
      <span className='uppercase mx-2 text-[10px] text-grey-800'>Compared to</span>
      <div className='flex justify-center items-center bg-grey-200 h-5 w-[93px] rounded-md'>
        <hr className='w-4 h-[2px] border border-purple-400 border-dashed mr-2' />
        <span className='text-xs text-grey-300'>Sensor 02</span>
      </div>
    </div>
  );
};

const IntraCorrelationChart = ({
  intraCorrelationConcentration,
  toggleIntraCorrelationConcentrationChange,
  collocationResults,
  deviceName,
  isLoading,
  deviceList,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(deviceName);
  const [newCollocationResults, setNewCollocationResults] = useState(collocationResults);

  useEffect(() => {
    if (!newCollocationResults) {
      setNewCollocationResults(collocationResults); // TODO: Update this to use the new collocation results from redux store
    }
  }, [collocationResults]);

  useEffect(() => {
    setSelectedDevice(deviceName);
  }, [deviceName]);

  const [
    getCollocationResultsData,
    {
      isError: isFetchCollocationResultsError,
      isSuccess: isFetchCollocationResultsSuccess,
      isLoading: isFetchCollocationResultsLoading,
    },
  ] = useGetCollocationResultsMutation();

  const handleSelect = async (device, startDate, endDate) => {
    setSelectedDevice(device);
    onSelect(device);
    setIsOpen(false);

    try {
      const result = await getCollocationResultsData({
        devices: device,
        startDate: moment(startDate).format('YYYY-MM-DD'),
        endDate: moment(endDate).format('YYYY-MM-DD'),
      });
      setNewCollocationResults(result.data.data);
    } catch (error) {
      console.error('Error fetching collocation data:', error);
    }
  };

  return (
    <Box
      isBigTitle
      title='Intra Sensor Correlation'
      subtitle='Detailed comparison of data between two sensors that are located within the same device. By comparing data from sensors to create a more accurate and reliable reading.'
      contentLink='#'
    >
      {isLoading || isFetchCollocationResultsLoading ? (
        <div className='h-20' data-testid='correlation-data-loader'>
          <Spinner />
        </div>
      ) : (
        <div className='flex flex-col justify-start w-full'>
          <div className='relative'>
            <Button
              className='relative w-auto h-10 bg-purple-600 rounded-lg text-base font-semibold text-purple-700 ml-6'
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className='uppercase'>{selectedDevice}</span>
              <span className='ml-2 text-purple-700'>
                <ArrowDropDownIcon fillColor='#584CAB' />
              </span>
            </Button>
            {isOpen && (
              <ul className='absolute z-30 bg-white mt-1 ml-6 py-1 w-36 rounded border border-gray-200 max-h-60 overflow-y-auto text-sm'>
                {deviceList.map((device, index) => (
                  <>
                    {deviceName !== device.device_name && (
                      <li
                        key={index}
                        className='px-4 py-2 hover:bg-gray-200 cursor-pointer text-xs uppercase'
                        onClick={() =>
                          handleSelect(device.device_name, device.startDate, device.endDate)
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
          <PollutantDropdown
            pollutantValue={intraCorrelationConcentration}
            handlePollutantChange={toggleIntraCorrelationConcentrationChange}
            options={[
              { value: '2.5', label: 'pm2_5' },
              { value: '10', label: 'pm10' },
            ]}
          />
          {collocationResults && newCollocationResults ? (
            <CorrelationChart
              data={newCollocationResults}
              pmConcentration={intraCorrelationConcentration}
              isInterSensorCorrelation
            />
          ) : (
            <div className='text-center text-grey-300'>No data available</div>
          )}
          <CustomLegend />
        </div>
      )}
    </Box>
  );
};

export default IntraCorrelationChart;
