import { useState, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'flowbite-react';
import { useWindowSize } from '@/core/hooks/useWindowSize';

// Icons
import {
  AqGood,
  AqModerate,
  AqUnhealthyForSensitiveGroups,
  AqVeryUnhealthy,
  AqUnhealthy,
  AqHazardous,
  AqChevronDown,
  AqChevronUp,
} from '@airqo/icons-react';

// Import Card wrapper component
import Card from '@/components/CardWrapper';

const AirQualityLegend = ({ pollutant }) => {
  const [show, setShow] = useState(true);
  const { width } = useWindowSize();
  const size = width < 1024 ? 30 : 40;
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState('auto');

  // Listen to window resize and conditionally show the legend
  useEffect(() => {
    const handleResize = () => {
      setShow(window.innerWidth > 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update content height whenever legend or its contents change
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(show ? `${contentRef.current.scrollHeight}px` : '0px');
    }
  }, [show, size, pollutant]);

  // Define pollutant levels with icons
  const pollutantLevels = useMemo(
    () => ({
      pm2_5: [
        {
          range: '0.0μg/m3 - 9.0μg/m3',
          label: 'Air Quality is Good',
          icon: <AqGood size={size} />,
        },
        {
          range: '9.1μg/m3 - 35.4μg/m3',
          label: 'Air Quality is Moderate',
          icon: <AqModerate size={size} />,
        },
        {
          range: '35.5μg/m3 - 55.4μg/m3',
          label: 'Air Quality is Unhealthy for Sensitive Groups',
          icon: <AqUnhealthyForSensitiveGroups size={size} />,
        },
        {
          range: '55.5μg/m3 - 125.4μg/m3',
          label: 'Air Quality is Unhealthy',
          icon: <AqUnhealthy size={size} />,
        },
        {
          range: '125.5μg/m3 - 225.4μg/m3',
          label: 'Air Quality is Very Unhealthy',
          icon: <AqVeryUnhealthy size={size} />,
        },
        {
          range: '225.5μg/m3 +',
          label: 'Air Quality is Hazardous',
          icon: <AqHazardous size={size} />,
        },
      ],
      // Additional pollutant levels can go here
    }),
    [size],
  );

  const levels = pollutantLevels[pollutant] || [];
  return (
    <Card
      className="flex flex-col items-center z-50"
      padding="p-0 md:p-2"
      shadow="shadow"
      rounded
      background="bg-white dark:bg-[#1d1f20]"
      radius="rounded-full"
      width="w-auto"
      height="h-auto"
    >
      <button
        onClick={() => setShow((prev) => !prev)}
        className="rounded-full p-2 transition-transform duration-300"
        aria-label="Toggle Air Quality Legend"
      >
        {show ? <AqChevronDown /> : <AqChevronUp />}
      </button>

      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-300 ease-in-out flex flex-col items-center md:gap-2"
        style={{ maxHeight: contentHeight }}
      >
        {levels.map((level, idx) => (
          <Tooltip
            key={idx}
            content={
              <div className="text-center w-[250px] whitespace-normal">
                <p className="font-medium text-sm md:text-base">
                  {level.label}
                </p>
                <p className="text-xs md:text-sm">{level.range}</p>
              </div>
            }
            placement="right"
            style="light"
            arrow={true}
            animation="duration-300"
            className="w-auto"
          >
            <button
              className="bg-transparent rounded-full"
              aria-label={level.label}
            >
              {level.icon}
            </button>
          </Tooltip>
        ))}
      </div>
    </Card>
  );
};

AirQualityLegend.propTypes = {
  pollutant: PropTypes.oneOf(['pm2_5', 'pm10', 'no2']).isRequired,
};

export default AirQualityLegend;
