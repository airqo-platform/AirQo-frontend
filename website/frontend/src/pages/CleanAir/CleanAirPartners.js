import React, { useEffect, useState } from 'react';
import { isEmpty } from 'underscore';
import SEO from 'utilities/seo';
import { useInitScrollTop } from 'utilities/customHooks';
import { useDispatch } from 'react-redux';
import { SplitSection, SingleSection } from 'components/CleanAir';
import { useNavigate } from 'react-router-dom';
import { usePartnersData } from '../../../reduxStore/Partners/selectors';
import { loadPartnersData } from '../../../reduxStore/Partners/operations';
import Partner1 from 'assets/img/cleanAir/partners-sec1.png';
import Partner2 from 'assets/img/cleanAir/partners-sec2.png';
import Partner3 from 'assets/img/cleanAir/partners-sec3.png';
import Partner4 from 'assets/img/cleanAir/partners-sec4.png';
import useWindowSize from 'utilities/customHooks';
import { useTranslation, Trans } from 'react-i18next';

const CleanAirPartners = () => {
  useInitScrollTop();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const partnersData = usePartnersData();
  const { width } = useWindowSize();

  useEffect(() => {
    if (isEmpty(partnersData)) {
      dispatch(loadPartnersData());
    }
  }, []);

  const cleanAirPartners = partnersData.filter(
    (partner) => partner.website_category === 'cleanair'
  );

  const implementingPartners = cleanAirPartners.filter((partner) => partner.type === 'ca-network');

  const policyPartners = cleanAirPartners.filter((partner) => partner.type === 'ca-forum');

  const supportPartners = cleanAirPartners.filter((partner) => partner.type === 'ca-support');

  const privateSectorPartners = cleanAirPartners.filter(
    (partner) => partner.type === 'ca-private-sector'
  );

  const onLogoClick = (data) => (event) => {
    event.preventDefault();
    if (data.descriptions.length > 0) {
      navigate(`/partners/${data.unique_title}`);
    } else if (data.partner_link) {
      window.open(data.partner_link, '_blank');
    }
  };

  const [itemsToShow, setItemsToShow] = useState(8);
  const [itemsToShowPolicy, setItemsToShowPolicy] = useState(8);
  const [itemsToShowSupport, setItemsToShowSupport] = useState(8);
  const [itemsToShowPrivate, setItemsToShowPrivate] = useState(8);

  const showMoreItems = (setItems, increment) => {
    setItems((prevState) => prevState + increment);
  };

  const showLessItems = (setItems, decrement, minItems) => {
    setItems((prevState) => (prevState > minItems ? prevState - decrement : minItems));
  };

  useEffect(() => {
    let backdropRevElements = document.querySelectorAll('.backdrop-rev');

    backdropRevElements.forEach((element) => {
      if (width < 1081) {
        element.style.flexDirection = 'column';
      } else {
        element.style.flexDirection = 'column-reverse';
      }
    });
  }, [width]);

  return (
    <div className="page-wrapper">
      {/* SEO */}
      <SEO
        title="Partners"
        siteTitle="CLEAN-Air Network"
        description="Meet the partners of CLEAN-Air Africa Network, a diverse group of organizations and individuals dedicated to improving air quality across Africa. Join us in our mission to foster innovative air quality solutions and effective air quality management strategies."
      />

      {/* section 1 */}
      <div className="partners">
        <div className="partners-wrapper">
          <p className="partners-intro">
            <Trans i18nKey="cleanAirSite.membership.section1">
              The CLEAN-Air Network is a multi-regional network, strengthening cross-regional
              collaborations and partnerships to enable collective learning and knowledge sharing.
              <br />
              <br />
              We have a growing list of partners from diverse disciplines across different parts of
              the world, reflecting the multidisciplinarity of tackling urban air pollution.
            </Trans>
          </p>
        </div>
      </div>

      <div>
        <hr className="separator-1" />
      </div>

      <div>
        <div className="partners">
          <div className="partners-wrapper">
            <h2 className="extra-content">
              {t('cleanAirSite.membership.implementingPartners.intro')}
            </h2>
          </div>
        </div>

        <SplitSection
          content={t('cleanAirSite.membership.implementingPartners.subText')}
          showButton={false}
          imgURL={Partner1}
          bgColor="#FFFFFF"
          reverse
          titleSection={true}
        />

        {implementingPartners.length > 0 && (
          <div className="partners AboutUsPage">
            <div className="partners-wrapper wrapper">
              <div className="partners-list">
                {implementingPartners.slice(0, itemsToShow).map((implementingPartner) => (
                  <div
                    style={
                      implementingPartner.descriptions.length > 0 ? { cursor: 'pointer' } : null
                    }
                    className="partner-img"
                    key={implementingPartner.id}
                    onClick={onLogoClick(implementingPartner)}>
                    <img
                      src={implementingPartner.partner_logo}
                      alt={implementingPartner.partner_name}
                    />
                  </div>
                ))}
              </div>
              <div className="partner-logos">
                {itemsToShow < implementingPartners.length && (
                  <button
                    className="partners-toggle-button"
                    onClick={() => showMoreItems(setItemsToShow, 8)}>
                    {t('cleanAirSite.cta.showMore')}
                  </button>
                )}
                {itemsToShow > 8 && (
                  <button
                    className="partners-toggle-button"
                    onClick={() => showLessItems(setItemsToShow, 8, 8)}>
                    {t('cleanAirSite.cta.showLess')}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        <hr className="separator-1" />
      </div>

      <div>
        <div className="partners">
          <div className="partners-wrapper">
            <h2 className="extra-content ">{t('cleanAirSite.membership.policyPartners.intro')}</h2>
          </div>
        </div>

        <SplitSection
          content={t('cleanAirSite.membership.policyPartners.subText')}
          showButton={false}
          imgURL={Partner2}
          bgColor="#FFFFFF"
          reverse
          titleSection={true}
        />

        {policyPartners.length > 0 && (
          <div className="partners AboutUsPage">
            <div className="partners-wrapper wrapper">
              <div className="partners-list">
                {policyPartners.slice(0, itemsToShowPolicy).map((policyPartner) => (
                  <div
                    style={policyPartner.descriptions.length > 0 ? { cursor: 'pointer' } : null}
                    className="partner-img"
                    key={policyPartner.id}
                    onClick={onLogoClick(policyPartner)}>
                    <img src={policyPartner.partner_logo} alt={policyPartner.partner_name} />
                  </div>
                ))}
                <div className="partner-logos">
                  {itemsToShowPolicy < policyPartners.length && (
                    <button
                      className="partners-toggle-button"
                      onClick={() => showMoreItems(setItemsToShowPolicy, 8)}>
                      {t('cleanAirSite.cta.showMore')}
                    </button>
                  )}
                  {itemsToShowPolicy > 8 && (
                    <button
                      className="partners-toggle-button"
                      onClick={() => showLessItems(setItemsToShowPolicy, 8, 8)}>
                      {t('cleanAirSite.cta.showLess')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        <hr className="separator-1" />
      </div>

      <div>
        <div className="partners">
          <div className="partners-wrapper">
            <h2 className="extra-content ">{t('cleanAirSite.membership.privateSector.intro')}</h2>
          </div>
        </div>

        <SplitSection
          content={t('cleanAirSite.membership.privateSector.subText')}
          showButton={false}
          imgURL={Partner4}
          bgColor="#FFFFFF"
          reverse
          titleSection={true}
        />

        {privateSectorPartners.length > 0 && (
          <div className="partners AboutUsPage">
            <div className="partners-wrapper wrapper">
              <div className="partners-list">
                {privateSectorPartners.slice(0, itemsToShowPrivate).map((privatePartner) => (
                  <div
                    style={privatePartner.descriptions.length > 0 ? { cursor: 'pointer' } : null}
                    className="partner-img"
                    key={privatePartner.id}
                    onClick={onLogoClick(privatePartner)}>
                    <img src={privatePartner.partner_logo} alt={privatePartner.partner_name} />
                  </div>
                ))}
              </div>
              <div className="partner-logos">
                {itemsToShow < privateSectorPartners.length && (
                  <button
                    className="partners-toggle-button"
                    onClick={() => showMoreItems(setItemsToShowPrivate, 8)}>
                    Show More
                  </button>
                )}
                {itemsToShow > 8 && (
                  <button
                    className="partners-toggle-button"
                    onClick={() => showLessItems(setItemsToShowPrivate, 8, 8)}>
                    Show Less
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        <hr className="separator-1" />
      </div>

      <div>
        <div className="partners">
          <div className="partners-wrapper">
            <h2 className="extra-content ">
              {t('cleanAirSite.membership.supportingPartners.intro')}
            </h2>
          </div>
        </div>

        <SplitSection
          content={t('cleanAirSite.membership.supportingPartners.subText')}
          showButton={false}
          imgURL={Partner3}
          bgColor="#FFFFFF"
          reverse
          titleSection={true}
        />

        {supportPartners.length > 0 && (
          <div className="partners AboutUsPage">
            <div className="partners-wrapper wrapper">
              <div className="partners-list">
                {supportPartners.slice(0, itemsToShowSupport).map((supportPartner) => (
                  <div
                    style={supportPartner.descriptions.length > 0 ? { cursor: 'pointer' } : null}
                    className="partner-img"
                    key={supportPartner.id}
                    onClick={onLogoClick(supportPartner)}>
                    <img src={supportPartner.partner_logo} alt={supportPartner.partner_name} />
                  </div>
                ))}
                <div className="partner-logos">
                  {itemsToShowSupport < supportPartners.length && (
                    <button
                      className="partners-toggle-button"
                      onClick={() => showMoreItems(setItemsToShowSupport, 8)}>
                      Show More
                    </button>
                  )}
                  {itemsToShowSupport > 8 && (
                    <button
                      className="partners-toggle-button"
                      onClick={() => showLessItems(setItemsToShowSupport, 8, 8)}>
                      Show Less
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="individual-section">
        <SingleSection
          removeTopMargin={true}
          content={<Trans i18nKey="cleanAirSite.membership.individualSection.subText" />}
          btnText={t('cleanAirSite.membership.individualSection.cta')}
          link="https://docs.google.com/forms/d/e/1FAIpQLScIPz7VrhfO2ifMI0dPWIQRiGQ9y30LoKUCT-DDyorS7sAKUA/viewform"
          bgColor="#F2F1F6"
          btnStyle={{ width: 'auto' }}
        />
      </div>
    </div>
  );
};

export default CleanAirPartners;
