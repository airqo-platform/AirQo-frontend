import React, { useState } from 'react';
import Profile from 'components/Profile';
import { useTranslation, Trans } from 'react-i18next';

const ITEMS_PER_PAGE = 6;

const Speakers = ({ speakers, sectionText }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const displayedSpeakers = isExpanded ? speakers : speakers?.slice(0, ITEMS_PER_PAGE);
  return (
    <>
      {speakers && speakers.length > 0 ? (
        <>
          <div className="separator" />
          <section className="speakers">
            <h2 style={{ marginBottom: '20px' }} className="section_title">
              {t('cleanAirSite.Forum.sections.speakers.title')}
            </h2>
            {sectionText && <div dangerouslySetInnerHTML={{ __html: sectionText }} />}
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
      ) : (
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
