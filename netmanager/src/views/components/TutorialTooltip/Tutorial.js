import React, { useState, useEffect } from 'react';
import './Tutorial.css';

const Tutorial = ({ classNames, steps, overlay, textBoxColor, textColor, tutorialId }) => {
  // Adding this to track the index of the text field that is currently focused
  const [FieldRefIndex, setFieldRefIndex] = useState(0);
  const [showTutorial, setShowTutorial] = useState(
    localStorage.getItem(`hasViewedTutorial-${tutorialId}`) !== 'true'
  );
  const [tutorialBoxStyles, setTutorialBoxStyles] = useState({
    width: '380px',
    fontSize: '16px'
  });
  const [tutorialPosition, setTutorialPosition] = useState({ top: 0, left: 0 });
  const [arrowDirection, setArrowDirection] = useState('down');

  const totalSteps = steps.length;

  useEffect(() => {
    const handleResize = () => {
      if (document.querySelector(`.${classNames[FieldRefIndex]}`)) {
        const rect = document
          .querySelector(`.${classNames[FieldRefIndex]}`)
          .getBoundingClientRect();

        if (window.innerWidth < 576) {
          setTutorialPosition({
            top: rect.bottom + 30,
            left:
              rect.left +
              document.querySelector(`.${classNames[FieldRefIndex]}`).offsetWidth / 2 -
              100
          });
          setTutorialBoxStyles({ width: '240px', fontSize: '14px' });
          setArrowDirection('up');
        } else if (window.innerWidth < 768) {
          setTutorialPosition({
            top: rect.bottom + 30,
            left:
              rect.left +
              document.querySelector(`.${classNames[FieldRefIndex]}`).offsetWidth / 2 -
              120
          });
          setTutorialBoxStyles({ width: '260px', fontSize: '15px' });
          setArrowDirection('up');
        } else if (window.innerWidth < 992) {
          setTutorialPosition({
            top: rect.bottom + 30,
            left:
              rect.left +
              document.querySelector(`.${classNames[FieldRefIndex]}`).offsetWidth / 2 -
              140
          });
          setTutorialBoxStyles({ width: '280px', fontSize: '16px' });
          setArrowDirection('up');
        } else if (window.innerWidth < 1200) {
          setTutorialPosition({
            top: rect.bottom + 35,
            left:
              rect.left +
              document.querySelector(`.${classNames[FieldRefIndex]}`).offsetWidth / 2 -
              160
          });
          setTutorialBoxStyles({ width: '300px', fontSize: '17px' });
          setArrowDirection('up');
        } else {
          setTutorialPosition({
            top: rect.bottom + 35,
            left:
              rect.left +
              document.querySelector(`.${classNames[FieldRefIndex]}`).offsetWidth / 2 -
              180
          });
          setTutorialBoxStyles({ width: '380px', fontSize: '18px' });
          setArrowDirection('up');
        }

        // check if the tutorial box is off-screen and adjust its position and arrow direction accordingly
        const tutorialBox = document.querySelector('.tutorial-box');
        if (tutorialBox) {
          const tutorialBoxRect = tutorialBox.getBoundingClientRect();
          if (tutorialBoxRect.top < 0) {
            setTutorialPosition((prev) => ({
              ...prev,
              top: rect.bottom + 30
            }));
            setArrowDirection('up');
          } else if (tutorialBoxRect.right > window.innerWidth) {
            setTutorialPosition((prev) => ({
              ...prev,
              left:
                rect.left -
                tutorialBoxRect.width +
                document.querySelector(`.${classNames[FieldRefIndex]}`).offsetWidth / 2 +
                20
            }));
            setArrowDirection('right');
          } else if (tutorialBoxRect.bottom > window.innerHeight) {
            setTutorialPosition((prev) => ({
              ...prev,
              top: rect.top - tutorialBoxRect.height - 30
            }));
            setArrowDirection('down');
          } else if (tutorialBoxRect.left < 0) {
            setTutorialPosition((prev) => ({
              ...prev,
              left:
                rect.left +
                document.querySelector(`.${classNames[FieldRefIndex]}`).offsetWidth / 2 -
                tutorialBoxRect.width / 2
            }));
            setArrowDirection('left');
          }
        } else {
          setTutorialPosition((prev) => ({
            ...prev,
            top: rect.bottom + 30,
            left:
              rect.left +
              document.querySelector(`.${classNames[FieldRefIndex]}`).offsetWidth / 2 -
              140
          }));
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

  // This will handle showing the tutorial box heighlighted when the overlay is true
  useEffect(() => {
    if (overlay && classNames.every((className) => document.querySelector(`.${className}`))) {
      classNames.forEach((className, index) => {
        if (index === FieldRefIndex) {
          document.querySelector(`.${className}`).style.zIndex = '3';
          document.querySelector(`.${className}`).style.backgroundColor = 'white';
          document.querySelector(`.${className}`).style.borderRadius = '8px';
        } else {
          document.querySelector(`.${className}`).style.zIndex = '0';
          document.querySelector(`.${className}`).style.backgroundColor = 'none';
        }
      });
    }
  }, [FieldRefIndex, overlay, classNames]);

  // for closing the tutorial
  const handleDismissTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem(`hasViewedTutorial-${tutorialId}`, 'true');
  };

  const handleStep = (direction) => {
    let newIndex;
    if (direction === 'next') {
      if (FieldRefIndex === totalSteps - 1) {
        handleDismissTutorial();
        return;
      } else {
        newIndex = FieldRefIndex + 1;
      }
    } else if (direction === 'prev') {
      if (FieldRefIndex > 0) {
        newIndex = FieldRefIndex - 1;
      } else {
        handleDismissTutorial();
        return;
      }
    }
    setFieldRefIndex(newIndex);
    // scroll to the highlighted element
    document.querySelector(`.${classNames[newIndex]}`).scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  };

  const handleNextStep = () => handleStep('next');
  const handlePrevStep = () => handleStep('prev');

  return (
    <>
      {showTutorial && (
        <>
          <div className={overlay ? 'tutorial-overlay' : ''} />
          <div
            className="tutorial-box"
            style={{
              top: tutorialPosition.top,
              left: tutorialPosition.left,
              width: tutorialBoxStyles.width,
              backgroundColor: `${textBoxColor ? textBoxColor : '#3f51b5'}`
            }}>
            <div
              className={`tutorial-arrow-${arrowDirection}`}
              style={{
                borderBlockColor: `${textBoxColor ? textBoxColor : '#3f51b5'}`
              }}
            />
            <span className="tutorial-count" style={{ color: textColor }}>
              {FieldRefIndex + 1} / {totalSteps}
            </span>
            <p className="title" style={{ color: textColor }}>
              {steps[FieldRefIndex].title}
            </p>
            <p className="description" style={{ color: textColor }}>
              {steps[FieldRefIndex].description}
            </p>
            <div className="buttons">
              {steps.length > 1 && (
                <button
                  onClick={handlePrevStep}
                  className="prev-button"
                  style={{
                    backgroundColor: FieldRefIndex === 0 ? '#3067e2' : 'transparent',
                    borderRadius: '4px',
                    border: FieldRefIndex === 0 ? '1px solid #3067e2' : '1px solid #000',
                    color: FieldRefIndex === 0 ? '#fff' : '#000'
                  }}>
                  {FieldRefIndex === 0 ? 'Skip' : 'Previous'}
                </button>
              )}
              <button
                onClick={handleNextStep}
                className="next-button"
                style={{
                  backgroundColor: FieldRefIndex === totalSteps - 1 ? '#3067e2' : 'transparent',
                  border: FieldRefIndex === totalSteps - 1 ? '1px solid #3067e2' : '1px solid #000',
                  color: FieldRefIndex === totalSteps - 1 ? '#fff' : '#000',
                  borderRadius: '4px'
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
