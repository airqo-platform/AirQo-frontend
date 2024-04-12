import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

/**
 * @description Carousel component that displays the AppIntro slides.
 * @returns {JSX.Element} AppIntro component
 */
const Carousel = ({ IntroList }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideRef = useRef(null);

  const nextSlide = () => {
    setCurrentSlide((currentSlide + 1) % IntroList.length);
  };

  const prevSlide = () => {
    setCurrentSlide((currentSlide - 1 + IntroList.length) % IntroList.length);
  };

  //useEffect hook to update the slide position when the currentSlide state changes.
  useEffect(() => {
    slideRef.current.style.transition = 'all 0.5s ease-in-out';
    slideRef.current.style.transform = `translateX(-${currentSlide * 100}%)`;
  }, [currentSlide]);

  return (
    <div id='default-carousel' className='relative w-full h-full'>
      <div className='relative w-full h-full overflow-hidden rounded-lg'>
        <div ref={slideRef} className='flex w-full h-full'>
          {IntroList.map((item, index) => (
            <div key={item.name} className='w-full flex-none text-center' data-carousel-item>
              <h2 className='text-lg font-bold'>{item.name}</h2>
              <Image
                src={item.image}
                alt={item.name}
                width={800}
                height={300}
                layout='responsive'
                objectFit='contain'
                loading='eager'
              />
              <p className='text-sm'>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
      <div className='p-2 z-30 w-full flex items-center justify-between'>
        <button
          type='button'
          className='flex justify-center items-center p-2 rounded-full bg-blue-200'
          onClick={prevSlide}>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'>
            <path
              d='M15 18L9 12L15 6'
              stroke='#536A87'
              stroke-width='1.5'
              stroke-linecap='round'
              stroke-linejoin='round'
            />
          </svg>
        </button>
        <div className='space-x-3'>
          {IntroList.map((_, index) => (
            <button
              key={index}
              type='button'
              className={`w-3 h-3 rounded-full ${
                index === currentSlide ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              aria-label={`Slide ${index + 1}`}
              onClick={() => setCurrentSlide(index)}></button>
          ))}
        </div>
        <button
          type='button'
          className='flex justify-center items-center p-2 rounded-full bg-blue-200'
          onClick={nextSlide}>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'>
            <path
              d='M9 18L15 12L9 6'
              stroke='#536A87'
              stroke-width='1.5'
              stroke-linecap='round'
              stroke-linejoin='round'
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

/**
 * @description AppIntro component that displays the modal with the carousel slides.
 * @param {Object} props - The props object
 * @param {boolean} props.isOpen - The state of the modal
 * @param {Function} props.setIsOpen - The function to set the state of the modal
 */
const AppIntro = ({ isOpen, setIsOpen, features }) => {
  return (
    <div className='flex items-center justify-center'>
      {isOpen && (
        <div className='fixed z-10 inset-0 overflow-y-auto'>
          <div className='flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
            <div className='fixed inset-0 transition-opacity' aria-hidden='true'>
              <div className='absolute inset-0 bg-zinc-600 opacity-60 z-auto'></div>
            </div>

            <span className='hidden sm:inline-block sm:align-middle sm:h-screen' aria-hidden='true'>
              &#8203;
            </span>

            <div className='inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full z-50'>
              <div className='bg-white px-2 pt-3 pb-2 sm:p-4 sm:pb-2'>
                <div className='sm:flex sm:items-start'>
                  <div className='mt-3 text-center sm:mt-0 sm:ml-2 sm:text-left w-full h-full'>
                    <div className='mt-2 relative'>
                      <Carousel IntroList={features} />
                    </div>
                  </div>
                </div>
              </div>
              <div className='bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse'>
                <button
                  type='button'
                  className='w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm'
                  onClick={() => setIsOpen(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppIntro;
