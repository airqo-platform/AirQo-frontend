import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useInitScrollTop } from 'utilities/customHooks';
import SEO from 'utilities/seo';
import {
  usePublicationsData,
  usePublicationsLoadingData
} from '../../../reduxStore/Publications/selectors';
import Page from '../Page';
import CardComponent from './CardComponent';
import Pagination from './Pagination';
import ReportComponent from './ReportComponent';
import { useTranslation } from 'react-i18next';
import { isEmpty } from 'underscore';
import SectionLoader from '../../components/LoadSpinner/SectionLoader';
import { loadPublicationsData } from 'reduxStore/Publications/operations';

const PublicationsPage = () => {
  useInitScrollTop();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [selectedTab, setSelectedTab] = useState('');
  const publicationsData = usePublicationsData();
  const loading = usePublicationsLoadingData();
  const language = useSelector((state) => state.eventsNavTab.languageTab);

  useEffect(() => {
    if (isEmpty(publicationsData)) {
      dispatch(loadPublicationsData());
    }
  }, [dispatch, publicationsData, language]);

  useEffect(() => {
    const url = new URL(window.location);
    const tab = url.searchParams.get('tab');
    if (tab) {
      setSelectedTab(tab);
    }
  }, []);

  useEffect(() => {
    if (selectedTab) {
      const url = new URL(window.location);
      url.searchParams.set('tab', selectedTab);
      window.history.replaceState({}, '', url);
    }
  }, [selectedTab]);

  const filterData = (categories) => {
    return publicationsData.filter((publication) => categories.includes(publication.category));
  };

  const ResearchData = filterData(['research']);
  const ReportsData = filterData(['technical', 'policy']);
  const GuidesData = filterData(['guide', 'manual']);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const paginateData = (data) => {
    const lastItem = currentPage * itemsPerPage;
    const firstItem = lastItem - itemsPerPage;
    return data.slice(firstItem, lastItem);
  };

  const currentResearch = paginateData(ResearchData);
  const currentReports = paginateData(ReportsData);
  const currentGuides = paginateData(GuidesData);

  const totalResearch = ResearchData.length;
  const totalReports = ReportsData.length;
  const totalGuides = GuidesData.length;

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Page>
      <SEO
        title="Publications"
        siteTitle="AirQo Publications"
        description="Discover AirQo's latest collection of research publications"
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
                    onClick={() => {
                      paginate(1);
                      setSelectedTab('Research');
                    }}>
                    {t('about.publications.subNav.research')}
                  </button>
                </span>
                <span id="tab2">
                  <button
                    className={selectedTab === 'Reports' ? 'selected' : 'unselected'}
                    onClick={() => {
                      paginate(1);
                      setSelectedTab('Reports');
                    }}>
                    {t('about.publications.subNav.reports')}
                  </button>
                </span>
                <span id="tab3">
                  <button
                    className={selectedTab === 'Guides' ? 'selected' : 'unselected'}
                    onClick={() => {
                      paginate(1);
                      setSelectedTab('Guides');
                    }}>
                    {t('about.publications.subNav.guides')}
                  </button>
                </span>
              </div>
            </div>
          </div>
          <div className="page-body">
            <div className="content">
              {selectedTab === 'Research' || !selectedTab ? (
                currentResearch.map((publication) => (
                  <div className="press-cards-lg publication">
                    <div className="card-lg">
                      <CardComponent
                        title={publication.title}
                        authors={publication.authors}
                        link={publication.link}
                        linkTitle={publication.link_title}
                        downloadLink={publication.resource_file}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div />
              )}
              {selectedTab === 'Reports' ? (
                currentReports.map((publication) => (
                  <ReportComponent
                    title={publication.title}
                    authors={publication.authors}
                    link={publication.link}
                    linkTitle={publication.link_title}
                    showSecondAuthor={true}
                    resourceFile={publication.resource_file}
                  />
                ))
              ) : (
                <div />
              )}
              {selectedTab === 'Guides' ? (
                currentGuides.map((guide) => (
                  <ReportComponent
                    title={guide.title}
                    authors={guide.authors}
                    link={guide.link}
                    linkTitle={guide.link_title}
                    showSecondAuthor={false}
                    resourceFile={guide.resource_file}
                  />
                ))
              ) : (
                <div />
              )}
            </div>
          </div>
          <Pagination
            itemsPerPage={itemsPerPage}
            totalItems={
              (selectedTab === ('Research' || !selectedTab) && totalResearch) ||
              (selectedTab === 'Reports' && totalReports) ||
              (selectedTab === 'Guides' && totalGuides)
            }
            paginate={paginate}
          />
        </div>
      )}
    </Page>
  );
};

export default PublicationsPage;
