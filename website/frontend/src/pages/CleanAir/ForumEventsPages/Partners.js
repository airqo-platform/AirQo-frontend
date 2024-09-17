import React from 'react';
import { Pagination, usePagination } from 'components/CleanAir/pagination/Pagination';
import { useTranslation, Trans } from 'react-i18next';
import { SplitTextSection } from 'components/CleanAir';
import SEO from 'utilities/seo';

const ITEMS_PER_PAGE = 6;

const Partners = ({
  FundingPartners,
  HostPartner,
  CoConveningPartner,
  sponsorPartners,
  forumEvents
}) => {
  const { t } = useTranslation();
  // Pagination setup for HostPartner
  const { currentItems, currentPage, setCurrentPage, totalPages } = usePagination(
    HostPartner || [],
    ITEMS_PER_PAGE
  );

  return (
    <>
      {/* SEO */}
      <SEO
        title="CLEAN-Air Forum Partners"
        siteTitle="AirQo Africa"
        description="Discover the key partners and collaborators of the CLEAN-Air Forum. Explore how these organizations are working together to improve air quality management and urban health across Africa."
        canonicalUrl={[
          'https://airqo.africa/clean-air/forum#partners',
          'https://airqo.net/clean-air/forum#partners',
          'https://airqo.mak.ac.ug/clean-air/forum#partners'
        ]}
        article={false}
        keywords="CLEAN-Air Forum partnerships, environmental collaborations, air quality initiatives, African environmental organizations"
      />

      <div>
        <div className="separator" />
        <div className="CoConvening_partners">
          <h2 className="section_title">{t('cleanAirSite.Forum.sections.partners.label')}</h2>
          <div>
            {forumEvents[0].partners_text_section_html && (
              <div
                dangerouslySetInnerHTML={{
                  __html: forumEvents[0].partners_text_section_html
                }}></div>
            )}
          </div>
        </div>
        {forumEvents[0].sponsorship_opportunities_partners_html && (
          <div className="CoConvening_partners">
            <h2 className="section_title">
              {t('cleanAirSite.Forum.sections.sponsorship_partners')} 
            </h2>
            <div>
              <div
                dangerouslySetInnerHTML={{
                  __html: forumEvents[0].sponsorship_opportunities_partners_html
                }}></div>
            </div>
          </div>
        )}
      </div>
      <br />

      {/* Co-Convening Partners */}
      {CoConveningPartner && CoConveningPartner.length > 0 ? (
        <>
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
      ) : null}

      {/* Host Partners */}
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
        </>
      )}

      {/* Sponsor Partners */}
      {sponsorPartners && sponsorPartners.length > 0 && (
        <>
          <div className="separator" />
          <section className="Funding_partners">
            <SplitTextSection
              lists={[]}
              content={
                <div className="partners-wrapper">
                  <div className="partner-logos">
                    <div className="grid-container">
                      {sponsorPartners.map((item) => (
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
                  {t('cleanAirSite.Forum.sections.partners.sponsor')}
                </h2>
              }
              bgColor="#FFFFFF"
            />
          </section>
        </>
      )}

      {/* Funding Partners */}
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
            {t('cleanAirSite.Forum.sections.No_data')}
          </div>
        )}
    </>
  );
};

export default Partners;
