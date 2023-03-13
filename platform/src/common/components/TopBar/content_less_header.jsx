import AirqoLogo from '@/icons/airqo_logo.svg';

const ContentLessTopBar = () => {
  return (
    <nav className='fixed top-0 w-full z-10 p-4 h-16 box-border bg-white'>
      <div className='flex justify-end md:justify-between items-center'>
        <AirqoLogo className='hidden md:block w-[46.56px] h-8' />
      </div>
    </nav>
  );
};

export default ContentLessTopBar;
