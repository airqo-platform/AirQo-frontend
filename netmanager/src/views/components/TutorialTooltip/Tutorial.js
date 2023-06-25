import React, { useState, useEffect } from 'react';
import './Tutorial.css';

const Tutorial = ({ fieldRefs, steps, FieldRefIndex, setFieldRefIndex }) => {
  // Small tutorial for new users
  const [showTutorial, setShowTutorial] = useState(
    localStorage.getItem('hasViewedTutorial') !== 'true'
  );
  const [tutorialBoxStyles, setTutorialBoxStyles] = useState({
    width: '280px',
    fontSize: '16px'
  });
  const [tutorialPosition, setTutorialPosition] = useState({ top: 0, left: 0 });
  const [arrowDirection, setArrowDirection] = useState('down'); // arrow direction for the tutorial box

  // total number of tutorial steps
  const totalSteps = steps.length;

  useEffect(() => {
    // to help clear the local storage for testing
    localStorage.removeItem('hasViewedTutorial');

    const handleResize = () => {
      if (fieldRefs[FieldRefIndex].current) {
        const rect = fieldRefs[FieldRefIndex].current.getBoundingClientRect();

        // setting the responsive position of the tutorial box
        if (window.innerWidth < 576) {
          setTutorialPosition({
            top: rect.top - 260,
            left: rect.left + fieldRefs[FieldRefIndex].current.offsetWidth / 2 - 100
          });
          setTutorialBoxStyles({ width: '240px', fontSize: '14px' });
          setArrowDirection('down');
        } else if (window.innerWidth < 768) {
          setTutorialPosition({
            top: rect.bottom + 30,
            left: rect.left + fieldRefs[FieldRefIndex].current.offsetWidth / 2 - 120
          });
          setTutorialBoxStyles({ width: '260px', fontSize: '15px' });
          setArrowDirection('up');
        } else if (window.innerWidth < 992) {
          setTutorialPosition({
            top: rect.bottom + 30,
            left: rect.left + fieldRefs[FieldRefIndex].current.offsetWidth / 2 - 140
          });
          setTutorialBoxStyles({ width: '280px', fontSize: '16px' });
          setArrowDirection('up');
        } else if (window.innerWidth < 1200) {
          setTutorialPosition({
            top: rect.bottom + 80,
            left: rect.left + fieldRefs[FieldRefIndex].current.offsetWidth / 2 - 160
          });
          setTutorialBoxStyles({ width: '300px', fontSize: '17px' });
          setArrowDirection('up');
        } else {
          setTutorialPosition({
            top: rect.bottom + 30,
            left: rect.left + fieldRefs[FieldRefIndex].current.offsetWidth / 2 - 180
          });
          setTutorialBoxStyles({ width: '320px', fontSize: '18px' });
          setArrowDirection('up');
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [FieldRefIndex]);

  // for closing the tutorial
  const handleDismissTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('hasViewedTutorial', 'true');
  };

  // function to handle next tutorial step
  const handleNextStep = () => {
    if (FieldRefIndex === totalSteps - 1) {
      handleDismissTutorial();
    } else {
      setFieldRefIndex((prevIndex) => prevIndex + 1);
    }
  };

  // function to handle previous tutorial step
  const handlePrevStep = () => {
    if (FieldRefIndex > 0) {
      setFieldRefIndex((prevIndex) => prevIndex - 1);
    } else {
      handleDismissTutorial();
    }
  };

  return (
    <>
      {showTutorial && (
        <>
          <div className="tutorial-overlay" />
          <div
            className="tutorial-box"
            style={{
              top: tutorialPosition.top,
              left: tutorialPosition.left,
              width: tutorialBoxStyles.width
            }}>
            <div className={`tutorial-arrow-${arrowDirection}`} />
            <span className="tutorial-count">
              {FieldRefIndex + 1} / {totalSteps}
            </span>
            <p className="title">{steps[FieldRefIndex].title}</p>
            <p className="description">{steps[FieldRefIndex].description}</p>
            <div className="buttons">
              {steps.length > 1 && (
                <button
                  onClick={handlePrevStep}
                  className="prev-button"
                  style={{
                    backgroundColor: 'transparent'
                  }}>
                  {FieldRefIndex === 0 ? 'Skip' : 'Previous'}
                </button>
              )}
              <button
                onClick={handleNextStep}
                className="next-button"
                style={{
                  backgroundColor: FieldRefIndex === totalSteps - 1 ? '#FF8C00' : 'transparent',
                  border: FieldRefIndex === totalSteps - 1 ? 'none' : '1px solid #fff',
                  borderRadius: FieldRefIndex === totalSteps - 1 ? 'none' : '4px'
                }}>
                {FieldRefIndex === totalSteps - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Tutorial;
