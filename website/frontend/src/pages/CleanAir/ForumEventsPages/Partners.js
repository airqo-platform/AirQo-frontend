import React from 'react';
import { Pagination, usePagination } from 'components/CleanAir/pagination/Pagination';
import { useTranslation, Trans } from 'react-i18next';
import { SplitTextSection } from 'components/CleanAir';

const ITEMS_PER_PAGE = 6;

const Partners = ({ FundingPartners, HostPartner, CoConveningPartner }) => {
  const { t } = useTranslation();
  // Pagination setup for HostPartner
  const { currentItems, currentPage, setCurrentPage, totalPages } = usePagination(
    HostPartner || [],
    ITEMS_PER_PAGE
  );

  return (
    <>
      {CoConveningPartner && CoConveningPartner.length > 0 && (
        <>
          <div className="separator" />
          <section className="CoConvening_partners">
            <SplitTextSection
              lists={[]}
              content={
                <div className="partners-wrapper">
                  <div className="partner-logos">
                    <div className="grid-container">
                      {CoConveningPartner.map((item) => (
                        <a className="cell" key={item.id} href={item.website_link} target="_blank">
                          <img
                            className="logo"
                            src={item.partner_logo}
                            alt={item.name}
                            loading="lazy"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              }
              title={
                <h2 className="section_title">
                  {t('cleanAirSite.Forum.sections.partners.coConvening')}
                </h2>
              }
              bgColor="#FFFFFF"
            />
          </section>
        </>
      )}

      {FundingPartners && FundingPartners.length > 0 && (
        <>
          <div className="separator" />
          <section className="Funding_partners">
            <SplitTextSection
              lists={[]}
              content={
                <div className="partners-wrapper">
                  <div className="partner-logos">
                    <div className="grid-container">
                      {FundingPartners.map((item) => (
                        <a className="cell" key={item.id} href={item.website_link} target="_blank">
                          <img
                            className="logo"
                            src={item.partner_logo}
                            alt={item.name}
                            loading="lazy"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              }
              title={
                <h2 className="section_title">{t('cleanAirSite.Forum.sections.partners.fund')}</h2>
              }
              bgColor="#FFFFFF"
            />
          </section>
        </>
      )}

      {HostPartner && HostPartner.length > 0 && (
        <>
          <div className="separator" />
          <section className="forum_partners">
            <SplitTextSection
              lists={[]}
              content={
                <div style={{}}>
                  <div className="partners-wrapper">
                    <div className="partner-logos">
                      <div className="grid-container">
                        {currentItems.map((item) => (
                          <a
                            className="cell"
                            key={item.id}
                            href={item.website_link}
                            target="_blank">
                            <img
                              className="logo"
                              src={item.partner_logo}
                              alt={item.name}
                              loading="lazy"
                            />
                          </a>
                        ))}
                      </div>

                      <Pagination
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        totalPages={totalPages}
                      />
                    </div>
                  </div>
                </div>
              }
              title={
                <h2 className="section_title">
                  {t('cleanAirSite.Forum.sections.partners.others')}
                </h2>
              }
              bgColor="#FFFFFF"
            />
          </section>
          <div className="separator" />
        </>
      )}

      {/* if both are empty */}
      {CoConveningPartner.length === 0 &&
        FundingPartners.length === 0 &&
        HostPartner.length === 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '50vh'
            }}>
            No content available
          </div>
        )}
    </>
  );
};

export default Partners;
