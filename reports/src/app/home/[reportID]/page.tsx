import ReportPage from '@/components/pages/home/ReportPage';
import MainLayout from '@/layout/MainLayout';

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
