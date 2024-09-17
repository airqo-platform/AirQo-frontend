import React from 'react';
import { SplitTextSection } from 'components/CleanAir';
import { useTranslation } from 'react-i18next';
import SEO from 'utilities/seo';

const Index = ({ engagements, forumEvents }) => {
  const { t } = useTranslation();
  return (
    <>
      {/* SEO */}
      <SEO
        title="About CLEAN-Air Forum"
        siteTitle="AirQo Africa"
        description="Learn about the CLEAN-Air Forum, a pioneering platform fostering critical discussions and collaborations on air quality management across Africa. Discover our mission, objectives, and impact on urban environmental policies."
        canonicalUrl={[
          'https://airqo.africa/clean-air/forum#about',
          'https://airqo.net/clean-air/forum#about',
          'https://airqo.mak.ac.ug/clean-air/forum#about'
        ]}
        keywords="CLEAN-Air Forum mission, air quality initiatives, African environmental policy, urban health collaboration"
        article={false}
      />
      {/* Introduction section */}
      {forumEvents[0].introduction_html && (
        <>
          <div className="separator" />
          <section className="about">
            <div className="intro">
              <div
                dangerouslySetInnerHTML={{
                  __html: forumEvents.length > 0 && forumEvents[0].introduction_html
                }}
              />
            </div>
          </section>
        </>
      )}

      {/* Engagements section */}
      {engagements && engagements.objectives.length > 0 && (
        <>
          <section className="about">
            <SplitTextSection
              lists={[]}
              content={
                <div className="engagements_list">
                  {engagements.objectives.map((objective) => (
                    <div key={objective.id}>
                      {/* <h3>{objective.title}</h3> */}
                      <p>{objective.details}</p>
                    </div>
                  ))}
                </div>
              }
              title={<h2 className="section_title">{engagements.title}</h2>}
              bgColor="#FFFFFF"
            />
          </section>
        </>
      )}

      {/* Sponsorship Opportunities section */}
      {forumEvents[0].sponsorship_opportunities_about_html && (
        <>
          <div className="separator" />
          <section className="about registration">
            <SplitTextSection
              lists={[]}
              content={
                <div className="engagements_list">
                  <div>
                    <div
                      dangerouslySetInnerHTML={{
                        __html:
                          forumEvents.length > 0 &&
                          forumEvents[0].sponsorship_opportunities_about_html
                      }}
                    />
                  </div>
                </div>
              }
              title={
                <h2
                  className="section_title"
                  dangerouslySetInnerHTML={{ __html: t('cleanAirSite.Forum.sections.sponsorship') }}
                />
              }
              bgColor="#FFFFFF"
            />
          </section>
        </>
      )}

      {/* Sponsorship Packages section */}
      {forumEvents[0].sponsorship_packages_html && (
        <>
          <div className="separator" />
          <section className="about registration">
            <SplitTextSection
              lists={[]}
              content={
                <div className="engagements_list">
                  <div>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: forumEvents.length > 0 && forumEvents[0].sponsorship_packages_html
                      }}
                    />
                  </div>
                </div>
              }
              title={
                <h2
                  className="section_title"
                  dangerouslySetInnerHTML={{
                    __html: t('cleanAirSite.Forum.sections.sponsorship_package')
                  }}
                />
              }
              bgColor="#FFFFFF"
            />
          </section>
        </>
      )}

      <div className="separator" />
    </>
  );
};

export default Index;
