import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';
import 'tippy.js/themes/light.css';
import React, { useState, useEffect } from 'react';
// Icons
import GoodAir from '@/icons/Charts/GoodAir';
import ModerateAir from '@/icons/Charts/Moderate';
import UnhealthyForSensitiveGroups from '@/icons/Charts/UnhealthySG';
import Unhealthy from '@/icons/Charts/Unhealthy';
import VeryUnhealthy from '@/icons/Charts/VeryUnhealthy';
import Hazardous from '@/icons/Charts/Hazardous';
import UpArrow from '@/icons/map/upArrow';
import DownArrow from '@/icons/map/downArrow';

/**
 * AirQualityLegend
 * @returns {HTMLElement}
 */
export const AirQualityLegend = ({ pollutant }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setShow(false);
      } else {
        setShow(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Define different AQI levels for each pollutant
  const pollutantLevels = {
    pm2_5: [
      {
        range: '0.0μg/m3 - 12.0μg/m3',
        label: 'Air Quality is Good',
        icon: <GoodAir width={40} height={40} />,
      },
      {
        range: '12.1μg/m3 - 35.4μg/m3',
        label: 'Air Quality is Moderate',
        icon: <ModerateAir width={40} height={40} />,
      },
      {
        range: '35.5μg/m3 - 55.4μg/m3',
        label: 'Air Quality is Unhealthy for Sensitive Groups',
        icon: <UnhealthyForSensitiveGroups width={40} height={40} />,
      },
      {
        range: '55.5μg/m3 - 150.4μg/m3',
        label: 'Air Quality is Unhealthy',
        icon: <Unhealthy width={40} height={40} />,
      },
      {
        range: '150.5μg/m3 - 250.4μg/m3',
        label: 'Air Quality is Very Unhealthy',
        icon: <VeryUnhealthy width={40} height={40} />,
      },
      {
        range: '250.5μg/m3 - 500.4μg/m3',
        label: 'Air Quality is Hazardous',
        icon: <Hazardous width={40} height={40} />,
      },
    ],
    pm10: [
      {
        range: '0.0μg/m3 - 54.0μg/m3',
        label: 'Air Quality is Good',
        icon: <GoodAir width={40} height={40} />,
      },
      {
        range: '54.1μg/m3 - 154.0μg/m3',
        label: 'Air Quality is Moderate',
        icon: <ModerateAir width={40} height={40} />,
      },
      {
        range: '154.1μg/m3 - 254.0μg/m3',
        label: 'Air Quality is Unhealthy for Sensitive Groups',
        icon: <UnhealthyForSensitiveGroups width={40} height={40} />,
      },
      {
        range: '254.1μg/m3 - 354.0μg/m3',
        label: 'Air Quality is Unhealthy',
        icon: <Unhealthy width={40} height={40} />,
      },
      {
        range: '354.1μg/m3 - 424.0μg/m3',
        label: 'Air Quality is Very Unhealthy',
        icon: <VeryUnhealthy width={40} height={40} />,
      },
      {
        range: '424.1μg/m3 - 604.0μg/m3',
        label: 'Air Quality is Hazardous',
        icon: <Hazardous width={40} height={40} />,
      },
    ],
    no2: [
      {
        range: '0.0μg/m3 - 53.0μg/m3',
        label: 'Air Quality is Good',
        icon: <GoodAir width={40} height={40} />,
      },
      {
        range: '53.1μg/m3 - 100.0μg/m3',
        label: 'Air Quality is Moderate',
        icon: <ModerateAir width={40} height={40} />,
      },
      {
        range: '100.1μg/m3 - 360.0μg/m3',
        label: 'Air Quality is Unhealthy for Sensitive Groups',
        icon: <UnhealthyForSensitiveGroups width={40} height={40} />,
      },
      {
        range: '360.1μg/m3 - 649.0μg/m3',
        label: 'Air Quality is Unhealthy',
        icon: <Unhealthy width={40} height={40} />,
      },
      {
        range: '649.1μg/m3 - 1249.0μg/m3',
        label: 'Air Quality is Very Unhealthy',
        icon: <VeryUnhealthy width={40} height={40} />,
      },
      {
        range: '1249.1μg/m3 - 2049.0μg/m3',
        label: 'Air Quality is Hazardous',
        icon: <Hazardous width={40} height={40} />,
      },
    ],
  };

  // Get the levels for the current pollutant
  const levels = pollutantLevels[pollutant];

  return (
    <div className='flex flex-col items-center rounded-full shadow-md p-2 bg-white'>
      <button
        onClick={() => setShow(!show)}
        className='rounded-full p-2 mb-1 last:mb-0'
        aria-label='Air Quality Control'>
        {show ? <DownArrow /> : <UpArrow />}
      </button>
      {show &&
        levels.map((level, index) => (
          <Tippy
            content={
              <div className='p-1'>
                <p className='text-xs text-center text-[#9EA3AA]'>{level.label}</p>
                <p className='text-xs text-center'>{level.range}</p>
              </div>
            }
            key={index}
            offset={[0, 20]}
            placement='right'
            theme='light'
            animation={'scale'}>
            <button
              className={`bg-${level.color}-500 rounded-full mb-2 last:mb-0`}
              aria-label={level.label}>
              {level.icon}
            </button>
          </Tippy>
        ))}
    </div>
  );
};
