import Layout from '@/components/Layout';
import Box from '@/components/Collocation/Report/box';
import NavigationBreadCrumb from '@/components/Navigation/breadcrumb';
import { useRouter } from 'next/router';

const MonitorReport = () => {
  const router = useRouter();

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
        <div>hello world</div>
      </Box>
    </Layout>
  );
};

export default MonitorReport;
