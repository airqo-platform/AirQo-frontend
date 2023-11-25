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

const CleanAirPartners = () => {
  useInitScrollTop();
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

      <div className="partners">
        <div className="partners-wrapper">
          <p className="partners-intro">
            The CLEAN-Air Network is a multi-regional network, strengthening cross-regional
            collaborations and partnerships to enable collective learning and knowledge sharing.
            <br />
            <br />
            We have a growing list of partners from diverse disciplines across different parts of
            the world, reflecting the multidisciplinarity of tackling urban air pollution.
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
              Leveraging the unique expertise and resources of implementing partners to advance
              capacity for air quality management in Africa.
            </h2>
          </div>
        </div>

        <SplitSection
          content="  <p
            style={{
              color: '#353E52',
              fontSize: '24px',
              lineHeight: '32px',
              fontWeight: 400,
              fontStyle: 'normal'
            }}>
            Implementing partners have active interest in air quality work in Africa, have personnel with primary roles in air quality, organize and host engagement activities, participate in CLEAN-Air Network annual meetings and may provide logistical/or funding support to partners.
          </p>"
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
                    Show More
                  </button>
                )}
                {itemsToShow > 8 && (
                  <button
                    className="partners-toggle-button"
                    onClick={() => showLessItems(setItemsToShow, 8, 8)}>
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
              Effective air quality management rooted in evidence-informed action anchors on an
              enabling policy environment.
            </h2>
          </div>
        </div>

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
            The policy forum provides a platform for engagement for African cities and national governments interested in developing and implementing an air quality program.
        </p>
        "
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
                      Show More
                    </button>
                  )}
                  {itemsToShowPolicy > 8 && (
                    <button
                      className="partners-toggle-button"
                      onClick={() => showLessItems(setItemsToShowPolicy, 8, 8)}>
                      Show Less
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
            <h2 className="extra-content ">
              Facilitating private sector-led collaborations for a holistic and sustainable model
              for tackling air pollution
            </h2>
          </div>
        </div>

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
            The private sector forum is a platform for engagement with the private sector players interested in contributing to advancing the air quality agenda. Private sector includes regulated industries, commercial media houses, and any private sector entity operating in Africa. 
        </p>
        "
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
              Leveraging international collaborations for experience sharing and knowledge exchange
              on urban air pollution as a global phenomenon.
            </h2>
          </div>
        </div>

        <SplitSection
          content="<p
            style={{
              color: '#353E52',
              fontSize: '24px',
              lineHeight: '32px',
              fontWeight: 400,
              fontStyle: 'normal'
            }}>
            The CLEAN-Air network is supported by development partners and philanthropic
              organisations, including Google.org, WEHUBIT, and the U.S. Department of State, with
              an established history of pioneering continuous air quality monitoring in data-hungry
              cities through the U.S. Embassies across the world.
              <br/><br/>
            Supporting partners provide logistical and/or funding support to network members, and may participate in activities including the annual CLEAN-Air Network meetings.
          </p>"
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

      <div style={{ marginTop: '60px' }}>
        <SingleSection
          content="
        Individuals actively involved in air quality work in Africa are welcome to join the CLEAN-Air Africa Network."
          btnText={'Register your interest'}
          link="https://docs.google.com/forms/d/e/1FAIpQLScIPz7VrhfO2ifMI0dPWIQRiGQ9y30LoKUCT-DDyorS7sAKUA/viewform"
          bgColor="#F2F1F6"
          btnStyle={{ width: 'auto' }}
        />
      </div>
    </div>
  );
};

export default CleanAirPartners;
