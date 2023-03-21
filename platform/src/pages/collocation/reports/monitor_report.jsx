import Layout from '@/components/Layout';
import Box from '@/components/Collocation/Report/box';
import NavigationBreadCrumb from '@/components/Navigation/breadcrumb';
import { useRouter } from 'next/router';
import DataCompletenessTable from '@/components/Collocation/Report/DataCompletenessTable';
import { wrapper } from '@/lib/store';
import {
  useGetCollocationResultsQuery,
  getRunningQueriesThunk,
  getCollocationResults,
} from '@/lib/store/services/collocation';

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

const MonitorReport = ({ devices, startDate, endDate }) => {
  const router = useRouter();

  const {
    data: data,
    isLoading,
    // isSuccess,
    isError,
    error,
  } = useGetCollocationResultsQuery({
    devices: ['aq_g5_87'],
    startDate: '2023-01-21',
    endDate: '2023-01-25',
  });
  let collocationResults = data ? data.data : [];

  return (
    <Layout>
      <NavigationBreadCrumb backLink={'/collocation/reports'} navTitle={'Monitor Report'} />
      {!isLoading && (
        <>
          <Box
            isBigTitle
            title='Intra Sensor Correlation'
            subtitle='Detailed comparison of data between two sensors that are located within the same device. By comparing data from sensors to create a more accurate and reliable reading.'
            contentLink='#'
          >
            <div>hello world</div>
          </Box>
          <Box
            isBigTitle
            title='Data Completeness'
            subtitle='Detailed comparison of data between two sensors that are located within the same device. By comparing data from sensors to create a more accurate and reliable reading.'
            contentLink='#'
          >
            <DataCompletenessTable dataCompletenessReults={collocationResults.data_completeness} />
          </Box>
        </>
      )}
    </Layout>
  );
};

export default MonitorReport;
