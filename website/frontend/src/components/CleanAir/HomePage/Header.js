import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveTab } from '../../../../reduxStore/CleanAirNetwork/CleanAir';

const Header = ({ title, pageTitle, style }) => {
  const dispatch = useDispatch();
  const activeTab = useSelector((state) => state.cleanAirData.activeTab);

  useEffect(() => {
    dispatch(setActiveTab(0));
  }, [dispatch]);

  const handleTabClick = (index) => {
    dispatch(setActiveTab(index));
  };

  const tabs = ['About', 'Memberships', 'Press', 'For You'];

  return (
    <div className="header-wrapper" style={style}>
      <div className="overlay" />
      <div className="content">
        <div className="breadcrumb">
          <span>AirQo</span>
          <span className="arrow">{'>'}</span>
          <span>{pageTitle}</span>
        </div>
        <div className="heading-title">
          <h1>{title}</h1>
        </div>
        <div className="header-subnav">
          <ul className="tabs">
            {tabs.map((tab, index) => (
              <li
                key={index}
                className={`${activeTab === index ? 'active' : ''}`}
                onClick={() => handleTabClick(index)}>
                <span>{tab}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Header;
