import React, { useState } from 'react';

const EventsNavigation = () => {
  const [selectedTab, setSelectedTab] = useState('upcoming');
  const onClickTabItem = (tab) => setSelectedTab(tab);
  return (
    <div>
      <div className="nav">
        <span id="tab1">
          <button
            className={selectedTab === 'upcoming' ? 'selected' : 'unselected'}
            onClick={() => {
              onClickTabItem('upcoming');
            }}>
            Upcoming Events
          </button>
        </span>
        <span id="tab2">
          <button
            className={selectedTab === 'past' ? 'selected' : 'unselected'}
            onClick={() => {
              paginate(1);
              onClickTabItem('past');
            }}>
            Past Events
          </button>
        </span>
      </div>
    </div>
  );
};

export default EventsNavigation;
