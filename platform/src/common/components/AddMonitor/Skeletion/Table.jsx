const Table = () => {
  return (
    <div className='w-full'>
      <div className='flex justify-between items-center flex-wrap md:flex-nowrap w-auto mb-3 px-6'>
        <div className='md:mb-0 w-[280px] h-9'>
          <div className='h-9 w-full bg-skeleton md:max-w-[280px] rounded-[4px]' />
        </div>
        <div className='flex justify-end items-center w-full'>
          <div className={'h-9 w-full max-w-[114px] bg-skeleton rounded-[4px] mr-2'} />
          <div className={'h-9 w-full bg-skeleton max-w-[124px] rounded-[4px]'} />
        </div>
      </div>
      <div className='overflow-x-scroll md:overflow-x-hidden'>
        <div className='w-full mb-6'>
          <div>
            <div className='flex items-center pl-[21px] h-10 border-b border-b-skeleton pb-[14px]'>
              <div className='w-5 h-[15px] mr-[31px] rounded bg-skeleton'></div>
              <div className='w-[84px] h-3 mr-[60px] rounded bg-skeleton'></div>
              <div className='w-[84px] h-3 mr-[55px] rounded bg-skeleton'></div>
              <div className='w-[84px] h-3 mr-[60px] rounded bg-skeleton'></div>
              <div className='w-[84px] h-3 mr-[55px] rounded bg-skeleton'></div>
            </div>
          </div>
          <div>
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                className='flex pl-[21px] items-center border-b border-b-skeleton h-14'
                key={index}
              >
                <div className='w-5 h-[15px] mr-[31px] rounded bg-skeleton'></div>
                <div className='w-[62px] h-3 mr-[60px] rounded bg-skeleton'></div>
                <div className='w-[88px] h-3 mr-[55px] rounded bg-skeleton'></div>
                <div className='w-[119px] h-3 mr-[60px] rounded bg-skeleton'></div>
                <div className='w-[119px] h-3 mr-[55px] rounded bg-skeleton'></div>
              </div>
            ))}
          </div>
        </div>
        <div className='w-[83px] h-7 bg-skeleton rounded-[5px] flex items-center justify-center mx-auto mb-[39px]'></div>
      </div>
    </div>
  );
};

export default Table;
