import AirQologo from '@/icons/airqo_logo.svg';
import OopsIcon from '@/icons/Errors/Oops.svg';
import Button from '@/components/Button';

const error403 = () => {
  return (
    <div className='relative w-screen h-screen bg-white overflow-x-hidden'>
      <div className='fixed top-0 w-full z-10 px-4 py-3 h-16 box-border border-b-[0.5px] border-b-grey-750 bg-white'>
        <AirQologo />
      </div>
      <div className='flex flex-col justify-center items-center mt-14 w-full md:px-48 px-6'>
        <OopsIcon />
        <div className='flex flex-col justify-center items-center w-full mt-6'>
          <h1 className='text-4xl md:text-[40px] font-normal w-full max-w-xl text-center text-black-900 md:leading-[56px]'>
            <span className='text-blue-900 font-bold'>Oops!</span> You don't have access rights to
            this page.
          </h1>
          <span>Reach out to your administrator if you think this is a mistake.</span>
          <Button
            path='/'
            className='rounded-none text-white bg-blue-900 border border-blue-900 hover:bg-dark-blue hover:border-dark-blue font-medium mt-6 w-64'
          >
            Return back home
          </Button>
          <p className='text-center text-grey-400 py-6'>Error code: 403 forbidden access</p>
        </div>
      </div>
    </div>
  );
};

export default error403;
