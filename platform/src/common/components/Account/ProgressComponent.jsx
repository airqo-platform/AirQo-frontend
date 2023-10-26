import React from 'react'

const ProgressComponent = ({colorFirst, colorSecond, colorThird}) => {
  return (
    <div className='w-full flex flex-row items-center justify-start my-7'>
      <div
        className={
          colorFirst
            ? 'w-12 rounded-full h-2 bg-blue-600 mr-2'
            : 'w-12 rounded-full h-2 bg-pill-grey mr-2'
        }></div>
      <div
        className={
          colorSecond
            ? 'w-12 rounded-full h-2 bg-blue-600 mr-2'
            : 'w-12 rounded-full h-2 bg-pill-grey mr-2'
        }></div>
      <div
        className={
          colorThird
            ? 'w-12 rounded-full h-2 bg-blue-600 mr-2'
            : 'w-12  rounded-full h-2 bg-pill-grey mr-2'
        }></div>
    </div>
  );
}

export default ProgressComponent