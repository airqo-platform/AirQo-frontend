import React, { useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setChartTab } from '@/lib/store/services/charts/ChartSlice';
import PropTypes from 'prop-types';

const TabItem = React.memo(({ label, index, isActive, onClick }) => {
  const className = useMemo(() => {
    return isActive
      ? 'border-primary text-primary dark:border-primary dark:text-primary'
      : 'border-transparent hover:text-gray-700 dark:hover:text-gray-300 text-gray-500/50 dark:text-white hover:border-gray-200 dark:hover:border-gray-600';
  }, [isActive]);

  return (
    <li
      role="presentation"
      className={`${className} whitespace-nowrap py-2 border-b-2 rounded-tl-full rounded-tr-full font-medium text-sm focus:outline-none mr-2 cursor-pointer transition-colors duration-200`}
      onClick={() => onClick(index)}
    >
      {label}
    </li>
  );
});

TabItem.propTypes = {
  label: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

TabItem.displayName = 'TabItem';

const Tabs = ({ children, childrenRight, positionFixed }) => {
  const dispatch = useDispatch();
  const chartTab = useSelector((state) => state.chart.chartTab);

  const handleTabClick = useCallback(
    (index) => {
      dispatch(setChartTab(index));
    },
    [dispatch],
  );

  const childrenArray = useMemo(
    () => React.Children.toArray(children),
    [children],
  );

  const tabItems = useMemo(() => {
    return childrenArray.map((child, index) => (
      <TabItem
        key={child.key || index}
        label={child.props.label}
        index={index}
        isActive={chartTab === index}
        onClick={handleTabClick}
      />
    ));
  }, [childrenArray, chartTab, handleTabClick]);

  const activeRightChild = useMemo(() => {
    return (
      childrenRight &&
      childrenRight[chartTab] &&
      childrenRight[chartTab].children
    );
  }, [childrenRight, chartTab]);

  return (
    <div
      data-testid="tabs"
      className="relative w-full transition-all duration-300 ease-in-out"
    >
      <div
        className={`${
          positionFixed ? 'fixed' : ''
        } w-full h-14 border-b border-gray-200 dark:border-gray-700 flex items-end px-2 z-20 ${
          childrenRight ? 'justify-between' : ''
        } bg-white dark:bg-[#1d1f20]`}
      >
        <ul className="flex overflow-x-auto map-scrollbar gap-6 text-sm font-medium text-center">
          {tabItems}
        </ul>
        {activeRightChild && <div>{activeRightChild}</div>}
      </div>
      <div className="h-8" />
      <div>{childrenArray[chartTab]}</div>
    </div>
  );
};

Tabs.propTypes = {
  children: PropTypes.node.isRequired,
  childrenRight: PropTypes.arrayOf(PropTypes.node),
  positionFixed: PropTypes.bool,
};

export default React.memo(Tabs);
