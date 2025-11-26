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
  const [show, setShow] = useState(false); // Collapsed by default
  const { width } = useWindowSize();
  const size = width < 768 ? 20 : 28;
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState('0px'); // Start collapsed

  // Listen to window resize and conditionally show the legend
  useEffect(() => {
    const handleResize = () => {
      setShow(window.innerWidth > 768);
    };

    handleResize(); // Check initial size
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
          range: '0.0 - 9.0μg/m³',
          label: 'Good',
          icon: <AqGood size={size} />,
          description: 'Air quality is satisfactory',
        },
        {
          range: '9.1 - 35.4μg/m³',
          label: 'Moderate',
          icon: <AqModerate size={size} />,
          description: 'Acceptable quality',
        },
        {
          range: '35.5 - 55.4μg/m³',
          label: 'Unhealthy for Sensitive Groups',
          icon: <AqUnhealthyForSensitiveGroups size={size} />,
          description: 'Health effects for sensitive people',
        },
        {
          range: '55.5 - 125.4μg/m³',
          label: 'Unhealthy',
          icon: <AqUnhealthy size={size} />,
          description: 'Health effects for everyone',
        },
        {
          range: '125.5 - 225.4μg/m³',
          label: 'Very Unhealthy',
          icon: <AqVeryUnhealthy size={size} />,
          description: 'Emergency conditions',
        },
        {
          range: '225.5μg/m³ +',
          label: 'Hazardous',
          icon: <AqHazardous size={size} />,
          description: 'Health alert',
        },
      ],
      // Additional pollutant levels can go here
    }),
    [size],
  );

  const levels = pollutantLevels[pollutant] || [];

  return (
    <Card
      className="flex flex-col items-center justify-center z-50 shadow-lg"
      padding="p-1"
      rounded
      background="bg-white dark:bg-[#1d1f20]"
      radius="rounded-full"
      width="w-auto"
      height="h-auto"
    >
      <button
        onClick={() => setShow((prev) => !prev)}
        className="w-full flex items-center justify-center py-2"
        aria-label="Toggle Air Quality Legend"
      >
        {show ? <AqChevronDown size={16} /> : <AqChevronUp size={16} />}
      </button>

      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-300 ease-in-out flex flex-col items-center gap-1"
        style={{ maxHeight: contentHeight }}
      >
        {levels.map((level, idx) => (
          <Tooltip
            key={idx}
            content={
              <div className="text-center w-[240px] whitespace-normal">
                <p className="font-bold text-sm">{level.label}</p>
                <p className="text-xs mt-1">{level.range}</p>
                <p className="text-xs mt-2 text-gray-600 dark:text-gray-300">
                  {level.description}
                </p>
              </div>
            }
            placement="right"
            style="light"
            arrow={true}
            animation="duration-300"
            className="w-auto"
          >
            <button
              className="bg-transparent rounded-full p-1 hover:scale-105 transition-transform duration-200"
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
