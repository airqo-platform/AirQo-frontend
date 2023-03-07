import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setNavTab } from '../../../reduxStore/EventsNav/NavigationSlice';

const EventsNavigation = ({ navTabs }) => {
  const [selectedTab, setSelectedTab] = useState(navTabs[0]);
  const onClickTabItem = (tab) => setSelectedTab(tab);
  const dispatch = useDispatch();

  return (
    <>
      <div className="nav">
        {navTabs.map((tab) => (
          <span>
            <button
              className={selectedTab === tab ? 'selected' : 'unselected'}
              onClick={() => {
                onClickTabItem(tab);
                dispatch(setNavTab(tab));
              }}>
              {tab}
            </button>
          </span>
        ))}
      </div>
    </>
  );
};

export default EventsNavigation;
