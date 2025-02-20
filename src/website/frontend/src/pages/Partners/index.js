import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PageMini from '../PageMini';
import { useInitScrollTop } from 'utilities/customHooks';
import { useSelector, useDispatch } from 'react-redux';
import { loadPartnersData } from 'reduxStore/Partners';
import { isEmpty } from 'underscore';

const PartnerDetailPage = () => {
  useInitScrollTop();
  const dispatch = useDispatch();
  const { uniqueTitle } = useParams();
  const partnerDetails = useSelector((state) => state.partnersData.partners);
  const partner = partnerDetails.filter((p) => p.unique_title === uniqueTitle) || {};
  const language = useSelector((state) => state.eventsNavTab.languageTab);

  useEffect(() => {
    if (isEmpty(partner)) {
      dispatch(loadPartnersData(language));
    }
  }, [dispatch, language, partner]);

  return (
    <PageMini>
      {partner.length > 0 &&
        partner.map((p) => (
          <div className="DetailPage" key={p.id}>
            <div className="content">
              <div style={{ display: 'flex', flexFlow: 'row reverse', alignItems: 'flex-start' }}>
                <div>
                  <img
                    style={{ maxWidth: '150px', minWidth: '150px', marginRight: '25px' }}
                    src={p.partner_logo}
                    alt={p.partner_name}
                  />
                </div>
                <header className="title">
                  <span style={{ textTransform: 'capitalize' }}>{p.partner_name}</span>
                  <span>{p.type}</span>
                </header>
              </div>
              {(p.descriptions || []).map((pt) => (
                <p className="description" key={pt.id}>
                  {pt.description}
                </p>
              ))}
              {p.partner_link ? (
                <span className="cta-link">
                  <a
                    className="link"
                    href={p.partner_link}
                    target="_blank"
                    rel="noopener noreferrer">
                    Read More {'-->'}
                  </a>
                </span>
              ) : (
                <span />
              )}
              <div style={{ textAlign: 'center', marginTop: '18px' }}>
                <img
                  style={{ maxWidth: '600px', minWidth: '450px' }}
                  src={p.partner_image !== null ? p.partner_image : null}
                />
              </div>
            </div>
          </div>
        ))}
    </PageMini>
  );
};

export default PartnerDetailPage;
