import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useInitScrollTop } from 'utilities/customHooks';
import Page from './Page';
import { loadCareersListingData, loadCareersDepartmentsData } from 'reduxStore/Careers/operations';
import { useCareerListingData, useCareerDepartmentsData } from 'reduxStore/Careers/selectors';
import { isEmpty } from 'underscore';
import { groupBy } from 'underscore';
import SectionLoader from '../components/LoadSpinner/SectionLoader';
import SEO from 'utilities/seo';
import { useTranslation, Trans } from 'react-i18next';

const JobListing = ({ title, uniqueTitle, type, key }) => {
  const navigate = useNavigate();
  const onClick = (uniqueTitle) => (event) => {
    event.preventDefault();
    navigate(`/careers/${uniqueTitle}/`);
  };
  return (
    <div className="listing" key={key} onClick={onClick(uniqueTitle)}>
      <span className="title">{title}</span>
      <span className="type">{type}</span>
      <span className="arrow" />
    </div>
  );
};

const DepartmentListing = ({ department, listing }) => {
  return (
    <>
      {listing.length > 0 ? (
        <div className="department">
          {department}({String(listing.length).padStart(2, '0')})
        </div>
      ) : (
        <div></div>
      )}
      {listing.map((job, key) => (
        <JobListing
          key={key}
          title={job.title}
          uniqueTitle={job.unique_title}
          type={job.type.replace('-', ' ')}
        />
      ))}
    </>
  );
};

const CareerPage = () => {
  useInitScrollTop();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const careerListing = useCareerListingData();
  const departments = useCareerDepartmentsData();
  const [loading, setLoading] = useState(false);

  const groupedListing = groupBy(Object.values(careerListing), (v) => v['department']['name']);

  const [groupedKeys, setGroupedKeys] = useState(Object.keys(groupedListing));
  const [selectedTag, setSelectedTag] = useState('all');

  const filterGroups = (value) => {
    setSelectedTag(value);
    const allKeys = Object.keys(groupedListing);
    if (value === 'all') return setGroupedKeys(allKeys);
    return setGroupedKeys(allKeys.filter((v) => v === value));
  };

  const onTagClick = (value) => (event) => {
    event.preventDefault();
    filterGroups(value);
  };

  const selectedTagClassName = (tag) => {
    if (tag === selectedTag) return `tag tag-selected`;
    return `tag`;
  };

  useEffect(() => {
    setLoading(true);
    if (isEmpty(careerListing)) dispatch(loadCareersListingData());
    if (isEmpty(departments)) dispatch(loadCareersDepartmentsData());
    setLoading(false);
  }, []);

  useEffect(() => {
    setLoading(true);
    setGroupedKeys(Object.keys(groupedListing));
    setLoading(false);
  }, [careerListing]);

  return (
    <Page>
      <div className="CareersPage">
        <SEO
          title="Careers"
          siteTitle="AirQo"
          description="Be part of a team pioneering air quality monitoring in Africa. Together, we work passionately towards our vision for Clean Air for all African Cities."
        />
        <div className="careers-banner">
          <div className="text-container">
            <div className="sub-text">{t('about.careers.header.breadCrumb')}</div>
            <div className="main-text">{t('about.careers.header.title')}</div>
            <div className="text-brief">{t('about.careers.header.subText')}</div>
          </div>
        </div>

        {loading ? (
          <SectionLoader />
        ) : (
          <div className="content">
            <div className="container">
              <div className="label">{t('about.careers.categories.label')}</div>
              <div className="tags">
                <span className={selectedTagClassName('all')} onClick={onTagClick('all')}>
                  {t('about.careers.categories.btnText')}
                </span>
                {departments.length > 0 ? (
                  departments.map((department) => (
                    <span
                      className={selectedTagClassName(department.name)}
                      key={department.id}
                      onClick={onTagClick(department.name)}>
                      {department.name}
                    </span>
                  ))
                ) : (
                  <span></span>
                )}
              </div>
              {groupedKeys.length > 0 ? (
                groupedKeys.map((groupedKey) => {
                  const departmentListing = groupedListing[groupedKey];
                  const listing = departmentListing.filter(
                    (job) => new Date(job.closing_date).getTime() >= new Date().getTime()
                  );
                  return (
                    <DepartmentListing
                      department={listing.length > 0 ? groupedKey : null}
                      listing={listing}
                      key={listing.length > 0 ? groupedKey : null}
                    />
                  );
                })
              ) : (
                <div className="no-listing">{t('about.careers.categories.noListing')}</div>
              )}

              <div className="self-intro">
                <span>
                  <Trans i18nKey="about.careers.categories.selfIntro.text">
                    Don’t see a <br />
                    position that fits you perfectly? Introduce yourself here
                  </Trans>
                </span>
                <a href="mailto:careers@airqo.net" className="mail-link">
                  {t('about.careers.categories.selfIntro.cta')}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </Page>
  );
};

export default CareerPage;
