import AirQologo from '@/icons/airqo_logo.svg'
import OopsIcon from '@/icons/Errors/Oops.svg'
import Button from '@/components/Button'

const error404 = () => {
    return (
    <div>
        <div className="fixed top-0 w-full z-10 px-4 py-3 h-16 box-border border-b-[0.5px] border-b-grey-750 bg-white" >
            <AirQologo/>
        </div>
        <div className="flex flex-col justify-center items-center mt-14 w-full md:px-40 px-6">
            
                <OopsIcon/>
            
            <div className='flex flex-col justify-center w-full mt-6'>
            <h1 className='text-4xl md:text-5xl font-normal w-full text-center'>
                <span className='text-blue-900'>Oops!</span> We can't seem to find the page you're looking for</h1>

            <Button path='/' className='rounded-none text-white bg-blue-900 border border-blue-900 hover:bg-dark-blue hover:border-dark-blue font-medium mt-6 '>
                Return back home
            </Button>
            <p className='text-center text-grey-400 py-6'>Error code: 404 Page not found</p>
            </div>
        </div>
    </div>
    );
  }
  
  export default error404;