import SingleEvent from '@/views/events/SingleEvent';

const page = ({ params }: { params: any }) => {
  return (
    <div>
      <SingleEvent id={params.id} />
    </div>
  );
};

export default page;
