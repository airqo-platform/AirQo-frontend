import React, { useState } from 'react';
import Profile from 'components/CleanAir/profile/Profile';
import { useTranslation } from 'react-i18next';
import SEO from 'utilities/seo';

const ITEMS_PER_PAGE = 6;

const Speakers = ({ speakers, sectionText, keyNoteSpeakers }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const displayedSpeakers = isExpanded ? speakers : speakers?.slice(0, ITEMS_PER_PAGE);
  const displayedKeyNoteSpeakers = isExpanded
    ? keyNoteSpeakers
    : keyNoteSpeakers?.slice(0, ITEMS_PER_PAGE);
  return (
    <>
      {/* SEO */}
      <SEO
        title="CLEAN-Air Forum Speakers"
        siteTitle="AirQo Africa"
        description="Get to know the influential speakers and thought leaders presenting at the CLEAN-Air Forum. Discover insights from experts in air quality management, environmental policy, and urban health in Africa."
        canonicalUrl={[
          'https://airqo.africa/clean-air/forum#speakers',
          'https://airqo.net/clean-air/forum#speakers',
          'https://airqo.mak.ac.ug/clean-air/forum#speakers'
        ]}
        article={false}
        keywords="CLEAN-Air Forum presenters, air quality experts, environmental speakers, African urban health leaders"
      />

      <div className="separator" />
      {sectionText && (
        <div className="sub_text_intro_details">
          <div dangerouslySetInnerHTML={{ __html: sectionText }} />
        </div>
      )}

      {keyNoteSpeakers && keyNoteSpeakers.length > 0 && (
        <>
          <section className="speakers">
            <h2 style={{ marginBottom: '20px' }} className="section_title">
              {t('cleanAirSite.Forum.sections.speakers.title2')}
            </h2>
            <div className="AboutUsPage__pictorial">
              {displayedKeyNoteSpeakers.map((profile) => (
                <div key={profile.id}>
                  <Profile
                    name={
                      profile.name.length > 28 ? `${profile.name.slice(0, 28)}....` : profile.name
                    }
                    title={
                      profile.title.length > 30
                        ? `${profile.title.slice(0, 30)}....`
                        : profile.title
                    }
                    cardTitle={profile.title}
                    category="speaker"
                    ImgPath={profile.picture}
                    htmlBio={profile.bio_html}
                    readBioBtn={true}
                    twitter_forum={profile.twitter}
                    linkedin_forum={profile.linked_in}
                  />
                </div>
              ))}
              {speakers.length > ITEMS_PER_PAGE && (
                <div className="showMoreLessBtn">
                  <button onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? 'Show Less' : 'Show More'}
                  </button>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {speakers && speakers.length > 0 && (
        <>
          <div className="separator" />
          <section className="speakers">
            <h2 style={{ marginBottom: '20px' }} className="section_title">
              {t('cleanAirSite.Forum.sections.speakers.title1')}
            </h2>
            <div className="AboutUsPage__pictorial">
              {displayedSpeakers.map((profile) => (
                <div key={profile.id}>
                  <Profile
                    name={
                      profile.name.length > 28 ? `${profile.name.slice(0, 28)}....` : profile.name
                    }
                    title={
                      profile.title.length > 30
                        ? `${profile.title.slice(0, 30)}....`
                        : profile.title
                    }
                    cardTitle={profile.title}
                    ImgPath={profile.picture}
                    htmlBio={profile.bio_html}
                    readBioBtn={true}
                    twitter_forum={profile.twitter}
                    linkedin_forum={profile.linked_in}
                  />
                </div>
              ))}
              {speakers.length > ITEMS_PER_PAGE && (
                <div className="showMoreLessBtn">
                  <button onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? 'Show Less' : 'Show More'}
                  </button>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {speakers &&
        speakers.length === 0 &&
        keyNoteSpeakers &&
        keyNoteSpeakers.length === 0 &&
        sectionText === '' && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              textAlign: 'center',
              alignItems: 'center',
              height: '50vh'
            }}>
            {t('cleanAirSite.Forum.sections.speakers.No_data')}
          </div>
        )}
    </>
  );
};

export default Speakers;
