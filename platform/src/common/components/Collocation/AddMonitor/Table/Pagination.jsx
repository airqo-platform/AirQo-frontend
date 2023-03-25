import KeyboardArrowLeftIcon from '@/icons/keyboard_arrow_left.svg';
import KeyboardArrowRightIcon from '@/icons/keyboard_arrow_right.svg';

const Pagination = ({ currentPage, pageSize, totalItems, onPrevClick, onNextClick }) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  const isPrevDisabled = currentPage === 1;
  const isNextDisabled = currentPage === totalPages;

  return (
    <div className='flex justify-center mb-10'>
      <button
        className='w-7 h-7 flex justify-center items-center border border-[#363A4429] rounded-[4px] mr-2 disabled:opacity-40'
        onClick={onPrevClick}
        disabled={isPrevDisabled}
      >
        <div className='w-[16.8px] h-[16.8px] flex justify-center items-center'>
          <KeyboardArrowLeftIcon />
        </div>
      </button>
      <button
        className={`w-7 h-7 flex justify-center items-center border border-[#363A4429] rounded-[4px] disabled:opacity-40`}
        onClick={onNextClick}
        disabled={isNextDisabled}
      >
        <div className='w-[16.8px] h-[16.8px] flex justify-center items-center'>
          <KeyboardArrowRightIcon />
        </div>
      </button>
    </div>
  );
};

export default Pagination;
