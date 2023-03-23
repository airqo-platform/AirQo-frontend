import Layout from '@/components/Layout';
import NavigationBreadCrumb from '@/components/Navigation/breadcrumb';
import { useRouter } from 'next/router';
import DataCompletenessTable from '@/components/Collocation/Report/MonitorReport/DataCompletenessTable';
import { wrapper } from '@/lib/store';
import {
  useGetCollocationResultsQuery,
  getRunningQueriesThunk,
  getCollocationResults,
} from '@/lib/store/services/collocation';
import { useState } from 'react';
import InterCorrelationChart from '@/components/Collocation/Report/MonitorReport/InterCorrelation';
import IntraCorrelationChart from '@/components/Collocation/Report/MonitorReport/IntraCorrelation';

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
  console.log(device);

  const {
    data: data,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetCollocationResultsQuery({
    devices: ['aq_g5_87'],
    startDate: '2023-01-21',
    endDate: '2023-01-25',
  });
  let collocationResults = data ? data.data : [];

  const [correlationDevices, setCorrelationDevices] = useState(['aq_g5_87']);
  const [intraCorrelationConcentration, setIntraCorrelationConcentration] = useState('2.5');
  const [interCorrelationConcentration, setInterCorrelationConcentration] = useState('2.5');

  const toggleIntraCorrelationConcentrationChange = (newValue) => {
    setIntraCorrelationConcentration(newValue);
  };

  const toggleInterCorrelationConcentrationChange = (newValue) => {
    setInterCorrelationConcentration(newValue);
  };

  return (
    <Layout>
      <NavigationBreadCrumb backLink={'/collocation/reports'} navTitle={'Monitor Report'} />
      {!isLoading && (
        <>
          <IntraCorrelationChart
            collocationResults={collocationResults}
            intraCorrelationConcentration={intraCorrelationConcentration}
            toggleIntraCorrelationConcentrationChange={toggleIntraCorrelationConcentrationChange}
          />

          <InterCorrelationChart
            collocationResults={collocationResults}
            interCorrelationConcentration={interCorrelationConcentration}
            toggleInterCorrelationConcentrationChange={toggleInterCorrelationConcentrationChange}
            correlationDevices={correlationDevices}
          />

          <DataCompletenessTable dataCompletenessReults={collocationResults.data_completeness} />
        </>
      )}
    </Layout>
  );
};

export default MonitorReport;
