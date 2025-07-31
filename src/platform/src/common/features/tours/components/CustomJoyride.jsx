import { useMemo, useState, useEffect } from 'react';
import Joyride from 'react-joyride';
import CardWrapper from '@/common/components/CardWrapper';
import Button from '@/common/components/Button';

// --- Mobile Detection Hook ---
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      // Check screen width (mobile: < 768px, tablet: >= 768px)
      const screenWidth = window.innerWidth;

      // Also check user agent for mobile devices as backup
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = [
        'mobile',
        'android',
        'iphone',
        'ipod',
        'blackberry',
        'windows phone',
      ];
      const isMobileUserAgent = mobileKeywords.some((keyword) =>
        userAgent.includes(keyword),
      );

      // Consider it mobile if screen is < 768px OR if it's a mobile user agent
      // but exclude tablets (iPad, Android tablets typically have larger screens)
      const isTablet =
        userAgent.includes('ipad') ||
        (userAgent.includes('android') && !userAgent.includes('mobile'));

      setIsMobile((screenWidth < 768 || isMobileUserAgent) && !isTablet);
    };

    // Check on mount
    checkDevice();

    // Check on resize
    window.addEventListener('resize', checkDevice);

    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return isMobile;
};

// --- Internal Custom Components ---

const DefaultHeader = ({ step, index, totalSteps }) => (
  <div className="flex items-center justify-between mb-2 font-semibold text-primary">
    <span className="text-sm md:text-base">
      {step.title || `Step ${index + 1}`}
    </span>
    {totalSteps > 0 && (
      <span className="text-xs md:text-sm opacity-70">
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
      className="min-w-[50px] text-[10px] py-1 px-2 md:min-w-[60px] md:text-xs md:py-1 md:px-2"
      onClick={handleSkip}
      type="button"
    >
      Skip
    </Button>
    <div className="flex gap-1">
      {totalSteps > 1 && index > 0 && (
        <Button
          variant="outlined"
          className="min-w-[50px] text-[10px] py-1 px-2 md:min-w-[60px] md:text-xs md:py-1 md:px-2"
          onClick={handlePrev}
          type="button"
        >
          Back
        </Button>
      )}
      <Button
        variant="filled"
        className="min-w-[50px] text-[10px] py-1 px-2 bg-primary md:min-w-[60px] md:text-xs md:py-1 md:px-2"
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
      className="shadow-lg w-full max-w-xs sm:max-w-sm md:max-w-md"
      padding="p-3"
      bordered={false}
      style={tooltipProps?.style}
      {...tooltipProps}
    >
      <DefaultHeader step={step} index={index} totalSteps={totalSteps} />
      <div className="mb-2 text-gray-700 dark:text-gray-200 text-xs md:text-sm">
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
  disableOverlayClose = true,
  locale = {},
  scrollOffset = 100,
  showSkipButton = true,
  showProgress = true,
  disableBeacon = false,
  floaterProps = {},
  disableOnMobile = true, // New prop to control mobile behavior
  ...restProps
}) => {
  const isMobile = useIsMobile();

  const stepsWithTotal = useMemo(() => {
    return steps.map((step) => ({ ...step, totalSteps: steps.length }));
  }, [steps]);

  const mergedStyles = { ...defaultStyles, ...styles };

  // Enhanced floater props for better responsiveness
  const defaultFloaterProps = {
    disableAnimation: true,
    styles: {
      floater: {
        maxWidth: '90vw', // Prevent overflow on small screens
      },
      floaterCentered: {
        maxWidth: '90vw',
      },
    },
  };

  const finalFloaterProps = {
    ...defaultFloaterProps,
    ...floaterProps,
    styles: {
      ...defaultFloaterProps.styles,
      ...floaterProps?.styles,
    },
  };

  // Don't render Joyride on mobile devices if disableOnMobile is true
  if (disableOnMobile && isMobile) {
    return null;
  }

  return (
    <Joyride
      steps={stepsWithTotal}
      run={run}
      continuous={continuous}
      showSkipButton={showSkipButton}
      showProgress={showProgress}
      disableBeacon={disableBeacon}
      styles={mergedStyles}
      callback={callback}
      spotlightClicks={spotlightClicks}
      disableOverlayClose={disableOverlayClose}
      locale={locale}
      scrollOffset={scrollOffset}
      floaterProps={finalFloaterProps}
      tooltipComponent={CustomTooltipInternal}
      {...restProps}
    />
  );
};

export default CustomJoyride;
