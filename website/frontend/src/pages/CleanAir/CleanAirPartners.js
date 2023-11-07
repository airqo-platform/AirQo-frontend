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

const CleanAirPartners = () => {
  useInitScrollTop();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const partnersData = usePartnersData();

  useEffect(() => {
    if (isEmpty(partnersData)) {
      dispatch(loadPartnersData());
    }
  }, []);

  const cleanAirPartners = partnersData.filter(
    (partner) => partner.website_category === 'cleanair'
  );

  const implementingPartners = cleanAirPartners.filter((partner) => partner.type === 'network');

  const policyPartners = cleanAirPartners.filter((partner) => partner.type === 'policy');

  const supportPartners = cleanAirPartners.filter((partner) => partner.type === 'support');

  const generatePartnerDataGroup = (partners) => {
    return partners
      .map((e, i) => {
        return i % 4 === 0 ? partners.slice(i, i + 4) : null;
      })
      .filter((e) => {
        return e;
      });
  };

  const supportPartnerDataGroup = generatePartnerDataGroup(supportPartners);
  const policyPartnerDataGroup = generatePartnerDataGroup(policyPartners);

  const onLogoClick = (uniqueTitle) => (event) => {
    event.preventDefault();
    if (uniqueTitle.descriptions.length > 0) {
      navigate(`/partners/${uniqueTitle.unique_title}`);
    } else if (uniqueTitle.partner_link) {
      window.open(uniqueTitle.partner_link, '_blank');
    }
  };

  const [itemsToShow, setItemsToShow] = useState(10);
  const [itemsToShowPolicy, setItemsToShowPolicy] = useState(3);
  const [itemsToShowSupport, setItemsToShowSupport] = useState(3);

  const showMoreItems = (setItems, increment) => {
    setItems((prevState) => prevState + increment);
  };

  const showLessItems = (setItems, decrement, minItems) => {
    setItems((prevState) => (prevState > minItems ? prevState - decrement : minItems));
  };

  return (
    <div>
      <SEO
        title="Partners | CLEAN-Air Africa Network"
        siteTitle="CLEAN-Air Africa Network"
        description="Meet the partners of CLEAN-Air Africa Network, a diverse group of organizations and individuals dedicated to improving air quality across Africa. Join us in our mission to foster innovative air quality solutions and effective air quality management strategies."
      />

      <div className="partners">
        <div className="partners-wrapper">
          <p className="partners-intro">
            The CLEAN-Air Network is a multi-regional network, strengthening cross-regional
            collaborations and strengthening partnerships to enable collective learning and
            knowledge sharing.
            <br />
            <br />
            We have a growing list of partners from diverse disciplines across different parts of
            the world, reflecting the multi-disciplinary nature of tackling the air pollution
            challenge.
          </p>
        </div>
      </div>

      <hr className="separator-1" />

      <SplitSection
        content="  <p
            style={{
              color: '#353E52',
              fontSize: '24px',
              lineHeight: '32px',
              fontWeight: 400,
              fontStyle: 'normal'
            }}>
            Our implementing partners have active interest in air quality work in Africa, have personnel with primary roles on air quality, organizes and host activities, participate in CLEAN-Air Network annual meetings and may provide logistical/or funding support to members.
          </p>"
        showButton={false}
        imgURL={Partner1}
        bgColor="#FFFFFF"
        reverse
      />

      {implementingPartners.length > 0 && (
        <div className="partners AboutUsPage">
          <div className="partners-wrapper wrapper">
            <div className="partners-list">
              {implementingPartners.slice(0, itemsToShow).map((networkPartner) => (
                <div
                  style={{ cursor: 'pointer' }}
                  className="partner-img"
                  key={networkPartner.id}
                  onClick={onLogoClick(networkPartner)}>
                  <img src={networkPartner.partner_logo} alt={networkPartner.partner_name} />
                </div>
              ))}
            </div>
            <div className="partner-logos" id="logo-table">
              {itemsToShow < implementingPartners.length && (
                <button
                  className="partners-toggle-button"
                  onClick={() => showMoreItems(setItemsToShow, 10)}>
                  Show More
                </button>
              )}
              {itemsToShow > 10 && (
                <button
                  className="partners-toggle-button"
                  onClick={() => showLessItems(setItemsToShow, 10, 10)}>
                  Show Less
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <SplitSection
        content="
          <p
            style={{
              color: '#353E52',
              fontSize: '24px',
              lineHeight: '32px',
              fontWeight: 400,
              fontStyle: 'normal'
            }}>
            Our Policy Forum includes any city in Africa interested in implementing an air quality programme.
        </p>
        "
        showButton={false}
        imgURL={Partner2}
        bgColor="#FFFFFF"
        reverse
      />

      {policyPartners.length > 0 && (
        <div className="AboutUsPage">
          <div className="wrapper">
            <div className="partner-logos" id="logo-table">
              <table>
                <tbody>
                  {policyPartnerDataGroup.slice(0, itemsToShowPolicy).map((partnerGroup, key) => (
                    <tr key={key}>
                      {partnerGroup.map((partner) => (
                        <td key={partner.id} onClick={() => onLogoClick(partner)}>
                          <img src={partner.partner_logo} alt={partner.partner_name} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {itemsToShowPolicy < policyPartnerDataGroup.length && (
                <button
                  className="partners-toggle-button"
                  onClick={() => showMoreItems(setItemsToShowPolicy, 3)}>
                  Show More
                </button>
              )}
              {itemsToShowPolicy > 3 && (
                <button
                  className="partners-toggle-button"
                  onClick={() => showLessItems(setItemsToShowPolicy, 3, 3)}>
                  Show Less
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <SplitSection
        content="<p
            style={{
              color: '#353E52',
              fontSize: '24px',
              lineHeight: '32px',
              fontWeight: 400,
              fontStyle: 'normal'
            }}>
            Supporting Partners provide logistical and/or funding support to network members, and may participate in the annual CLEAN-Air Network meetings.
          </p>"
        showButton={false}
        imgURL={Partner3}
        bgColor="#FFFFFF"
        reverse
      />

      {supportPartners.length > 0 && (
        <div className="AboutUsPage">
          <div className="wrapper">
            <div className="partner-logos" id="logo-table">
              <table>
                <tbody>
                  {supportPartnerDataGroup.slice(0, itemsToShowSupport).map((partnerGroup, key) => (
                    <tr key={key}>
                      {partnerGroup.map((partner) => (
                        <td key={partner.id} onClick={() => onLogoClick(partner)}>
                          <img src={partner.partner_logo} alt={partner.partner_name} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {itemsToShowSupport < supportPartnerDataGroup.length && (
                <button
                  className="partners-toggle-button"
                  onClick={() => showMoreItems(setItemsToShowSupport, 3)}>
                  Show More
                </button>
              )}
              {itemsToShowSupport > 3 && (
                <button
                  className="partners-toggle-button"
                  onClick={() => showLessItems(setItemsToShowSupport, 3, 3)}>
                  Show Less
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <SingleSection
        content="
        Individuals actively involved in air quality work in Africa are welcome to join the CLEAN-Air Africa Network."
        btnText={'Register your interest'}
        link="https://docs.google.com/forms/d/e/1FAIpQLScIPz7VrhfO2ifMI0dPWIQRiGQ9y30LoKUCT-DDyorS7sAKUA/viewform"
        bgColor="#F2F1F6"
        btnStyle={{ width: 'auto' }}
      />
    </div>
  );
};

export default CleanAirPartners;
