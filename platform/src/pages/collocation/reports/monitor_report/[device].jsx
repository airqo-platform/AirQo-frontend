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

  const {
    data: data,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetCollocationResultsQuery({
    devices: device,
    startDate: startDate,
    endDate: endDate,
  });
  let collocationResults = data?.data;

  const [correlationDevices, setCorrelationDevices] = useState(['aq_g5_87']);
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
      <NavigationBreadCrumb backLink={'/collocation/collocate'} navTitle={'Monitor Report'} />
      {isSuccess && (
        <>
          <IntraCorrelationChart
            collocationResults={collocationResults.intra_sensor_correlation[0].data}
            intraCorrelationConcentration={intraCorrelationConcentration}
            toggleIntraCorrelationConcentrationChange={toggleIntraCorrelationConcentrationChange}
            deviceName={device}
          />

          <InterCorrelationChart
            collocationResults={collocationResults.inter_sensor_correlation}
            interCorrelationConcentration={interCorrelationConcentration}
            toggleInterCorrelationConcentrationChange={toggleInterCorrelationConcentrationChange}
            correlationDevices={correlationDevices}
            deviceName={device}
            startDate={startDate}
            endDate={endDate}
          />

          <DataCompletenessTable dataCompletenessReults={collocationResults.data_completeness} />
        </>
      )}
    </Layout>
  );
};

export default MonitorReport;
