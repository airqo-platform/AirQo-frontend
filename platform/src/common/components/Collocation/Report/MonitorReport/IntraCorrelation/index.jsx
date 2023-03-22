import Box from '@/components/Collocation/Report/box';
import Button from '@/components/Button';
import ArrowDropDownIcon from '@/icons/arrow_drop_down';
import PollutantDropdown from '@/components/Collocation/Report/PollutantDropdown';
import CorrelationChart from '@/components/Collocation/Report/Charts/CorrelationChart';

const IntraCorrelationChart = ({
  intraCorrelationConcentration,
  toggleIntraCorrelationConcentrationChange,
  collocationResults,
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
          <span className='uppercase'>aq_g5_87</span>
          <span className='ml-2 text-purple-700'>
            <ArrowDropDownIcon fillColor='#584CAB' />
          </span>
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
          data={collocationResults.intra_sensor_correlation}
          pmConcentration={intraCorrelationConcentration}
        />
      </div>
    </Box>
  );
};

export default IntraCorrelationChart;
