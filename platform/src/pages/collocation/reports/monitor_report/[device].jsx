import Layout from '@/components/Layout';
import NavigationBreadCrumb from '@/components/Navigation/breadcrumb';
import { useRouter } from 'next/router';
import DataCompletenessTable from '@/components/Collocation/Report/MonitorReport/DataCompletenessTable';
import { wrapper } from '@/lib/store';
import {
  useGetCollocationResultsMutation,
  getRunningQueriesThunk,
  getCollocationResults,
} from '@/lib/store/services/collocation';
import { useEffect, useState } from 'react';
import InterCorrelationChart from '@/components/Collocation/Report/MonitorReport/InterCorrelation';
import IntraCorrelationChart from '@/components/Collocation/Report/MonitorReport/IntraCorrelation';
import Toast from '@/components/Toast';

export const getServerSideProps = wrapper.getServerSideProps((store) => async (context) => {
  const name = context.params?.name;
  if (typeof name === 'string') {
    store.dispatch(getCollocationResults.initiate(name));
  }

  await Promise.all(store.dispatch(getRunningQueriesThunk()));

  return {
    props: {},
  };
});

const MonitorReport = () => {
  const router = useRouter();
  const { device, startDate, endDate } = router.query;
  const [getCollocationResultsData, { isError, isSuccess }] = useGetCollocationResultsMutation();
  const [collocationResults, setCollocationResults] = useState(null);

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

  const [correlationDevices, setCorrelationDevices] = useState([device]);
  const [intraCorrelationConcentration, setIntraCorrelationConcentration] = useState('10');
  const [interCorrelationConcentration, setInterCorrelationConcentration] = useState('10');

  const toggleIntraCorrelationConcentrationChange = (newValue) => {
    setIntraCorrelationConcentration(newValue);
  };

  const toggleInterCorrelationConcentrationChange = (newValue) => {
    setInterCorrelationConcentration(newValue);
  };

  return (
    <Layout>
      <NavigationBreadCrumb backLink={'/collocation/reports'} navTitle={'Monitor Report'} />
      {(isError || !isSuccess) && (
        <Toast
          type={'error'}
          timeout={20000}
          message="We're sorry, but our server is currently unavailable. We are working to resolve the issue and apologize for the inconvenience."
          dataTestId={'monitor-report-error-toast'}
        />
      )}
      {isSuccess && (
        <>
          <IntraCorrelationChart
            collocationResults={collocationResults}
            intraCorrelationConcentration={intraCorrelationConcentration}
            toggleIntraCorrelationConcentrationChange={toggleIntraCorrelationConcentrationChange}
            deviceName={device}
          />

          <InterCorrelationChart
            collocationResults={collocationResults}
            interCorrelationConcentration={interCorrelationConcentration}
            toggleInterCorrelationConcentrationChange={toggleInterCorrelationConcentrationChange}
            correlationDevices={correlationDevices}
            deviceName={device}
            startDate={startDate}
            endDate={endDate}
          />

          {/* <DataCompletenessTable dataCompletenessReults={collocationResults} /> */}
        </>
      )}
    </Layout>
  );
};

export default MonitorReport;
