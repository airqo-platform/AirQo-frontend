const GraphCard = () => (
  <div className='grid grid-cols-5 divide-x divide-grey-150'>
    <div className='col-span-3'>
      <div className='flex flex-col py-4 px-6 ml-2'>
        <div className='flex flex-row items-center justify-between'>
          <div className='items-center w-[94px] h-4 bg-skeleton rounded mr-2' />
          <div className='w-[68px] h-4 bg-skeleton rounded' />
        </div>
        <div className='flex flex-row'>
          <div className='mt-4 bg-skeleton w-[94px] h-7 rounded' />
        </div>
        <div className='mt-10 flex items-end justify-between'>
          <div className='rounded w-24 h-28 bg-skeleton mr-2' />
          <div className='rounded w-24 h-20 bg-skeleton' />
        </div>
      </div>
    </div>
    <div className='col-span-2'>
      <div className='flex flex-col py-6'>
        <div className='w-full border-b border-grey-150 pl-5 pr-6 pb-6'>
          <div className='w-[94px] h-4 bg-skeleton rounded' />
          <div className='max-w-[181px] w-full h-12 mt-1 mb-4 bg-skeleton rounded' />
        </div>
        <div className='w-full pl-5 pr-6 pt-6'>
          <div className='w-[94px] h-4 bg-skeleton rounded' />
          <div className='max-w-[181px] w-full h-12 mt-1 mb-4 bg-skeleton rounded' />
        </div>
      </div>
    </div>
  </div>
);

export default GraphCard;
