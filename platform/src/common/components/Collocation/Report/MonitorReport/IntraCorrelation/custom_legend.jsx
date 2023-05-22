const CustomLegend = () => {
  return (
    <div className='flex items-center justify-end mt-4 mb-3 mr-7'>
      <div className='flex justify-center items-center bg-grey-200 h-5 w-[93px] rounded-md'>
        <hr className='w-4 h-[2px] border border-purple-400 mr-2' />
        <span className='text-xs text-grey-300'>Sensor 01</span>
      </div>
      <span className='uppercase mx-2 text-[10px] text-grey-800'>Compared to</span>
      <div className='flex justify-center items-center bg-grey-200 h-5 w-[93px] rounded-md'>
        <hr className='w-4 h-[2px] border border-purple-400 border-dashed mr-2' />
        <span className='text-xs text-grey-300'>Sensor 02</span>
      </div>
    </div>
  );
};

export default CustomLegend;
