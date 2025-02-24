import React from 'react';
import { SplitTextSection } from 'components/CleanAir';
import { useTranslation } from 'react-i18next';
import SEO from 'utilities/seo';

const Travel = ({ vaccinationDetails, support, visaDetails, accommodation }) => {
  const { t } = useTranslation();
  return (
    <>
      {/* SEO */}
      <SEO
        title="Travel Information for CLEAN-Air Forum"
        siteTitle="AirQo Africa"
        description="Find comprehensive travel information for attending the CLEAN-Air Forum. Get details on accommodation, transportation, and local attractions to make your participation in this key air quality event seamless."
        canonicalUrl="https://airqo.africa/clean-air/forum#travel"
        article={false}
        keywords="CLEAN-Air Forum travel, conference accommodation, African cities transport, environmental event logistics"
      />

      {/* Vaccination Section */}
      {vaccinationDetails && (
        <>
          <div className="separator" />
          <section className="about travel">
            <SplitTextSection
              lists={[]}
              content={<div dangerouslySetInnerHTML={{ __html: vaccinationDetails }} />}
              title={<h2 className="section_title">{t('cleanAirSite.Forum.sections.travel')}</h2>}
              bgColor="#FFFFFF"
            />
          </section>
        </>
      )}

      {/* Visa Section */}
      {visaDetails && (
        <>
          <div className="separator" />
          <section className="about travel">
            <SplitTextSection
              lists={[]}
              content={<div dangerouslySetInnerHTML={{ __html: visaDetails }} />}
              title={<h2 className="section_title">{t('cleanAirSite.Forum.sections.visa')}</h2>}
              bgColor="#FFFFFF"
            />
          </section>
        </>
      )}

      {/* Accommodation section */}
      {accommodation && (
        <>
          <div className="separator" />
          <section className="about travel">
            <SplitTextSection
              lists={[]}
              content={<div dangerouslySetInnerHTML={{ __html: accommodation }} />}
              title={
                <h2 className="section_title">{t('cleanAirSite.Forum.sections.accommodation')}</h2>
              }
              bgColor="#FFFFFF"
            />
          </section>
        </>
      )}

      {/* Support section */}
      {support && support.length > 0 && (
        <>
          <div className="separator" />
          <section className="about support">
            <SplitTextSection
              lists={[]}
              content={
                <div className="engagements_list">
                  {support.map((support) => (
                    <div key={support.id}>
                      <h3>{support.query}</h3>
                      <p>{support.name}</p>
                      <p>{support.role}</p>
                      <a href={`mailto:${support.email}`}>{support.email}</a>
                    </div>
                  ))}
                </div>
              }
              title={
                <h2
                  className="section_title"
                  dangerouslySetInnerHTML={{ __html: t('cleanAirSite.Forum.sections.support') }}
                />
              }
              bgColor="#FFFFFF"
            />
          </section>
        </>
      )}

      {/* if both are empty */}
      {!vaccinationDetails && visaDetails && support.length === 0 && (
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

export default Travel;
