import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setNavTab } from '../../../reduxStore/EventsNav/NavigationSlice';

const EventsNavigation = ({ navTabs }) => {
  const activeTab = useSelector((state) => state.eventsNavTab.tab);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setNavTab(navTabs[0]));
  }, []);

  const onClickTabItem = (tab) => {
    dispatch(setNavTab(tab));
  };

  return (
    <div className="nav">
      {navTabs.map((tab) => (
        <span key={tab}>
          <button
            className={activeTab === tab ? 'selected' : 'unselected'}
            onClick={() => onClickTabItem(tab)}
          >
            {tab}
          </button>
        </span>
      ))}
    </div>
  );
};

export default EventsNavigation;
