import Layout from '@/components/Layout';
import Box from '@/components/Collocation/Report/box';
import NavigationBreadCrumb from '@/components/Navigation/breadcrumb';
import { useRouter } from 'next/router';
import DataCompletenessTable from '@/components/Collocation/Report/DataCompletenessTable';

const MonitorReport = () => {
  const router = useRouter();
  const collocationDevices = [
    {
      monitor_name: 'Monitor A',
      expected_records: 730,
      data_completeness: 85,
      missing_data: 15,
      total_hourly_count: 620,
      start_date: 'Oct 13, 2021',
      end_date: 'Nov 13, 2021',
    },
    {
      monitor_name: 'Monitor B',
      expected_records: 1000,
      data_completeness: 90,
      missing_data: 10,
      total_hourly_count: 950,
      start_date: 'Jan 1, 2022',
      end_date: 'Feb 1, 2022',
    },
    {
      monitor_name: 'Monitor C',
      expected_records: 8760,
      data_completeness: 70,
      missing_data: 30,
      total_hourly_count: 6132,
      start_date: 'Jan 1, 2021',
      end_date: 'Dec 31, 2021',
    },
  ];

  return (
    <Layout>
      <NavigationBreadCrumb backLink={'/collocation/reports'} navTitle={'Monitor Report'} />
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
        <DataCompletenessTable collocationDevices={collocationDevices} />
      </Box>
    </Layout>
  );
};

export default MonitorReport;
