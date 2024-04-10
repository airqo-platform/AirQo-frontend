import React from 'react';
import { SplitTextSection } from 'components/CleanAir';
import { useTranslation, Trans } from 'react-i18next';

const Travel = ({ travelLogistics, support }) => {
  const { t } = useTranslation();
  return (
    <>
      {travelLogistics && (
        <>
          <div className="separator" />
          <section className="about travel">
            <SplitTextSection
              lists={[]}
              content={<div dangerouslySetInnerHTML={{ __html: travelLogistics }} />}
              title={<h2 className="section_title">{t('cleanAirSite.Forum.sections.travel')}</h2>}
              bgColor="#FFFFFF"
            />
          </section>
        </>
      )}

      {support && support.length > 0 && (
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
            title={<h2 className="section_title">{t('cleanAirSite.Forum.sections.support')}</h2>}
            bgColor="#FFFFFF"
          />
        </section>
      )}

      {/* if both are empty */}
      {!travelLogistics && support.length === 0 && (
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

export default Travel;
