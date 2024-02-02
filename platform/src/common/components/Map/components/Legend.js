import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';
import 'tippy.js/themes/light.css';
import React, { useState } from 'react';
// Icons
import GoodAir from '@/icons/Charts/GoodAir';
import ModerateAir from '@/icons/Charts/Moderate';
import UnhealthyForSensitiveGroups from '@/icons/Charts/UnhealthySG';
import Unhealthy from '@/icons/Charts/Unhealthy';
import VeryUnhealthy from '@/icons/Charts/VeryUnhealthy';
import Hazardous from '@/icons/Charts/Hazardous';
import UpArrow from '@/icons/map/UpArrow';
import DownArrow from '@/icons/map/DownArrow';

export const AirQualityLegend = () => {
  const [show, setShow] = useState(true);
  const levels = [
    {
      range: '0μg/m3 - 12μg/m3',
      label: 'Air Quality is Good',
      icon: <GoodAir width={40} height={40} />,
    },
    {
      range: '12.4μg/m3 - 25μg/m3 ',
      label: 'Air Quality is Moderate',
      icon: <ModerateAir width={40} height={40} />,
    },
    {
      range: '25.5μg/m3 - 37.4μg/m3',
      label: 'Air Quality is Unhealthy for Sensitive Groups',
      icon: <UnhealthyForSensitiveGroups width={40} height={40} />,
    },
    {
      range: '37.5μg/m3 - 50μg/m3',
      label: 'Air Quality is Unhealthy',
      icon: <Unhealthy width={40} height={40} />,
    },
    {
      range: '50.5μg/m3 - 90μg/m3',
      label: 'Air Quality is Very Unhealthy',
      icon: <VeryUnhealthy width={40} height={40} />,
    },
    {
      range: '90.5μg/m3 - 500μg/m3',
      label: 'Air Quality is Hazardous',
      icon: <Hazardous width={40} height={40} />,
    },
  ];

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
