import React from 'react';

import DetailsPage from './DetailsPage';

const page = ({ params }: { params: any }) => {
  return (
    <div>
      <DetailsPage id={params.id} />
    </div>
  );
};

export default page;
