import React from 'react';
import MonitorImg from 'assets/img/monitor.webp';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Monitor = () => {
  const { t } = useTranslation();
  return (
    <div className="Monitor">
      <div className="monitor-content">
        <div className="label">
          <span>{t('homepage.monitor.pill')}</span>
        </div>
        <p className="text-main">{t('homepage.monitor.title')}</p>
        <p className="text-sub">{t('homepage.monitor.subText')}</p>
        <Link to="/products/monitor">
          <p className="learn-more">
            <span>
              {t('homepage.monitor.cta')} {'-->'}
            </span>
          </p>
        </Link>
      </div>
      <div
        className="Monitor-img"
        style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
        <img
          src={MonitorImg}
          alt="Monitor Image"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
};

export default Monitor;
