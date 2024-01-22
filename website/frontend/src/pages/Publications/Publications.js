import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useInitScrollTop } from 'utilities/customHooks';
import SEO from 'utilities/seo';
import { loadPublicationsData } from '../../../reduxStore/Publications/operations';
import { usePublicationsData } from '../../../reduxStore/Publications/selectors';
import Page from '../Page';
import CardComponent from './CardComponent';
import Pagination from './Pagination';
import ReportComponent from './ReportComponent';
import { useTranslation } from 'react-i18next';

const PublicationsPage = () => {
  useInitScrollTop();
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState('Research');
  const onClickTabItem = (tab) => setSelectedTab(tab);

  const dispatch = useDispatch();
  const publicationsData = usePublicationsData();
  const ResearchData = publicationsData.filter(
    (publication) => publication.category === 'research'
  );
  const ReportsData = publicationsData.filter(
    (publication) => publication.category === 'technical' || publication.category === 'policy'
  );
  const GuidesData = publicationsData.filter(
    (publication) => publication.category === 'guide' || publication.category === 'manual'
  );

  const [currentpage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const lastItem = currentpage * itemsPerPage;
  const firstItem = lastItem - itemsPerPage;
  const currentResearch = ResearchData.slice(firstItem, lastItem);
  const currentReports = ReportsData.slice(firstItem, lastItem);
  const currentGuides = GuidesData.slice(firstItem, lastItem);
  const totalResearch = ResearchData.length;
  const totalReports = ReportsData.length;
  const totalGuides = GuidesData.length;
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    dispatch(loadPublicationsData());
  }, [publicationsData.length]);

  return (
    <Page>
      <div className="list-page">
        <SEO
          title="Publications"
          siteTitle="AirQo Publications"
          description="Discover AirQo's latest collection of research publications"
        />
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
                    onClickTabItem('Research');
                  }}>
                  {t('about.publications.subNav.research')}
                </button>
              </span>
              <span id="tab2">
                <button
                  className={selectedTab === 'Reports' ? 'selected' : 'unselected'}
                  onClick={() => {
                    paginate(1);
                    onClickTabItem('Reports');
                  }}>
                  {t('about.publications.subNav.reports')}
                </button>
              </span>
              <span id="tab3">
                <button
                  className={selectedTab === 'Guides' ? 'selected' : 'unselected'}
                  onClick={() => {
                    paginate(1);
                    onClickTabItem('Guides');
                  }}>
                  {t('about.publications.subNav.guides')}
                </button>
              </span>
            </div>
          </div>
        </div>
        <div className="page-body">
          <div className="content">
            {selectedTab === 'Research' ? (
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
            (selectedTab === 'Research' && totalResearch) ||
            (selectedTab === 'Reports' && totalReports) ||
            (selectedTab === 'Guides' && totalGuides)
          }
          paginate={paginate}
        />
      </div>
    </Page>
  );
};

export default PublicationsPage;
