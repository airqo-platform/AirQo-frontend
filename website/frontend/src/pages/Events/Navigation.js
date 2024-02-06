import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setNavTab } from '../../../reduxStore/EventsNav/NavigationSlice';

const EventsNavigation = ({ navTabs }) => {
  const [selectedTab, setSelectedTab] = useState(navTabs[0]);
  const selectedNavTab = useSelector((state) => state.eventsNavTab.tab);
  const onClickTabItem = (tab) => setSelectedTab(tab);
  const dispatch = useDispatch();

  useEffect(() => {
    setSelectedTab(selectedNavTab);
  }, []);

  return (
    <>
      <div className="nav">
        {navTabs.map((tab) => (
          <span key={tab}>
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
