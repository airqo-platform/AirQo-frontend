import React from 'react';
import { SplitTextSection } from 'components/CleanAir';
import { useTranslation } from 'react-i18next';
import SEO from 'utilities/seo';

const Glossary = ({ glossaryDetails }) => {
  const { t } = useTranslation();
  return (
    <>
      {/* SEO */}
      <SEO
        title="Air Quality Management Glossary - CLEAN-Air Forum"
        siteTitle="AirQo Africa"
        description="Access a comprehensive glossary of air quality management terms curated by the CLEAN-Air Forum. Enhance your understanding of key concepts in environmental science and urban health specific to African contexts."
        canonicalUrl="https://airqo.africa/clean-air/forum#glossary"
        article={false}
        keywords="air quality terminology, environmental science glossary, urban health definitions, African air pollution terms"
      />

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
