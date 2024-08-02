import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * @description BottomCTAs component
 * @returns {JSX.Element}
 */
const BottomCTAs = () => {
  const { t } = useTranslation();
  return (
    <div className="Highlight" style={{ minHeight: '0px', cursor: 'pointer' }}>
      <div className="highlight-sub" style={{ gap: '20px' }}>
        <Link
          to="https://docs.google.com/forms/d/e/1FAIpQLScIPz7VrhfO2ifMI0dPWIQRiGQ9y30LoKUCT-DDyorS7sAKUA/viewform"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="content-wrapper blue-bg">
            <div className="title white-color">
              {t('cleanAirSite.bottomCTA.left.title')}
            </div>
            <div className="link white-color">
              <span>
                {t('cleanAirSite.bottomCTA.left.ctaText')} {'-->'}
              </span>
            </div>
          </div>
        </Link>
        <Link
          to="https://docs.google.com/forms/d/14jKDs2uCtMy2a_hzyCiJnu9i0GbxITX_DJxVB4GGP5c/edit"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="content-wrapper light-blue-bg">
            <div className="title blue-color">
              {t('cleanAirSite.bottomCTA.right.title')}
            </div>
            <div className="link blue-color">
              {' '}
              {t('cleanAirSite.bottomCTA.right.ctaText')} {'-->'}
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default BottomCTAs;
