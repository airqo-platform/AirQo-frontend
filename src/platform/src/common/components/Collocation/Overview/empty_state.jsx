import React from 'react';
import Card from '@/components/CardWrapper';
import CollocationNone from '@/icons/Collocation/overview.svg';

const EmptyState = () => (
  <Card className="mx-auto py-28 flex justify-center items-center">
    <div className="flex flex-col items-center">
      <CollocationNone />
      <div className="text-center mt-10">
        <h4 className="text-xl font-normal mb-6">
          You have no devices under collocation
        </h4>
        <p className="text-grey-300 text-sm font-light max-w-96">
          This is where you&apos;ll find quick highlights of your collocated
          monitors
        </p>
      </div>
    </div>
  </Card>
);

export default EmptyState;
