import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setChartTab } from '@/lib/store/services/charts/ChartSlice';

function Tabs({ children, childrenRight, positionFixed }) {
  const dispatch = useDispatch();
  const chartData = useSelector((state) => state?.chart);
  const childrenArray = React.Children.toArray(children);

  useEffect(() => {
    dispatch(setChartTab(0));
  }, []);

  return (
    <div data-testid='tabs' className='relative w-full'>
      <div
        className={`${
          positionFixed && 'fixed'
        } w-full h-14 bg-white px-4 lg:px-16 border-b border-grey-200 flex items-end z-20 ${
          childrenRight && 'justify-between'
        }`}
      >
        <ul className='flex flex-wrap gap-6 text-sm font-medium text-center'>
          {childrenArray.map((child, index) => (
            <li
              key={index}
              role='presentation'
              className={`${
                chartData.chartTab === index
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent opacity-40 hover:text-grey hover:border-grey-200 text-secondary-neutral-light-400'
              } whitespace-nowrap py-2 border-b-2 rounded-tl-full rounded-tr-full font-medium text-sm focus:outline-none mr-2 cursor-pointer`}
              onClick={() => dispatch(setChartTab(index))}
            >
              {child.props.label}
            </li>
          ))}
        </ul>
        <div>
          {childrenRight &&
            childrenRight[chartData.chartTab] &&
            childrenRight[chartData.chartTab].children}
        </div>
      </div>
      <div className='h-8' />
      <div>{children[chartData.chartTab]}</div>
    </div>
  );
}

export default Tabs;
