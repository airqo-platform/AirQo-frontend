import ArrowLeftIcon from '@/icons/keyboard_backspace.svg';
import Layout from '../../../Layout';
import Calendar from './Calendar';
import Table from './Table';

const SkeletonFrame = () => {
  return (
    // <div>
    //   <div className='flex justify-between px-6 py-8 bg-white'>
    //     <div className='flex items-center'>
    //       <div className='border border-grey rounded-[4px] w-7 h-7 flex items-center justify-center mr-4'>
    //         <span className='text-xl opacity-50'>
    //           <ArrowLeftIcon />
    //         </span>
    //       </div>

    //       <span className='text-xl font-semibold'>Add Device</span>
    //     </div>
    //     <div className='flex justify-end'>
    //       <div className={'w-[87px] h-[37px] mr-[13px] bg-skeleton rounded-[5px]'}></div>
    //       <div className={'w-[150px] h-[37px] bg-skeleton rounded-[5px]'}></div>
    //     </div>
    //   </div>
    //   <div className='flex'>
    //     <div className='ml-6 mb-6 border-[0.5px] rounded-tl-lg rounded-bl-lg border-skeleton md:max-w-[704px] w-auto h-auto'>
    //       <div className='mb-[26px] px-6 pt-[23px]'>
    //         <h3 className='w-[257px] h-[25px] bg-skeleton rounded-[5px] mb-2'></h3>
    //         <h4 className='bg-skeleton w-72 h-4 rounded-[5px]'></h4>
    //       </div>
    //       <Table />
    //     </div>
    //     <Calendar />
    //   </div>
    // </div>
    <>
      <div className='flex'>
        <div className='ml-6 mb-6 border-[0.5px] rounded-tl-lg rounded-bl-lg border-skeleton md:max-w-[704px] w-auto h-auto'>
          <div className='mb-[26px] px-6 pt-[23px]'>
            <h3 className='w-[257px] h-[25px] bg-skeleton rounded-[5px] mb-2'></h3>
            <h4 className='bg-skeleton w-72 h-4 rounded-[5px]'></h4>
          </div>
          <Table />
        </div>
        <Calendar />
      </div>
    </>
  );
};

export default SkeletonFrame;
