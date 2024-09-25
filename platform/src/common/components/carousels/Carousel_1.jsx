import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setOpenModal, setModalType } from '@/lib/store/services/downloadModal';

const Carousel_1 = ({
  className = 'max-w-[256px]',
  cardWidth = 'min-w-[213px]',
}) => {
  const dispatch = useDispatch();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const isCollapsed = useSelector((state) => state.sidebar.isCollapsed);

  const slides = [
    {
      title: 'Take action',
      description:
        'Did you know that trees absorb pollution from the air we breathe.',
      type: 'plant_tree',
      buttonText: 'Plant a Tree — $10',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      btnColor: 'bg-green-400',
      btnHoverColor: 'hover:bg-green-500',
      btnBorderColor: 'border-green-500',
    },
    {
      title: 'Take action',
      description:
        'Buy an air pollution monitoring device for your city — we install for free!',
      type: 'buy_device',
      buttonText: 'Install a device — $200',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      btnColor: 'bg-blue-400',
      btnHoverColor: 'hover:bg-blue-500',
      btnBorderColor: 'border-blue-500',
    },
  ];

  // Unified logic to handle setting active slide
  const handleSlideChange = useCallback(
    (newIndex) => {
      if (!isSliding) {
        setCurrentIndex(newIndex);
        setIsSliding(true);
        setTimeout(() => setIsSliding(false), 500);
      }
    },
    [isSliding],
  );

  const nextSlide = useCallback(() => {
    handleSlideChange(
      currentIndex === slides.length - 1 ? 0 : currentIndex + 1,
    );
  }, [currentIndex, slides.length, handleSlideChange]);

  const prevSlide = useCallback(() => {
    handleSlideChange(
      currentIndex === 0 ? slides.length - 1 : currentIndex - 1,
    );
  }, [currentIndex, slides.length, handleSlideChange]);

  // Swipe functionality for mobile devices
  const handleTouchStart = (e) => setTouchStartX(e.touches[0].clientX);

  const handleTouchMove = (e) => {
    if (!touchStartX) return;
    const diff = touchStartX - e.touches[0].clientX;
    if (diff > 50) nextSlide();
    else if (diff < -50) prevSlide();
    setTouchStartX(0);
  };

  const handleOpenModal = useCallback(
    (type, ids = []) => {
      dispatch(setOpenModal(true));
      dispatch(setModalType({ type, ids }));
    },
    [dispatch],
  );

  // Render the button for collapsed state
  const renderCollapsedButton = (slide, index) => (
    <button
      key={index}
      type="button"
      className={`mt-4 px-4 py-2 ${slide.btnColor} border w-[38px] mx-1 flex items-center justify-center ${slide.btnBorderColor} text-sm font-semibold rounded-xl transition ${slide.btnHoverColor}`}
      style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
      onClick={() => null}
    >
      {slide.buttonText}
    </button>
  );

  // Render full slide with details when sidebar is expanded
  const renderExpandedSlide = (slide, index) => (
    <div
      key={index}
      className={`w-full ${cardWidth} flex flex-col justify-around text-left mx-1 py-4 px-2 rounded-xl ${slide.bgColor} border ${slide.borderColor}`}
    >
      <h3 className="text-sm font-semibold">{slide.title}</h3>
      <p className="text-xs text-gray-700 mt-2">{slide.description}</p>
      <button
        type="button"
        className={`mt-4 px-4 py-2 ${slide.btnColor} border ${slide.btnBorderColor} text-sm font-semibold rounded-full transition ${slide.btnHoverColor}`}
        onClick={() => handleOpenModal(slide.type)}
      >
        {slide.buttonText}
      </button>
    </div>
  );

  return (
    <div className={`${className} text-black-600 w-full mx-auto relative`}>
      {/* Carousel container */}
      <div
        className="relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {/* Carousel items */}
        <div
          className={`flex ${!isCollapsed ? '-ml-1' : ''} transition-transform duration-500 ease-in-out`}
          style={{ transform: `translateX(-${currentIndex * 101}%)` }}
        >
          {slides.map((slide, index) =>
            isCollapsed
              ? renderCollapsedButton(slide, index)
              : renderExpandedSlide(slide, index),
          )}
        </div>

        {/* Carousel navigation dots */}
        <div className="flex justify-center mt-4">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => handleSlideChange(index)}
              className={`dot w-2 h-2 rounded-full mx-1 bg-gray-300 transition-colors duration-300 ${currentIndex === index ? 'bg-black-600' : ''}`}
            ></button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Carousel_1;
