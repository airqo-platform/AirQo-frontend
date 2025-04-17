import React, { useState, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';
import 'tippy.js/animations/scale-subtle.css';
import 'tippy.js/animations/scale-extreme.css';
import 'tippy.js/themes/light.css';

// Icons
import GoodAir from '@/icons/Charts/GoodAir';
import ModerateAir from '@/icons/Charts/Moderate';
import UnhealthyForSensitiveGroups from '@/icons/Charts/UnhealthySG';
import Unhealthy from '@/icons/Charts/Unhealthy';
import VeryUnhealthy from '@/icons/Charts/VeryUnhealthy';
import Hazardous from '@/icons/Charts/Hazardous';
import UpArrow from '@/icons/map/upArrow';
import DownArrow from '@/icons/map/downArrow';
import { useWindowSize } from '@/lib/windowSize';
// Import Card wrapper component
import Card from '@/components/CardWrapper';

const AirQualityLegend = ({ pollutant }) => {
  const [show, setShow] = useState(true);
  const { width } = useWindowSize();
  const size = width < 1024 ? 30 : 40;
  const legendButtonsRef = useRef([]);
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState('auto');

  // Listen to window resize and conditionally show the legend (optional additional logic)
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setShow(window.innerWidth > 768);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Measure the content height whenever the legend or its contents change
  useEffect(() => {
    if (contentRef.current) {
      // When expanded, set to scrollHeight; when collapsed, set to 0.
      setContentHeight(show ? `${contentRef.current.scrollHeight}px` : '0px');
    }
  }, [show, size, pollutant]);

  // Initialize tooltips using tippy.js with updated configuration to allow HTML
  useEffect(() => {
    legendButtonsRef.current.forEach((button) => {
      if (button) {
        tippy(button, {
          // Replace newline characters with <br/> for proper formatting
          content: button
            .getAttribute('data-tippy-content')
            .replace(/\n/g, '<br/>'),
          allowHTML: true,
          theme: 'light',
          placement: 'right',
          animation: 'scale',
          arrow: true,
        });
      }
    });
  }, [show, legendButtonsRef]);

  // Memoize the pollutant levels based on pollutant and size
  const pollutantLevels = useMemo(
    () => ({
      pm2_5: [
        {
          range: '0.0μg/m3 - 9.0μg/m3',
          label: 'Air Quality is Good',
          icon: <GoodAir width={size} height={size} />,
        },
        {
          range: '9.1μg/m3 - 35.4μg/m3',
          label: 'Air Quality is Moderate',
          icon: <ModerateAir width={size} height={size} />,
        },
        {
          range: '35.5μg/m3 - 55.4μg/m3',
          label: 'Air Quality is Unhealthy for Sensitive Groups',
          icon: <UnhealthyForSensitiveGroups width={size} height={size} />,
        },
        {
          range: '55.5μg/m3 - 125.4μg/m3',
          label: 'Air Quality is Unhealthy',
          icon: <Unhealthy width={size} height={size} />,
        },
        {
          range: '125.5μg/m3 - 225.4μg/m3',
          label: 'Air Quality is Very Unhealthy',
          icon: <VeryUnhealthy width={size} height={size} />,
        },
        {
          range: '225.5μg/m3 +',
          label: 'Air Quality is Hazardous',
          icon: <Hazardous width={size} height={size} />,
        },
      ],
      // Add similar levels for pm10 and no2...
    }),
    [size],
  );

  const levels = pollutantLevels[pollutant] || [];

  return (
    <Card
      className="flex flex-col items-center"
      padding="p-1 md:p-2"
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
        aria-label="Air Quality Control"
      >
        {show ? <DownArrow /> : <UpArrow />}
      </button>
      {/* Container for the collapsible legend */}
      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-300 ease-in-out flex flex-col items-center gap-2"
        style={{ maxHeight: contentHeight }}
      >
        {levels.map((level, index) => (
          <button
            key={index}
            className="bg-transparent rounded-full"
            aria-label={level.label}
            data-tippy-content={`${level.label}\n${level.range}`}
            ref={(el) => (legendButtonsRef.current[index] = el)}
          >
            {level.icon}
          </button>
        ))}
      </div>
    </Card>
  );
};

AirQualityLegend.propTypes = {
  pollutant: PropTypes.oneOf(['pm2_5', 'pm10', 'no2']).isRequired,
};

export default AirQualityLegend;
