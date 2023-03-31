import Layout from '@/components/Layout';
import HeaderNav from '@/components/Collocation/header';
import Box from '@/components/Collocation/Report/box';
import PollutantDropdown from '@/components/Collocation/Report/PollutantDropdown';
import CorrelationChart from '@/components/Collocation/Report/Charts/CorrelationLineChart';
import { useEffect, useState } from 'react';
import {
  useGetCollocationResultsMutation,
  useGetDataCompletenessResultsMutation,
} from '@/lib/store/services/collocation';
import ContentBox from '@/components/Layout/content_box';
import CustomTable from '@/components/Table';
import CorrelationBarChart from '@/components/Collocation/Report/Charts/CorrelationBarChart';

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

const Reports = () => {
  const [getCollocationResultsData, { isError, isSuccess }] = useGetCollocationResultsMutation();

  // const [getDataCompletenessResultsData, {isError , isSuccess}] = useGetDataCompletenessResultsMutation();

  //   const [dataCompletenessResults, setDataCompletenessResults] = useState(null);

  const [collocationResults, setCollocationResults] = useState(null);
  let device = 'aq_g4_100';
  let startDate = '2023-01-21';
  let endDate = '2023-01-25';

  useEffect(() => {
    const fetchCollocationResults = async () => {
      const response = await getCollocationResultsData({
        devices: device,
        startDate: startDate,
        endDate: endDate,
      });
      setCollocationResults(response.data.data);
    };
    fetchCollocationResults();
  }, [getCollocationResultsData, device, startDate, endDate]);

  // const columnHeaders = isSuccess && collocationResults
  // ? Object.keys(collocationResults[0]).filter((key) => key !== 'timestamp')
  // : [Object.keys(data[0])[1]]; // Gets the device names

  const [pmConcentration, setPmConcentration] = useState('10');

  const togglePmConcentrationChange = (newValue) => {
    setPmConcentration(newValue);
  };

  const data = [
    ['John', 'Doe', 30, 'john.doe@example.com'],
    ['Jane', 'Doe', 25, 'jane.doe@example.com'],
    ['Bob', 'Smith', 45, 'bob.smith@example.com'],
    ['Alice', 'Johnson', 28, 'alice.johnson@example.com'],
  ];

  const sortableColumns = [0, 1, 2, 3];

  const handleRowSelect = (selectedRows) => {
    console.log(selectedRows);
    // do something with the selected rows data
  };
  return (
    <Layout>
      <HeaderNav component={'Reports'} />
      {isSuccess && collocationResults && (
        <>
          <div className='grid grid-cols-1 md:grid-cols-2'>
            <Box
              title='Intra Sensor Correlation'
              subtitle='Detailed comparison of data between two sensors that are located within the same device.'
            >
              <div
                className='flex flex-col justify-start w-full'
                data-testid='intra-correlation-chart'
              >
                <PollutantDropdown
                  pollutantValue={pmConcentration}
                  handlePollutantChange={togglePmConcentrationChange}
                  options={[
                    { value: '2.5', label: 'pm2_5' },
                    { value: '10', label: 'pm10' },
                  ]}
                />
                <CorrelationChart
                  data={collocationResults}
                  pmConcentration={pmConcentration}
                  height={'210'}
                  isInterSensorCorrelation
                />
              </div>
            </Box>
            <Box
              title='Intra Sensor Correlation'
              subtitle='Detailed comparison of data between two sensors that are located within the same device.'
            >
              <div
                className='flex flex-col justify-start w-full'
                data-testid='intra-correlation-chart'
              >
                <PollutantDropdown
                  pollutantValue={pmConcentration}
                  handlePollutantChange={togglePmConcentrationChange}
                  options={[
                    { value: '2.5', label: 'pm2_5' },
                    { value: '10', label: 'pm10' },
                  ]}
                />
                <CorrelationBarChart height={'210'} pmConcentration={pmConcentration} />
              </div>
            </Box>
          </div>
          <ContentBox>
            {isSuccess && (
              <CustomTable
                headers={['First Name', 'Last Name', 'Age', 'Email']}
                data={data}
                sortableColumns={sortableColumns}
                activeColumnIndex={1}
                onRowSelect={handleRowSelect}
              />
            )}
          </ContentBox>
        </>
      )}
    </Layout>
  );
};

export default Reports;
