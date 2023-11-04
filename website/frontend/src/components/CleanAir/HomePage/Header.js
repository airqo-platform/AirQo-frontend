import React from 'react';
import SecondaryNavComponent from '../SecondaryNav';

const HeaderComponent = ({ title, pageTitle, style }) => {
  return (
    <div className="header-wrapper" style={style}>
      <div className="content">
        <div className="breadcrumb">
          <span>AirQo</span>
          <span className="arrow">{'>'}</span>
          <span>{pageTitle}</span>
        </div>
        <div className="heading-title">
          <h1>{title}</h1>
        </div>
        <SecondaryNavComponent disabledTabs={[2, 3]} />
      </div>
    </div>
  );
};

export default HeaderComponent;
