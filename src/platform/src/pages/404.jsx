import AirQologo from '@/icons/airqo_logo.svg';
import OopsIcon from '@/icons/Errors/OopsIcon';
import Button from '@/components/Button';

const Error404 = () => {
  return (
    <div className="relative w-screen h-screen bg-white overflow-x-hidden">
      {/* Header */}
      <div className="fixed top-0 w-full z-10 px-4 py-3 h-16 box-border border-b-[0.5px] border-b-grey-750 bg-white">
        <AirQologo />
      </div>

      {/* Content */}
      <div className="flex flex-col justify-center items-center mt-14 w-full md:px-48 px-6">
        {/* Icon */}
        <OopsIcon className="text-primary" />

        <div className="flex flex-col justify-center items-center w-full mt-6">
          <h1 className="text-4xl md:text-[40px] font-normal w-full max-w-xl text-center text-black-900 md:leading-[56px]">
            <span className="text-primary font-bold">Oops!</span> We can’t seem
            to find the page you’re looking for
          </h1>

          <Button
            path="/Home"
            className="mt-6 w-64 rounded-none text-white bg-primary border border-primary hover:bg-primary/90 hover:border-primary/90 font-medium"
          >
            Return back home
          </Button>

          <p className="text-center text-grey-400 py-6">
            Error code: 404 Page not found
          </p>
        </div>
      </div>
    </div>
  );
};

export default Error404;
