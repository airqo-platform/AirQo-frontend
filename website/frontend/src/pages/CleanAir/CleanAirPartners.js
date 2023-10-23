import React, { useEffect } from 'react';
import { isEmpty } from 'underscore';
import { useDispatch } from 'react-redux';
import { SplitSection, SingleSection } from 'components/CleanAir';
import { useNavigate } from 'react-router-dom';
import { usePartnersData } from '../../../reduxStore/Partners/selectors';
import { loadPartnersData } from '../../../reduxStore/Partners/operations';
import Partner1 from 'assets/img/cleanAir/partners-sec1.png';
import Partner2 from 'assets/img/cleanAir/partners-sec2.png';
import Partner3 from 'assets/img/cleanAir/partners-sec3.png';

const CleanAirPartners = () => {
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

  const networkPartners = cleanAirPartners.filter((partner) => partner.type === 'network');

  const policyPartners = cleanAirPartners.filter((partner) => partner.type === 'policy');

  const supportPartners = cleanAirPartners.filter((partner) => partner.type === 'support');

  const partnerDataGroup = partnersData
    .map((e, i) => {
      return i % 4 === 0 ? partnersData.slice(i, i + 4) : null;
    })
    .filter((e) => {
      return e;
    });

  const onLogoClick = (uniqueTitle) => (event) => {
    event.preventDefault();
    navigate(`/partners/${uniqueTitle}/`);
  };

  return (
    <div>
      <div className="partners">
        <div className="partners-wrapper">
          <h2 className="partners-intro">
            The CLEAN-Air Network is a multi-regional network, strengthening cross-regional air
            quality networks and fostering partnerships to enable collective learning and knowledge
            sharing. We have a growing list of partners from diverse disciplines across different
            parts of the world, reflecting the multi-disciplinary tackling the air pollution
            challenge.
          </h2>

          <hr className="separator-1" />
        </div>
      </div>

      <SplitSection
        content={
          <p
            style={{
              color: '#353E52',
              fontSize: '24px',
              lineHeight: '32px',
              fontWeight: 400,
              fontStyle: 'normal'
            }}>
            Our Network Partners have active interest in air quality work in Africa, have personnel
            with primary roles on air quality, organize and host activities, participate in
            CLEAN-Air Network annual meetings and may provide logistical/or funding support to
            members.
          </p>
        }
        showButton={false}
        imgURL={Partner1}
        bgColor="#FFFFFF"
        reverse
      />

      {networkPartners.length > 0 && (
        <div className="partners">
          <div className="partners-wrapper">
            <div className="partners-list">
              {partnersData.map((networkPartner) => (
                <div
                  className="partner-img"
                  key={networkPartner.id}
                  onClick={() => navigate(`/partners/${networkPartner.unique_title}`)}>
                  <img src={networkPartner.partner_logo} alt={networkPartner.partner_name} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <SingleSection
        content={
          <p
            style={{
              padding: '0 49px',
              fontSize: '40px',
              fontWeight: 400,
              lineHeight: '48px',
              color: '#353E52'
            }}>
            Individuals actively involved in air quality work in Africa are strongly recommended to
            join the CLEAN-Air Africa Network.
          </p>
        }
        btnText={'Register your interest'}
        link="#"
        bgColor="#F2F1F6"
        btnStyle={{ width: 'auto' }}
      />

      <SplitSection
        content={
          <p
            style={{
              color: '#353E52',
              fontSize: '24px',
              lineHeight: '32px',
              fontWeight: 400,
              fontStyle: 'normal'
            }}>
            Our Policy Forum includes any city in Africa interested in implementing an air quality
            programme.
          </p>
        }
        showButton={false}
        imgURL={Partner2}
        bgColor="#FFFFFF"
        reverse
      />

      <div className="AboutUsPage ">
        <div className="wrapper ">
          <div className="partner-logos" id="logo-table">
            <table>
              <tbody>
                {partnersData.length > 0 &&
                  partnerDataGroup.slice(0, 3).map((partnerGroup, key) => (
                    <tr key={key}>
                      {partnerGroup.map((partner) => (
                        <td key={partner.id} onClick={onLogoClick(partner.unique_title)}>
                          <img src={partner.partner_logo} alt={partner.partner_name} />
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <hr className="separator-1" />
        </div>
      </div>

      <SplitSection
        content={
          <p
            style={{
              color: '#353E52',
              fontSize: '24px',
              lineHeight: '32px',
              fontWeight: 400,
              fontStyle: 'normal'
            }}>
            Supporting Partners provide logistical and/or funding support to network members, and
            may participate in the annual CLEAN-Air Network meetings.
          </p>
        }
        showButton={false}
        imgURL={Partner3}
        bgColor="#FFFFFF"
        reverse
      />

      <div className="AboutUsPage ">
        <div className="wrapper ">
          <div className="partner-logos" id="logo-table">
            <table>
              <tbody>
                {partnersData.length > 0 &&
                  partnerDataGroup.slice(0, 3).map((partnerGroup, key) => (
                    <tr key={key}>
                      {partnerGroup.map((partner) => (
                        <td key={partner.id} onClick={onLogoClick(partner.unique_title)}>
                          <img src={partner.partner_logo} alt={partner.partner_name} />
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleanAirPartners;
