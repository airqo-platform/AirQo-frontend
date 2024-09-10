import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInitScrollTop } from 'utilities/customHooks';
import { loadCareersListingData, loadCareersDepartmentsData } from 'reduxStore/Careers';
import { useDispatch, useSelector } from 'react-redux';
import Page from './Page';
import { groupBy } from 'underscore';
import SectionLoader from '../components/LoadSpinner/SectionLoader';
import SEO from 'utilities/seo';
import { useTranslation, Trans } from 'react-i18next';
import CareerImage from 'src/icons/careers/careers.webp';

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

  let careerListing = [];
  let departments = [];
  let loading = false;
  let groupedListing = {};
  let language = '';

  try {
    careerListing = useSelector((state) => state.careersData.listing);
    departments = useSelector((state) => state.careersData.departments);

    loading = useSelector((state) => state.careersData.loading);
    groupedListing = groupBy(Object.values(careerListing), (v) => v['department']['name']);
    language = useSelector((state) => state.eventsNavTab.languageTab);
  } catch (error) {
    console.error('An error occurred while fetching data: ', error);
  }

  const [groupedKeys, setGroupedKeys] = useState(Object.keys(groupedListing));
  const [selectedTag, setSelectedTag] = useState('all');

  const filterGroups = (value) => {
    setSelectedTag(value);
    if (groupedListing) {
      const allKeys = Object.keys(groupedListing);
      if (value === 'all') return setGroupedKeys(allKeys);
      return setGroupedKeys(allKeys.filter((v) => v === value));
    }
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
    try {
      setGroupedKeys(Object.keys(groupedListing));
      dispatch(loadCareersListingData());
      dispatch(loadCareersDepartmentsData());
    } catch (error) {
      console.error('An error occurred while dispatching data: ', error);
    }
  }, [language]);

  return (
    <Page>
      <div className="CareersPage">
        <SEO
          title="Careers"
          siteTitle="AirQo"
          description="Be part of a team pioneering air quality monitoring in Africa. Together, we work passionately towards our vision for Clean Air for all African Cities."
        />
        <div
          className="careers-banner"
          style={{
            backgroundImage: `url(${CareerImage})`
          }}>
          <div className="text-container">
            <div className="sub-text">{t('about.careers.header.breadCrumb')}</div>
            <div className="main-text">{t('about.careers.header.title')}</div>
            <div className="text-brief">{t('about.careers.header.subText')}</div>
          </div>
        </div>

        {loading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '50vh'
            }}>
            <SectionLoader />
          </div>
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

                  if (!departmentListing) {
                    return null;
                  }

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
