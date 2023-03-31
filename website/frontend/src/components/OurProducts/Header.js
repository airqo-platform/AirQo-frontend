import React from 'react';

const Header = ({ pageTitle, title, subText, children }) => {
  return (
    <div className="header-wrapper">
      <div className="content">
        <div className="grid-wrapper row">
          <div className="left">
            <div className="breadcrumb">
              <span>Our Products</span>
              <span className="arrow">{'>'}</span>
              <span>{pageTitle}</span>
            </div>
            <div className="heading">
              <h1>{title}</h1>
              <p>{subText}</p>
            </div>
          </div>
          <div className="right">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Header;
