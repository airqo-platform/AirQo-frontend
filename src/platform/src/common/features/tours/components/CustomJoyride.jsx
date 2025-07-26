import { useMemo } from 'react';
import Joyride from 'react-joyride';
import CardWrapper from '@/common/components/CardWrapper';
import Button from '@/common/components/Button';

// --- Internal Custom Components ---

const DefaultHeader = ({ step, index, totalSteps }) => (
  <div className="flex items-center justify-between mb-2 font-semibold text-primary">
    <span>{step.title || `Step ${index + 1}`}</span>
    {totalSteps > 0 && (
      <span className="text-sm opacity-70">
        {index + 1}/{totalSteps}
      </span>
    )}
  </div>
);

const DefaultFooter = ({
  index,
  totalSteps,
  handleNext,
  handlePrev,
  handleSkip,
  isLastStep,
}) => (
  <div className="flex justify-between mt-2">
    <Button
      variant="outlined"
      className="min-w-[60px] text-xs py-1 px-2"
      onClick={handleSkip}
      type="button"
    >
      Skip
    </Button>
    <div className="flex gap-1">
      {totalSteps > 1 && index > 0 && (
        <Button
          variant="outlined"
          className="min-w-[60px] text-xs py-1 px-2"
          onClick={handlePrev}
          type="button"
        >
          Back
        </Button>
      )}
      <Button
        variant="filled"
        className="min-w-[60px] text-xs py-1 px-2 bg-primary"
        onClick={handleNext}
        type="button"
      >
        {isLastStep ? 'Finish' : 'Next'}
      </Button>
    </div>
  </div>
);

const CustomTooltipInternal = ({
  index,
  isLastStep,
  step,
  backProps,
  primaryProps,
  skipProps,
  tooltipProps,
}) => {
  const totalSteps = step.totalSteps || 0;

  // Extract Joyride's internal handlers for correct state management
  const handleNext = primaryProps?.onClick;
  const handlePrev = backProps?.onClick;
  const handleSkip = skipProps?.onClick;

  return (
    <CardWrapper
      className="shadow-lg max-w-md w-full"
      padding="p-3"
      bordered={false}
      style={tooltipProps?.style}
      {...tooltipProps}
    >
      <DefaultHeader step={step} index={index} totalSteps={totalSteps} />
      <div className="mb-2 text-gray-700 dark:text-gray-200 text-sm">
        {step.content}
      </div>
      <DefaultFooter
        index={index}
        totalSteps={totalSteps}
        handleNext={handleNext}
        handlePrev={handlePrev}
        handleSkip={handleSkip}
        isLastStep={isLastStep}
      />
    </CardWrapper>
  );
};

// --- Main CustomJoyride Component ---

const defaultStyles = {
  options: {
    arrowColor: '#fff',
    overlayColor: 'rgba(0, 0, 0, 0.5)',
    primaryColor: '#007bff',
    width: undefined,
    zIndex: 10000,
    beaconSize: 36,
  },
  buttonNext: { display: 'none' },
  buttonBack: { display: 'none' },
  buttonClose: { display: 'none' },
  buttonSkip: { display: 'none' },
  tooltip: {
    backgroundColor: 'transparent',
    padding: 0,
    borderRadius: 0,
  },
};

// Default callback that does nothing if none provided
const noopCallback = () => {};

const CustomJoyride = ({
  steps = [],
  run = true,
  continuous = true,
  styles = {},
  callback = noopCallback,
  spotlightClicks = false,
  // Explicitly default disableOverlayClose to true
  disableOverlayClose = true,
  locale = {},
  scrollOffset = 100,
  showSkipButton = true,
  showProgress = true,
  disableBeacon = false,
  floaterProps = {}, // Accept floaterProps for auto-placement
  ...restProps
}) => {
  const stepsWithTotal = useMemo(() => {
    return steps.map((step) => ({ ...step, totalSteps: steps.length }));
  }, [steps]);

  const mergedStyles = { ...defaultStyles, ...styles };

  // Default floater props for better auto-placement behavior
  const defaultFloaterProps = {
    disableAnimation: true, // Often helps with smoother initial appearance
    // Joyride's floater handles placement='auto' or specific placements
  };

  const finalFloaterProps = { ...defaultFloaterProps, ...floaterProps };

  return (
    <Joyride
      steps={stepsWithTotal}
      run={run}
      continuous={continuous}
      showSkipButton={showSkipButton}
      showProgress={showProgress}
      disableBeacon={disableBeacon}
      styles={mergedStyles}
      callback={callback} // Pass the callback directly to Joyride
      spotlightClicks={spotlightClicks}
      // Pass the disableOverlayClose prop, defaulting to true
      disableOverlayClose={disableOverlayClose}
      locale={locale}
      scrollOffset={scrollOffset}
      floaterProps={finalFloaterProps} // Pass floater props for auto-placement
      tooltipComponent={CustomTooltipInternal}
      {...restProps}
    />
  );
};

export default CustomJoyride;
