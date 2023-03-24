import Box from '@/components/Collocation/Report/box';
import Button from '@/components/Button';
import ArrowDropDownIcon from '@/icons/arrow_drop_down';
import PollutantDropdown from '@/components/Collocation/Report/PollutantDropdown';
import CorrelationChart from '@/components/Collocation/Report/Charts/CorrelationChart';

const CustomLegend = () => {
  return (
    <div className='flex items-center justify-end mt-4 mb-3'>
      <div className='flex justify-center items-center bg-grey-200 h-5 w-[93px] rounded-md'>
        <hr className='w-4 h-[2px] bg-purple-550 mr-2' />
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
}) => {
  return (
    <Box
      isBigTitle
      title='Intra Sensor Correlation'
      subtitle='Detailed comparison of data between two sensors that are located within the same device. By comparing data from sensors to create a more accurate and reliable reading.'
      contentLink='#'
    >
      <div className='flex flex-col justify-start w-full'>
        <Button className='max-w-[115px] h-10 bg-purple-600 rounded-lg text-base font-semibold text-purple-700 ml-6 mb-6'>
          <span className='uppercase'>{deviceName}</span>
          {/* <span className='ml-2 text-purple-700'>
            <ArrowDropDownIcon fillColor='#584CAB' />
          </span> */}
        </Button>
        <PollutantDropdown
          pollutantValue={intraCorrelationConcentration}
          handlePollutantChange={toggleIntraCorrelationConcentrationChange}
          options={[
            { value: '2.5', label: 'pm2_5' },
            { value: '10', label: 'pm10' },
          ]}
        />
        <CorrelationChart
          data={collocationResults}
          pmConcentration={intraCorrelationConcentration}
          hasCustomLegend
          CustomLegend={CustomLegend}
        />
      </div>
    </Box>
  );
};

export default IntraCorrelationChart;
