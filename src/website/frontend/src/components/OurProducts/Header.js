import React from 'react';
import { useTranslation } from 'react-i18next';

const Header = ({ pageTitle, title, subText, children, style }) => {
  const { t } = useTranslation();
  return (
    <div className="header-wrapper" style={style}>
      <div className="content">
        <div className="grid-wrapper row">
          <div className="left">
            <div className="breadcrumb">
              <span>{t('products.header.breadCrumb.pages')}</span>
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
