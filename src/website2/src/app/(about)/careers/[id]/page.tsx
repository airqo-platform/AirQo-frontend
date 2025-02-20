import DetailsPage from '@/views/careers/DetailsPage';

const page = ({ params }: { params: any }) => {
  return (
    <div>
      <DetailsPage id={params.id} />
    </div>
  );
};

export default page;
