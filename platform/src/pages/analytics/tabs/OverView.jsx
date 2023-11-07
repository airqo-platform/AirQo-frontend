import React from 'react';
import ChartContainer from '@/components/Charts/ChartContainer';
import AQNumberCard from '@/components/AQNumberCard';
import BorderlessContentBox from '@/components/Layout/borderless_content_box';

const OverView = () => {
  // get data from events api redux

  return (
    <BorderlessContentBox>
      <div
        className='mb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 grid-flow-col-dense'
        style={{ gridAutoFlow: 'dense' }}
      >
        <AQNumberCard location='Jinja city council hq' reading={'230'} />
        <AQNumberCard location='Nairobi' reading={'44'} />
        <AQNumberCard location='Kishasha' reading={'7'} />
        <AQNumberCard location='London' reading={'89'} />
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <ChartContainer chartType='line' chartTitle='Air quality over time' />
        <ChartContainer chartType='bar' chartTitle='Air quality over time' />
      </div>
      <style jsx>{`
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(auto, 1fr));
          grid-gap: 1rem;
        }

        @media (min-width: 640px) {
          .grid {
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          }
        }

        @media (min-width: 768px) {
          .grid {
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          }
        }

        @media (min-width: 1024px) {
          .grid {
            grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
          }
        }
      `}</style>
    </BorderlessContentBox>
  );
};

export default OverView;
