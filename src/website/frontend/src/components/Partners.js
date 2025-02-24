import React from 'react';
import GoogleLogo from 'icons/homepage/partners/google.svg';
import UNEPLogo from 'icons/homepage/partners/UN.svg';
import Enabel from 'icons/homepage/partners/enabel.svg';
import UseMissionUganda from 'icons/homepage/partners/usmissionuganda.svg';
import WorldBankGroup from 'icons/homepage/partners/worldbankgroup.svg';
import { useTranslation, } from 'react-i18next';

const Partners = () => {
  const { t } = useTranslation();
  return (
    <div className="partners-section">
      <div className="backdrop">
        <div className="content">
          <div>
            <span className="title"> {t("homepage.airQuality.support")}</span>
          </div>
          <div className="logos">
            <div>
              <GoogleLogo />
            </div>
            <div>
              <UseMissionUganda />
            </div>
            <div>
              <Enabel />
            </div>
            <div>
              <WorldBankGroup />
            </div>
            <div>
              <UNEPLogo />{' '}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Partners;
