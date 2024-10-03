import MainLayout from '@/components/layout/MainLayout';
import ReportPage from '@/components/pages/home/ReportPage';

interface IReport {
  reportID: string;
}

const Page = ({ params }: { params: IReport }) => {
  return (
    <MainLayout>
      <ReportPage params={params} />
    </MainLayout>
  );
};

export default Page;
