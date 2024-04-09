import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Profile from 'components/Profile';

const ITEMS_PER_PAGE = 6;

const CommitteePage = ({ committee, sectionText }) => {
  const { t } = useTranslation();

  const [isExpanded, setIsExpanded] = useState(false);

  // Display logic for committee and speakers
  const displayedCommittee = isExpanded ? committee : committee?.slice(0, ITEMS_PER_PAGE);
  return (
    <>
      {committee && committee.length > 0 && (
        <>
          <div className="separator" />
          <section className="speakers">
            <h2 style={{ marginBottom: '20px' }} className="section_title">
              {t('cleanAirSite.Forum.sections.committee')}
            </h2>
            {sectionText && <div dangerouslySetInnerHTML={{ __html: sectionText }} />}
            <div className="AboutUsPage__pictorial">
              {displayedCommittee.map((profile) => (
                <div key={profile.id}>
                  <Profile
                    name={profile.name}
                    title={profile.title}
                    ImgPath={profile.picture}
                    htmlBio={profile.bio_html}
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
    </>
  );
};

export default CommitteePage;
