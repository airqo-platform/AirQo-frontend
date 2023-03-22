import Box from '@/components/Collocation/Report/box';
import Button from '@/components/Button';
import ArrowDropDownIcon from '@/icons/arrow_drop_down';
import PollutantDropdown from '@/components/Collocation/Report/PollutantDropdown';
import CorrelationChart from '@/components/Collocation/Report/Charts/CorrelationChart';

const InterCorrelationChart = ({
  interCorrelationConcentration,
  toggleInterCorrelationConcentrationChange,
  collocationResults,
  correlationDevices,
}) => {
  return (
    <Box
      isBigTitle
      title='Inter Sensor Correlation'
      subtitle='Detailed comparison of data between two sensors that are located within the same device. By comparing data from sensors to create a more accurate and reliable reading.'
      contentLink='#'
    >
      <div className='flex flex-col justify-start w-full'>
        <div className='flex justify-between'>
          <Button className='max-w-[115px] h-10 bg-purple-600 rounded-lg text-base font-semibold text-purple-700 ml-6 mb-6'>
            <span className='uppercase'>aq_g5_87</span>
            <span className='ml-2 text-purple-700'>
              <ArrowDropDownIcon fillColor='#584CAB' />
            </span>
          </Button>
          {correlationDevices.length == 2 ? (
            <div>
              <Button className='max-w-[115px] h-10 bg-purple-600 rounded-lg text-base font-semibold text-purple-700 ml-6 mb-6'>
                <span className='uppercase'>aq_g5_87</span>
                <span className='ml-2 text-purple-700'>
                  <ArrowDropDownIcon fillColor='#584CAB' />
                </span>
              </Button>
            </div>
          ) : (
            <div className='flex flex-col-reverse md:flex-row items-center mr-6 mb-6'>
              <span className='text-sm text-black-600 opacity-70 max-w-[96px] md:max-w-full'>
                Select a monitor to compare with AQG504
              </span>
              <Button className='max-w-[115px] h-10 bg-blue-200 rounded-lg text-base font-semibold text-purple-700 ml-2'>
                <span className='uppercase text-blue-300'>aq_g5_96</span>
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
        <CorrelationChart
          data={collocationResults.intra_sensor_correlation}
          pmConcentration={interCorrelationConcentration}
        />
      </div>
    </Box>
  );
};

export default InterCorrelationChart;
