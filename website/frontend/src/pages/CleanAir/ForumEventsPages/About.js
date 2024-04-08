import React, { useState } from 'react';
import Profile from 'components/Profile';
import { useTranslation, Trans } from 'react-i18next';
import { SplitTextSection } from 'components/CleanAir';
const ITEMS_PER_PAGE = 6;

const Index = ({ committee, engagements, forumEvents }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  // Display logic for committee and speakers
  const displayedCommittee = isExpanded ? committee : committee?.slice(0, ITEMS_PER_PAGE);
  return (
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
      {engagements && engagements.objectives.length > 0 && (
        <section className="about">
          <SplitTextSection
            lists={[]}
            content={
              <div className="engagements_list">
                {engagements.objectives.map((objective) => (
                  <div key={objective.id}>
                    <h3>{objective.title}</h3>
                    <p>{objective.details}</p>
                  </div>
                ))}
              </div>
            }
            title={<h2 className="section_title">{engagements.title}</h2>}
            bgColor="#FFFFFF"
          />
        </section>
      )}
      {committee && committee.length > 0 && (
        <>
          <div className="separator" />
          <section className="speakers">
            <h2 style={{ marginBottom: '20px' }} className="section_title">
              {t('cleanAirSite.Forum.sections.committee')}
            </h2>
            <div className="AboutUsPage__pictorial">
              {displayedCommittee.map((profile) => (
                <div key={profile.id}>
                  <Profile
                    name={profile.name}
                    title={profile.title}
                    about={profile.biography}
                    ImgPath={profile.picture}
                    readBioBtn={true}
                  />
                </div>
              ))}
              {committee.length > ITEMS_PER_PAGE && (
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

      {/* if both are empty */}
      {committee.length === 0 && engagements && engagements.objectives.length === 0 && (
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

export default Index;
