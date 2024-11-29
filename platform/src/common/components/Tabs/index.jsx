import React, { useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setChartTab } from '@/lib/store/services/charts/ChartSlice';
import PropTypes from 'prop-types';

const TabItem = React.memo(({ label, index, isActive, onClick }) => {
  const className = useMemo(() => {
    return isActive
      ? 'border-blue-600 text-blue-600'
      : 'border-transparent opacity-40 hover:text-grey hover:border-grey-200 text-secondary-neutral-light-400';
  }, [isActive]);

  return (
    <li
      role="presentation"
      className={`${className} whitespace-nowrap py-2 border-b-2 rounded-tl-full rounded-tr-full font-medium text-sm focus:outline-none mr-2 cursor-pointer`}
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
      className="relative w-full h-dvh transition-all duration-300 ease-in-out"
    >
      <div
        className={`${
          positionFixed ? 'fixed' : ''
        } w-full h-14 border-b border-grey-200 flex items-end z-20 ${
          childrenRight ? 'justify-between' : ''
        }`}
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
