import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useInitScrollTop } from 'utilities/customHooks';
import SEO from 'utilities/seo';
import Page from '../Page';
import CardComponent from './CardComponent';
import Pagination from './Pagination';
import ReportComponent from './ReportComponent';
import { useTranslation } from 'react-i18next';
import { isEmpty } from 'underscore';
import SectionLoader from '../../components/LoadSpinner/SectionLoader';
import { loadPublicationsData } from 'reduxStore/Publications';

const PublicationsPage = () => {
  useInitScrollTop();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // Redux state
  const publicationsData = useSelector((state) => state.publicationsData.publications);
  const loading = useSelector((state) => state.publicationsData.loading);
  const language = useSelector((state) => state.eventsNavTab.languageTab);

  // Pagination settings
  const itemsPerPage = 6;

  // Initialize selectedTab state by checking URL params for 'tab'
  const getInitialTab = () => {
    const url = new URL(window.location);
    const tabParam = url.searchParams.get('tab');
    const allowedTabs = ['Research', 'Reports', 'Guides'];
    return allowedTabs.includes(tabParam) ? tabParam : 'Research';
  };

  const [selectedTab, setSelectedTab] = useState(getInitialTab);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch publications data if it's empty
  useEffect(() => {
    if (isEmpty(publicationsData)) {
      dispatch(loadPublicationsData());
    }
  }, [dispatch, publicationsData, language]);

  // Update URL when tab changes
  useEffect(() => {
    const url = new URL(window.location);
    url.searchParams.set('tab', selectedTab);
    window.history.replaceState({}, '', url);
  }, [selectedTab]);

  // Filter publications by category
  const filterData = (categories) =>
    publicationsData.filter((publication) => categories.includes(publication.category));

  const ResearchData = filterData(['research']);
  const ReportsData = filterData(['technical', 'policy']);
  const GuidesData = filterData(['guide', 'manual']);

  // Pagination logic
  const paginateData = (data) => {
    const lastItem = currentPage * itemsPerPage;
    const firstItem = lastItem - itemsPerPage;
    return data.slice(firstItem, lastItem);
  };

  // Current paginated data for each tab
  const currentResearch = paginateData(ResearchData);
  const currentReports = paginateData(ReportsData);
  const currentGuides = paginateData(GuidesData);

  const totalItems = {
    Research: ResearchData.length,
    Reports: ReportsData.length,
    Guides: GuidesData.length
  };

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
    setCurrentPage(1); // Reset to the first page when switching tabs
  };

  const renderPublications = (publications, Component) =>
    publications.map((publication) => (
      <div key={publication.title} className="press-cards-lg publication">
        <div className="card-lg">
          <Component
            title={publication.title}
            authors={publication.authors}
            link={publication.link}
            linkTitle={publication.link_title}
            downloadLink={publication.resource_file}
          />
        </div>
      </div>
    ));

  return (
    <Page>
      <SEO
        title="Publications"
        siteTitle="AirQo Publications"
        description="Discover AirQo's latest collection of research publications and resources on air quality monitoring and management in Africa."
        canonicalUrl="https://airqo.africa/solutions/resources"
        image="https://airqo.mak.ac.ug/og-image-resources.jpg"
        keywords="air quality publications, research papers, environmental reports, African air quality data"
      />
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
        <div className="list-page">
          <div className="page-header">
            <div className="content">
              <div className="title-wrapper">
                <h2>{t('about.publications.header.title')}</h2>
                <span className="sub-title">{t('about.publications.header.subText')}</span>
              </div>
              <div className="nav">
                <span id="tab1">
                  <button
                    className={selectedTab === 'Research' ? 'selected' : 'unselected'}
                    onClick={() => handleTabChange('Research')}>
                    {t('about.publications.subNav.research')}
                  </button>
                </span>
                <span id="tab2">
                  <button
                    className={selectedTab === 'Reports' ? 'selected' : 'unselected'}
                    onClick={() => handleTabChange('Reports')}>
                    {t('about.publications.subNav.reports')}
                  </button>
                </span>
                <span id="tab3">
                  <button
                    className={selectedTab === 'Guides' ? 'selected' : 'unselected'}
                    onClick={() => handleTabChange('Guides')}>
                    {t('about.publications.subNav.guides')}
                  </button>
                </span>
              </div>
            </div>
          </div>

          <div className="page-body">
            <div className="content">
              {selectedTab === 'Research' && renderPublications(currentResearch, CardComponent)}
              {selectedTab === 'Reports' && renderPublications(currentReports, ReportComponent)}
              {selectedTab === 'Guides' && renderPublications(currentGuides, ReportComponent)}
            </div>
          </div>

          <Pagination
            itemsPerPage={itemsPerPage}
            totalItems={totalItems[selectedTab] || 0}
            paginate={setCurrentPage}
          />
        </div>
      )}
    </Page>
  );
};

export default PublicationsPage;
