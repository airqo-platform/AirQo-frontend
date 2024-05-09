import React from 'react';
import { SplitTextSection } from 'components/CleanAir';
import { useTranslation } from 'react-i18next';

const Glossary = ({ glossaryDetails }) => {
  const { t } = useTranslation();
  return (
    <>
      {glossaryDetails ? (
        <>
          <div className="separator" />
          <section className="about travel">
            <SplitTextSection
              lists={[]}
              content={<div dangerouslySetInnerHTML={{ __html: glossaryDetails }} />}
              title={<h2 className="section_title">{t('cleanAirSite.Forum.sections.glossary')}</h2>}
              bgColor="#FFFFFF"
            />
          </section>
          <div className="separator" />
        </>
      ) : (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh'
          }}>
          {t('cleanAirSite.Forum.sections.about.No_data')}
        </div>
      )}
    </>
  );
};

export default Glossary;
