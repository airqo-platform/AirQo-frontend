import React from 'react';
import Team from 'assets/img/cleanAir/team.webp';
import { useTranslation } from 'react-i18next';

const RegisterSection = ({ link }) => {
  const { t } = useTranslation();

  const handleClick = () => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="partners">
      <div className="banner">
        <img className="banner-image" src={Team} alt="Team" loading="lazy" />
        <div className="banner-content">
          <p>{t('cleanAirSite.membership.individualSection.subText')}</p>
          <button className="register-button" onClick={handleClick}>
            {t('cleanAirSite.membership.individualSection.cta')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterSection;
``;
