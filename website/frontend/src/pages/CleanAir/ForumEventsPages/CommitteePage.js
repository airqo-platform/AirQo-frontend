import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Profile from 'components/CleanAir/profile/Profile';
import SEO from 'utilities/seo';

const ITEMS_PER_PAGE = 6;

const CommitteePage = ({ committee, sectionText }) => {
  const { t } = useTranslation();

  const [isExpanded, setIsExpanded] = useState(false);

  // Display logic for committee and speakers
  const displayedCommittee = isExpanded
    ? committee
    : committee?.slice(0, ITEMS_PER_PAGE);
  return (
    <>
      {/* SEO */}
      <SEO
        title="Committee of CLEAN-Air Forum"
        siteTitle="CLEAN-Air Forum"
        description="Meet the committee members driving the discussions on air quality management at the CLEAN-Air Forum."
      />

      <div className="separator" />
      <h2 style={{ marginBottom: '20px' }} className="section_title">
        {t('cleanAirSite.Forum.sections.committee')}
      </h2>
      {sectionText && (
        <div className="sub_text_intro_details">
          <div dangerouslySetInnerHTML={{ __html: sectionText }} />
        </div>
      )}

      {committee && committee.length > 0 ? (
        <>
          <section className="speakers">
            <div className="AboutUsPage__pictorial">
              {displayedCommittee.map((profile) => (
                <div key={profile.id}>
                  <Profile
                    name={
                      profile.name.length > 28
                        ? `${profile.name.slice(0, 28)}....`
                        : profile.name
                    }
                    title={
                      profile.title.length > 30
                        ? `${profile.title.slice(0, 30)}....`
                        : profile.title
                    }
                    cardTitle={profile.title}
                    category="Programme Committee"
                    ImgPath={profile.picture}
                    htmlBio={profile.bio_html}
                    readBioBtn={true}
                    twitter_forum={profile.twitter}
                    linkedin_forum={profile.linked_in}
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
      ) : (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            textAlign: 'center',
            alignItems: 'center',
            height: '50vh',
          }}
        >
          {t('cleanAirSite.Forum.sections.speakers.No_data')}
        </div>
      )}
    </>
  );
};

export default CommitteePage;
