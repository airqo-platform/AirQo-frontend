import React from 'react';
import AnalyticsDashboard from 'assets/img/OurProducts/Analytics/analytics-dashboard.webp';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AnalyticsSection = () => {
  const { t } = useTranslation();
  return (
    <div className="AnalyticsSection">
      <div className="wrapper">
        <h3>{t('homepage.analytics.pill')}</h3>
        <div className="AnalyticsSection-info">
          <h1>{t('homepage.analytics.title')}</h1>
          <div className="AnalyticsSection-info-aside">
            <p>{t('homepage.analytics.subText')}</p>
            <Link to="/products/analytics" className="AnalyticsSection-info-aside-btn">
              {t('homepage.analytics.cta')} {'-->'}
            </Link>
          </div>
        </div>
      </div>
      <div className="analytics-img">
        <img loading="lazy" src={AnalyticsDashboard} alt="Analytics Dashboard" />
      </div>
    </div>
  );
};

export default AnalyticsSection;
