const Calendar = () => {
  return (
    <div className='border-[0.5px] rounded-tr-lg rounded-br-lg border-skeleton md:max-w-[304px] w-full h-full pl-5 pr-6 pt-[23px] mr-6'>
      <div className='max-w-[257px] h-[25px] bg-skeleton w-auto rounded-[5px] mb-2'></div>
      <div className='max-w-[220px] h-4 bg-skeleton w-auto rounded-[5px] mb-[26px]'></div>
      <div className='max-w-[260px] w-auto'>
        <div className='h-10 bg-skeleton w-auto rounded-[5px] mb-1'></div>
        <div className='h-10 bg-skeleton w-auto rounded-[5px] mb-1'></div>
        <div className='h-10 bg-skeleton w-auto rounded-[5px] mb-1'></div>
        <div className='h-10 bg-skeleton w-auto rounded-[5px] mb-[51px]'></div>
        <div className='h-10 bg-skeleton w-auto rounded-[5px] mb-[53px]'></div>
        <div className='h-[210px] bg-skeleton w-auto rounded-[5px] mb-[101px]'></div>
      </div>
    </div>
  );
};

export default Calendar;
