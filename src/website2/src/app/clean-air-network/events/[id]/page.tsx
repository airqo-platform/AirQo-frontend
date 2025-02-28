import React from 'react';

import SingleEvent from '@/views/cleanAirNetwork/events/SingleEvent';

const page = ({ params }: { params: any }) => {
  return (
    <div>
      <SingleEvent id={params.id} />
    </div>
  );
};

export default page;
