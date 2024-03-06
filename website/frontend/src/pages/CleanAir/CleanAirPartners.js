import React from 'react';
import { isEmpty } from 'underscore';
import SEO from 'utilities/seo';
import { useInitScrollTop } from 'utilities/customHooks';
import { SplitTextSection, RegisterSection, IntroSection } from 'components/CleanAir';
import { usePartnersData } from '../../../reduxStore/Partners/selectors';
import Membership from 'assets/img/cleanAir/membership.png';
import { useTranslation } from 'react-i18next';

const CleanAirPartners = () => {
  useInitScrollTop();
  const { t } = useTranslation();
  const partnersData = usePartnersData();
  const isLoading = isEmpty(partnersData);

  const cleanAirPartners = partnersData.filter(
    (partner) => partner.website_category === 'cleanair'
  );

  const implementingPartners = cleanAirPartners.filter((partner) => partner.type === 'ca-network');

  const policyPartners = cleanAirPartners.filter((partner) => partner.type === 'ca-forum');

  const supportPartners = cleanAirPartners.filter((partner) => partner.type === 'ca-support');

  const privateSectorPartners = cleanAirPartners.filter(
    (partner) => partner.type === 'ca-private-sector'
  );

  return (
    <div className="page-wrapper">
      {/* SEO */}
      <SEO
        title="Partners"
        siteTitle="CLEAN-Air Network"
        description="Meet the partners of CLEAN-Air Africa Network, a diverse group of organizations and individuals dedicated to improving air quality across Africa. Join us in our mission to foster innovative air quality solutions and effective air quality management strategies."
      />

      {/* section 1 */}
      <IntroSection
        image={Membership}
        imagePosition={'50%'}
        subtext1={t('cleanAirSite.membership.section1.subText')}
        subtext2={t('cleanAirSite.membership.section1.intro')}
      />

      {/* Implementing Partners */}
      <SplitTextSection
        loading={isLoading}
        content={t('cleanAirSite.membership.implementingPartners.subText')}
        title={t('cleanAirSite.membership.implementingPartners.title')}
        lists={implementingPartners}
        bgColor="#ECF2FF"
      />

      {/* Policy Partners */}
      <SplitTextSection
        loading={isLoading}
        content={t('cleanAirSite.membership.policyPartners.subText')}
        title={t('cleanAirSite.membership.policyPartners.title')}
        lists={policyPartners}
        bgColor="#FFFFFF"
      />

      {/* Private Sector Partners */}
      <SplitTextSection
        loading={isLoading}
        content={t('cleanAirSite.membership.privateSector.subText')}
        title={t('cleanAirSite.membership.privateSector.title')}
        lists={privateSectorPartners}
        bgColor="#ECF2FF"
      />

      {/* Supporting Partners */}
      <SplitTextSection
        loading={isLoading}
        content={t('cleanAirSite.membership.supportingPartners.subText')}
        title={t('cleanAirSite.membership.supportingPartners.title')}
        lists={supportPartners}
        bgColor="#FFFFFF"
      />

      {/* Register Membership */}
      <RegisterSection link="https://docs.google.com/forms/d/e/1FAIpQLScIPz7VrhfO2ifMI0dPWIQRiGQ9y30LoKUCT-DDyorS7sAKUA/viewform" />
    </div>
  );
};

export default CleanAirPartners;
