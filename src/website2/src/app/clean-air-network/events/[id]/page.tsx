import React from 'react';

import SingleEvent from '@/views/cleanairforum/events/SingleEvent';

const page = ({ params }: { params: any }) => {
  return (
    <div>
      <SingleEvent id={params.id} />
    </div>
  );
};

export default page;
