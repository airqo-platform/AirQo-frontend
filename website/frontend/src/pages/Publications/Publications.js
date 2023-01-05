import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useInitScrollTop } from 'utils/customHooks';
import SEO from 'utils/seo';
import { loadPublicationsData } from '../../../reduxStore/Publications/operations';
import { usePublicationsData } from '../../../reduxStore/Publications/selectors';
import Page from '../Page';
import CardComponent from './CardComponent';
import ReportComponent from './ReportComponent';

const PublicationsPage = () => {
  useInitScrollTop();
  const [selectedTab, setSelectedTab] = useState('All');
  const onClickTabItem = (tab) => setSelectedTab(tab);

  const dispatch = useDispatch();
  const publicationsData = usePublicationsData();

  useEffect(() => {
    dispatch(loadPublicationsData());
  }, [publicationsData.length]);

  return (
    <Page>
      <div className="list-page">
        <SEO
          title="Publications"
          siteTitle="AirQo Publications"
          description="AirQo drives research conversations in the air quality space"
        />
        <div className="page-header">
          <div className="content">
            <div className="title-wrapper">
              <h2>Publications</h2>
              <span className="sub-title">
                Discover our latest collection of research publications
              </span>
            </div>
          </div>
        </div>
        <div className="page-body">
          <div className="content">
            <div className="nav">
              <span id="tab1">
                <button
                  className={selectedTab === 'All' ? 'selected' : 'unselected'}
                  onClick={() => onClickTabItem('All')}>
                  All
                </button>
              </span>
              <span id="tab2">
                <button
                  className={selectedTab === 'Research' ? 'selected' : 'unselected'}
                  onClick={() => onClickTabItem('Research')}>
                  Research Publications
                </button>
              </span>
              <span id="tab3">
                <button
                  className={selectedTab === 'Reports' ? 'selected' : 'unselected'}
                  onClick={() => onClickTabItem('Reports')}>
                  Technical reports and Policy documents
                </button>
              </span>
            </div>
            {selectedTab === 'All' ? (
              publicationsData.map((publication) => (
                <div className="press-cards-lg">
                  <div className="card-lg">
                    <CardComponent
                      title={publication.title}
                      authors={publication.authors}
                      link={publication.link}
                      linkTitle={publication.link_title}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div />
            )}
            {selectedTab === 'Research' ? (
              publicationsData
                .filter((publication) => publication.category === 'research')
                .map((publication) => (
                  <div className="press-cards-lg">
                    <div className="card-lg">
                      <CardComponent
                        title={publication.title}
                        authors={publication.authors}
                        link={publication.link}
                        linkTitle={publication.link_title}
                      />
                    </div>
                  </div>
                ))
            ) : (
              <div />
            )}
            {selectedTab === 'Reports' ? (
              publicationsData
                .filter((publication) => publication.category === 'technical' || publication.category === 'policy')
                .map((publication) => (
                  <ReportComponent
                    title={publication.title}
                    authors={publication.authors}
                    link={publication.link}
                    linkTitle={publication.link_title}
                  />
                ))
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
    </Page>
  );
};

export default PublicationsPage;
