import React from 'react';
import SecondaryNavComponent from '../SecondaryNav';
import { Link } from 'react-router-dom';

const HeaderComponent = ({ title, pageTitle, style }) => {
  return (
    <div className="header-wrapper" style={style}>
      <div className="content">
        <div className="breadcrumb">
          <Link to="/">
            <span>AirQo</span>
          </Link>
          <span className="arrow">{'>'}</span>
          <Link to="/clean-air">
            <span>{pageTitle}</span>
          </Link>
        </div>
        <div className="heading-title">
          <h1>{title}</h1>
        </div>
        <SecondaryNavComponent disabledTabs={[3]} />
      </div>
    </div>
  );
};

export default HeaderComponent;
